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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pulse-finance-app-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
          console.log(`Login attempt for email: ${email}`);
          const user = await storage.getUserByEmail(email);
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
      const { name, email, password } = req.body;
      
      // Step 1: Basic format validation (quick check)
      if (!email || !isValidEmailFormat(email)) {
        return res.status(400).json({ 
          message: "Please enter a valid email address format. Make sure you're using a real email provider." 
        });
      }
      
      // Step 2: Full validation with domain checking
      const validation = await validateEmail(email);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: `Invalid email: ${validation.reason || 'Please use a valid email address'}`
        });
      }
      
      // Check if email is already in use - normalize to lowercase for comparison
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`REGISTER API: Checking if email exists: '${normalizedEmail}'`);
      
      // Force a thorough check for existing email
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      
      console.log(`REGISTER API: Existing user found: ${!!existingUser}`, existingUser ? `ID: ${existingUser.id}, Email: '${existingUser.email}'` : '');
      
      if (existingUser) {
        console.log(`REGISTER API: Rejecting registration - email already exists: '${normalizedEmail}'`);
        return res.status(400).json({ 
          message: "This email is already registered. Choose a different email." 
        });
      }

      const hashedPassword = await hashPassword(password);
      // Create new user with empty values and normalized email
      const user = await storage.createUser({
        name,
        email: normalizedEmail, // Use the normalized email to ensure consistency
        password: hashedPassword,
      });
      
      // No sample data will be created for new users
      // This ensures all values start at 0 on the dashboard

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
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
    req.body.email = email.toLowerCase().trim();
    console.log(`Login attempt with normalized email: ${req.body.email}`);
    
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      console.log("Login attempt result:", { err, user: !!user, info });
      
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid email or password" 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session save error:", loginErr);
          return next(loginErr);
        }
        
        console.log("Login successful, user:", user.email);
        return res.status(200).json(user);
      });
    })(req, res, next);
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
