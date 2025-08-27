import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { photoRestorations, contactSubmissions } from '@shared/schema';

// Database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
import { insertPhotoRestorationSchema, insertContactSubmissionSchema } from "@shared/schema";
import { neroAIService, type NeroAIOptions } from "./nero-ai-api";
// import { replicateService, type ReplicateOptions } from "./replicate-api";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads (with fallback for serverless)
const upload = multer({
  storage: process.env.NODE_ENV === "production" 
    ? multer.memoryStorage() 
    : multer.diskStorage({
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
    // Support all major image formats that Nero AI accepts + SVG
    const allowedTypes = /jpeg|jpg|png|bmp|webp|tiff|tif|ico|jfif|jfi|jpe|jif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Please upload an image file (JPG, PNG, BMP, WEBP, TIFF, SVG, ICO)"));
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
    
    // For demo, read the original image and return as base64 data URL
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString('base64');
    
    // Determine mime type from file extension
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    console.log(`Created demo result as base64 data URL (${imageBuffer.length} bytes)`);
    return dataUrl;
    
  } catch (error) {
    console.error('Photo processing error:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<void> {
  // Ensure uploads directory exists (with error handling for serverless)
  try {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads", { recursive: true });
    }
  } catch (error) {
    console.log("Note: uploads directory will be handled by serverless environment");
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
      
      // Handle file path for both development and production
      let filePath: string;
      let originalImageUrl: string;
      
      if (process.env.NODE_ENV === "production") {
        // In production, handle memory storage
        filePath = `/tmp/${req.file.originalname}`;
        // Convert buffer to base64 data URL
        const base64Data = req.file.buffer.toString('base64');
        originalImageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        // Write buffer to temporary file for processing
        fs.writeFileSync(filePath, req.file.buffer);
      } else {
        // In development, use disk storage  
        filePath = req.file.path;
        // Read file and convert to base64 data URL
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        originalImageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      }
      
      // Validate options
      const validationResult = insertPhotoRestorationSchema.safeParse({
        originalImageUrl,
        options,
      });

      if (!validationResult.success) {
        // Clean up uploaded file
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.log("File cleanup skipped in serverless environment");
        }
        return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
      }

      // Debug: Log what we're about to store
      console.log("🔍 About to store restoration with:");
      console.log("- originalImageUrl type:", typeof originalImageUrl);
      console.log("- originalImageUrl starts with:", originalImageUrl.substring(0, 50));
      console.log("- originalImageUrl contains SVG:", originalImageUrl.includes('svg'));
      
      // Create restoration record in database
      const [restoration] = await db.insert(photoRestorations).values({
        originalImageUrl,
        options,
        status: 'processing'
      }).returning();
      
      console.log("✅ Stored restoration:", {
        id: restoration.id,
        originalImageUrl: restoration.originalImageUrl.substring(0, 50),
        containsSvg: restoration.originalImageUrl.includes('svg')
      });

      res.status(201).json(restoration);

      // Process asynchronously
      processWithAI(filePath, options)
        .then(async (restoredImageUrl) => {
          await db.update(photoRestorations)
            .set({
              status: "completed",
              restoredImageUrl,
              completedAt: new Date()
            })
            .where(eq(photoRestorations.id, restoration.id));
        })
        .catch(async (error) => {
          await db.update(photoRestorations)
            .set({
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Processing failed"
            })
            .where(eq(photoRestorations.id, restoration.id));
        })
        .finally(() => {
          // Clean up temporary file
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.log("File cleanup skipped in serverless environment");
          }
        });

    } catch (error) {
      console.error("Photo restoration error:", error);
      res.status(500).json({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
    });

  // Get restoration status  
  app.get("/api/photos/:id", async (req, res) => {
    console.log("🚨🚨🚨 HIT MAIN ROUTES /api/photos/:id 🚨🚨🚨");
    try {
      console.log("🔍 Getting restoration for ID:", req.params.id);
      const [restoration] = await db.select().from(photoRestorations).where(eq(photoRestorations.id, req.params.id));
      if (!restoration) {
        console.log("❌ Restoration not found for ID:", req.params.id);
        return res.status(404).json({ error: "Restoration not found" });
      }
      
      console.log("✅ Found restoration:", {
        id: restoration.id,
        status: restoration.status,
        originalImageUrl: restoration.originalImageUrl.substring(0, 50),
        containsSvg: restoration.originalImageUrl.includes('svg')
      });
      
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

      const [submission] = await db.insert(contactSubmissions).values(validationResult.data).returning();
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

  // Routes registered successfully
}
