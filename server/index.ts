import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

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
  // Development mode - serve Vercel API routes directly
  (async () => {
    const server = await initializeApp();
    
    // Add Vercel API route handlers before Vite middleware
    const restoreHandler = (await import("../api/photos/restore.js")).default;
    const getPhotoHandler = (await import("../api/photos/[id].js")).default;
    const contactHandler = (await import("../api/contact.js")).default;
    
    // Import and setup multer for file uploads
    const multer = (await import("multer")).default;
    const upload = multer({
      storage: multer.diskStorage({
        destination: "uploads/",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substr(2);
          const ext = require("path").extname(file.originalname) || '.jpg';
          cb(null, uniqueSuffix + ext);
        }
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    });
    
    app.post("/api/photos/restore", upload.single("photo"), restoreHandler);
    app.get("/api/photos/:id", (req, res) => {
      req.query = { id: req.params.id };
      getPhotoHandler(req, res);
    });
    app.post("/api/contact", contactHandler);
    
    await setupVite(app, server);

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
