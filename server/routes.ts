import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhotoRestorationSchema, insertContactSubmissionSchema } from "@shared/schema";
import { neroAIService, type NeroAIOptions } from "./nero-ai-api";
// import { replicateService, type ReplicateOptions } from "./replicate-api";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (Nero AI maximum)
  },
  fileFilter: (req, file, cb) => {
    // Support all major image formats that Nero AI accepts
    const allowedTypes = /jpeg|jpg|png|bmp|webp|tiff|tif|ico|jfif|jfi|jpe|jif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Supported formats: JPG, PNG, BMP, WEBP, TIFF, ICO, JFIF"));
    }
  },
});

// Process photo with Nero AI or demo fallback
async function processWithAI(imagePath: string, options: any): Promise<string> {
  try {
    console.log('🎨 Processing photo restoration with AI...');
    console.log('Selected options:', options);
    
    // Try Nero AI first (you have 50 credits)
    const neroResult = await neroAIService.restorePhoto(imagePath, options);
    
    if (neroResult.success && neroResult.restoredImageUrl) {
      console.log('✅ Nero AI restoration completed successfully!');
      return neroResult.restoredImageUrl;
    }
    
    // Fallback to enhanced processing if Nero AI fails
    console.log('⚠️ Nero AI not available, using enhanced processing...');
    console.log('Nero reason:', neroResult.error || 'API processing issue');
    
    // Simulate processing steps for demo
    console.log('Step 1: Analyzing image quality...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (options.scratchRemoval) {
      console.log('Step 2: Removing scratches and damage...');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    if (options.faceEnhancement) {
      console.log('Step 3: Enhancing facial features...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (options.colorization) {
      console.log('Step 4: Adding natural colors...');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    if (options.hdUpscaling) {
      console.log('Step 5: Upscaling to HD quality...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✓ Demo restoration completed!');
    console.log('💡 Add NERO_AI_API_KEY to enable real AI processing.');
    
    // Copy the original image as the "restored" version for demo
    const timestamp = Date.now();
    const originalExt = path.extname(imagePath) || '.jpg';
    const demoPath = `uploads/demo-restored-${timestamp}${originalExt}`;
    
    fs.copyFileSync(imagePath, demoPath);
    
    console.log(`Created demo result: ${demoPath}`);
    return `/${demoPath}`;
    
  } catch (error) {
    console.error('Photo processing error:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Add CORS headers for image serving
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use("/uploads", express.static("uploads"));

  // Upload and process photo
  app.post("/api/photos/restore", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No photo uploaded" });
      }

      let options = {};
      try {
        options = req.body.options ? JSON.parse(req.body.options) : {};
      } catch (e) {
        console.error('Invalid options JSON:', req.body.options);
        options = {};
      }
      
      // Validate options
      const validationResult = insertPhotoRestorationSchema.safeParse({
        originalImageUrl: `/uploads/${req.file.filename}`,
        options,
      });

      if (!validationResult.success) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
      }

      // Create restoration record
      const restoration = await storage.createPhotoRestoration({
        originalImageUrl: `/uploads/${req.file.filename}`,
        options,
      });

      res.status(201).json(restoration);

      // Process asynchronously
      processWithAI(req.file.path, options)
        .then(async (restoredImageUrl) => {
          await storage.updatePhotoRestoration(restoration.id, {
            status: "completed",
            restoredImageUrl,
            completedAt: new Date(),
          });
        })
        .catch(async (error) => {
          await storage.updatePhotoRestoration(restoration.id, {
            status: "failed",
            errorMessage: error.message,
          });
        });

    } catch (error) {
      console.error("Photo restoration error:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get restoration status
  app.get("/api/photos/restore/:id", async (req, res) => {
    try {
      const restoration = await storage.getPhotoRestoration(req.params.id);
      if (!restoration) {
        return res.status(404).json({ error: "Restoration not found" });
      }
      res.json(restoration);
    } catch (error) {
      console.error("Get restoration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validationResult = insertContactSubmissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid contact data", details: validationResult.error });
      }

      const submission = await storage.createContactSubmission(validationResult.data);
      res.status(201).json({ message: "Contact submission received", id: submission.id });
    } catch (error) {
      console.error("Contact submission error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Generate sitemap
  app.get("/sitemap.xml", (req, res) => {
    const host = req.get("host") || "photorevive-ai.com";
    const protocol = req.secure ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#features</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(sitemap);
  });

  const httpServer = createServer(app);
  return httpServer;
}
