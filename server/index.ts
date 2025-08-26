import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import path from "path";

// Initialize app with middleware
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

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

  return app;
}

// Create and configure app for both production and development
const app = createApp();

// Register routes and setup app
const initializeApp = async () => {
  // In development, don't register routes yet - wait until after Vite setup
  let server;
  if (process.env.NODE_ENV === "production") {
    server = await registerRoutes(app);
  } else {
    // Create a basic HTTP server for development
    const { createServer } = await import("http");
    server = createServer(app);
  }

  // Add error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    if (process.env.NODE_ENV !== "production") {
      throw err;
    }
  });

  return server;
};

if (process.env.NODE_ENV === "production") {
  // Initialize app for production
  initializeApp();
} else {
  // Development mode - setup Vite first, then add API routes on top
  (async () => {
    const server = await initializeApp();
    
    await setupVite(app, server);
    
    // Add API routes AFTER Vite setup so they have priority
    await registerRoutes(app);

    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// Export for Vercel
export default app;
