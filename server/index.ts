import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Add cookie parser middleware for CSRF protection

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Improved error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Log the error for debugging
    console.error(`Error occurred during ${req.method} ${req.path}:`, err);
    
    // Determine status code
    const status = err.status || err.statusCode || 500;
    
    // Format error message based on environment
    let message = err.message || "Internal Server Error";
    let details: any = undefined;
    
    // In production, don't expose internal error details
    if (app.get("env") !== "production") {
      details = {
        stack: err.stack,
        code: err.code,
        name: err.name
      };
    } else {
      // Sanitize error messages in production to avoid leaking sensitive info
      if (status === 500) {
        message = "Internal Server Error";
      }
    }
    
    // Format the error response
    const errorResponse: Record<string, any> = { 
      success: false,
      message
    };
    
    // Include details only in development
    if (details) {
      errorResponse.details = details;
    }
    
    // Send the error response
    res.status(status).json(errorResponse);
    
    // Don't throw the error here as it will crash the app
    // Instead we've already logged it above
  });

  // Use static file serving to provide a fallback page
  // This will bypass the Vite hot module replacement issues
  app.set("env", "production"); // Force production mode
  serveStatic(app);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
