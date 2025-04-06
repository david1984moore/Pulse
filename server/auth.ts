import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { isValidEmailFormat, validateEmail } from "./utils/email-validator";

// Fix for Express User interface
declare global {
  namespace Express {
    // Use a different name to avoid recursive references
    interface User {
      id: number;
      name: string;
      email: string;
      password: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Export these crypto functions so they can be used in other modules
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Use a strong session secret, preferably from environment variables
  const sessionSecret = process.env.SESSION_SECRET || 
    // If no environment variable, generate a random one (this will change on restart)
    // In production, always use environment variables for secrets
    randomBytes(32).toString('hex');

  const sessionSettings: session.SessionOptions = {
    name: 'pulse.sid', // Change session cookie name from default 'connect.sid'
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    store: storage.sessionStore,
    cookie: {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // Helps prevent CSRF attacks
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Normalize email before lookup
          const normalizedEmail = email.toLowerCase().trim();
          console.log(`Login attempt for email: ${email}, normalized to: ${normalizedEmail}`);
          
          const user = await storage.getUserByEmail(normalizedEmail);
          console.log(`User found: ${!!user}`);
          
          if (!user) {
            console.log('User not found');
            return done(null, false, { message: 'Incorrect email' });
          }
          
          const isPasswordValid = await comparePasswords(password, user.password);
          console.log(`Password valid: ${isPasswordValid}`);
          
          if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect password' });
          }
          
          console.log('Login successful');
          return done(null, user);
        } catch (error) {
          console.error('Login error:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("==========================================================");
      console.log("Registration attempt with request body:", req.body);
      const { name, email, password } = req.body;
      
      // Step 1: Basic format validation (quick check)
      if (!email || !isValidEmailFormat(email)) {
        console.log(`REGISTER API: Email format invalid: '${email}'`);
        return res.status(400).json({ 
          message: "Please enter a valid email address format. Make sure you're using a real email provider." 
        });
      }
      
      // Step 2: Full validation with domain checking
      const validation = await validateEmail(email);
      if (!validation.isValid) {
        console.log(`REGISTER API: Email validation failed: '${email}', reason: ${validation.reason}`);
        return res.status(400).json({ 
          message: `Invalid email: ${validation.reason || 'Please use a valid email address'}`
        });
      }
      
      // Normalize email for consistent handling
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`REGISTER API: Checking if email exists: '${normalizedEmail}'`);
      
      try {
        // With our new database constraint, a simple check is enough
        console.log(`REGISTER API: About to call storage.getUserByEmail with '${normalizedEmail}'`);
        const existingUser = await storage.getUserByEmail(normalizedEmail);
        
        if (existingUser) {
          console.log(`REGISTER API: DUPLICATE EMAIL DETECTED: '${normalizedEmail}' matches existing email: '${existingUser.email}'`);
          return res.status(400).json({ 
            message: "This email is already registered. Choose a different email." 
          });
        }
        
        console.log(`REGISTER API: No duplicates found, proceeding with registration`);
      } catch (checkError) {
        console.error(`REGISTER API: Error checking for existing email:`, checkError);
        // Try to continue with registration, but the database constraint will prevent duplicates
      }

      const hashedPassword = await hashPassword(password);
      
      try {
        // Create new user with empty values and normalized email
        const user = await storage.createUser({
          name,
          email: normalizedEmail, // Always store normalized email
          password: hashedPassword,
        });
        
        // No sample data will be created for new users
        // This ensures all values start at 0 on the dashboard
  
        req.login(user, (err) => {
          if (err) return next(err);
          return res.status(201).json(user);
        });
      } catch (createError: any) {
        console.error("REGISTER API: Error creating user:", createError);
        
        // Check if this is a duplicate key error (unique constraint violation)
        if (createError.code === '23505' && createError.constraint.includes('email')) {
          return res.status(400).json({ 
            message: "This email is already registered. Choose a different email." 
          });
        }
        
        // For any other errors, pass to global error handler
        next(createError);
      }
    } catch (error) {
      console.error("REGISTER API: Error in registration process:", error);
      next(error);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    const { email } = req.body;
    
    // Basic email validation - for login, we're less strict as the account would have
    // already been validated during registration
    if (!email || !isValidEmailFormat(email)) {
      return res.status(400).json({ 
        message: "Please enter a valid email address format" 
      });
    }
    
    // Normalize email for consistent comparison with stored emails
    const normalizedEmail = email.toLowerCase().trim();
    req.body.email = normalizedEmail;
    console.log(`Login attempt with normalized email: ${normalizedEmail}`);
    
    try {
      // Check if account is locked
      const isLocked = await storage.checkUserLocked(normalizedEmail);
      if (isLocked) {
        console.log(`Login attempt blocked - account is locked: ${normalizedEmail}`);
        return res.status(429).json({
          success: false,
          message: "Account is temporarily locked due to too many failed login attempts. Please try again later or reset your password."
        });
      }
      
      // Proceed with authentication
      passport.authenticate("local", async (err: any, user: Express.User | false, info: any) => {
        console.log("Login attempt result:", { err, user: !!user, info });
        
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        
        if (!user) {
          // Failed login attempt, increment login attempts counter
          try {
            const attempts = await storage.updateLoginAttempts(normalizedEmail, true);
            console.log(`Failed login for ${normalizedEmail}, attempts now: ${attempts}`);
            
            // Lock account after 5 failed attempts
            if (attempts >= 5) {
              // Lock account for 15 minutes
              await storage.lockUserAccount(normalizedEmail, 15);
              console.log(`Account ${normalizedEmail} locked for 15 minutes due to too many failed attempts`);
              
              return res.status(429).json({
                success: false,
                message: "Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes or reset your password."
              });
            }
            
            return res.status(401).json({
              success: false,
              message: info?.message || "Invalid email or password"
            });
          } catch (countError) {
            console.error("Error tracking login attempts:", countError);
            // Proceed with regular error message even if tracking failed
            return res.status(401).json({
              success: false,
              message: info?.message || "Invalid email or password"
            });
          }
        }
        
        // Successful login
        req.login(user, async (loginErr) => {
          if (loginErr) {
            console.error("Session save error:", loginErr);
            return next(loginErr);
          }
          
          try {
            // Reset login attempts and update last login time
            await storage.updateLoginAttempts(normalizedEmail, false);
            await storage.updateLastLogin(user.id);
            
            console.log("Login successful, user:", user.email);
            return res.status(200).json(user);
          } catch (updateError) {
            console.error("Error updating login timestamps:", updateError);
            // Return success even if tracking failed
            return res.status(200).json(user);
          }
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login security check error:", error);
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Password reset request
  app.post("/api/password-reset/request", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      // Validate email
      if (!email || !isValidEmailFormat(email)) {
        return res.status(400).json({ 
          message: "Please enter a valid email address format" 
        });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if user exists
      const user = await storage.getUserByEmail(normalizedEmail);
      
      if (!user) {
        // Don't reveal that email doesn't exist for security reasons
        // Instead, return a success message and stop processing
        return res.status(200).json({
          success: true,
          message: "If your email is registered, you will receive a password reset link shortly."
        });
      }
      
      // Create reset token
      const token = await storage.createPasswordResetToken(normalizedEmail);
      
      if (!token) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate reset token. Please try again later."
        });
      }
      
      // In a real app, we would send an email with a link to reset password
      // For this implementation, just return the token directly (only for development)
      console.log(`PASSWORD RESET: Generated token for ${normalizedEmail}: ${token}`);
      
      // Unlock the account if it was locked
      await storage.unlockUserAccount(normalizedEmail);
      
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a password reset link shortly.",
        // Include the reset URL for testing
        // In a production app, we would never send this in the response
        debugResetUrl: `/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${token}`
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      next(error);
    }
  });
  
  // Password reset verification & update
  app.post("/api/password-reset/update", async (req, res, next) => {
    try {
      const { email, token, newPassword } = req.body;
      
      // Validate input
      if (!email || !token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: email, token, or new password"
        });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if token is valid
      const isValidToken = await storage.validatePasswordResetToken(normalizedEmail, token);
      
      if (!isValidToken) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired password reset token"
        });
      }
      
      // Update password
      const passwordUpdated = await storage.resetPassword(normalizedEmail, newPassword);
      
      if (!passwordUpdated) {
        return res.status(500).json({
          success: false,
          message: "Failed to update password. Please try again later."
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Password successfully reset. You can now log in with your new password."
      });
    } catch (error) {
      console.error("Password reset update error:", error);
      next(error);
    }
  });
  
  // Email verification simulation
  app.get("/api/verify", async (req, res) => {
    const email = req.query.email as string;
    
    // Complete email validation with both format and domain check
    if (!email || !isValidEmailFormat(email)) {
      return res.status(400).json({ 
        message: "Please enter a valid email address format" 
      });
    }
    
    // Perform full validation
    const validation = await validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: `Invalid email: ${validation.reason || 'Please use a valid email address'}`
      });
    }
    
    // In a real app, we would verify the token, but for the simulation we'll just redirect
    res.redirect("/dashboard");
  });
}
