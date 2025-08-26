import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { storage } from '../../server/storage';
import { neroAIService } from '../../server/nero-ai-api';
import { insertPhotoRestorationSchema } from '../../shared/schema';

// Configure multer for serverless
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|bmp|webp|tiff|tif|ico|jfif|jfi|jpe|jif|svg/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Please upload an image file (JPG, PNG, BMP, WEBP, TIFF, SVG, ICO)"));
    }
  },
});

// Process photo with AI or fallback
async function processWithAI(imageBuffer: Buffer, filename: string, options: any): Promise<string> {
  try {
    console.log('🎨 Processing photo restoration with AI...');
    
    // Create temporary file path for processing
    const tempPath = `/tmp/${filename}`;
    
    // Write buffer to temp file
    const fs = await import('fs');
    fs.writeFileSync(tempPath, imageBuffer);
    
    // Try Nero AI first
    const neroResult = await neroAIService.restorePhoto(tempPath, options);
    
    if (neroResult.success && neroResult.restoredImageUrl) {
      console.log('✅ Nero AI restoration completed successfully!');
      // Clean up temp file
      try { fs.unlinkSync(tempPath); } catch (e) {}
      return neroResult.restoredImageUrl;
    }
    
    // Fallback - return original for demo
    console.log('⚠️ Using demo mode - returning original image');
    // Clean up temp file
    try { fs.unlinkSync(tempPath); } catch (e) {}
    
    return `/uploads/${filename}`;
    
  } catch (error) {
    console.error('Photo processing error:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Parse multipart form data
    await new Promise<void>((resolve, reject) => {
      upload.single('photo')(req as any, res as any, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: 'No photo uploaded' });
      return;
    }

    // Parse options
    let options = {};
    try {
      const body = (req as any).body;
      options = body?.options ? JSON.parse(body.options) : {};
    } catch (e) {
      options = {};
    }

    // Validate request
    const originalImageUrl = `/uploads/${file.originalname}`;
    const validationResult = insertPhotoRestorationSchema.safeParse({
      originalImageUrl,
      options,
    });

    if (!validationResult.success) {
      res.status(400).json({ 
        error: 'Invalid request data', 
        details: validationResult.error 
      });
      return;
    }

    // Create restoration record
    const restoration = await storage.createPhotoRestoration({
      originalImageUrl,
      options,
    });

    res.status(201).json(restoration);

    // Process asynchronously in background
    processWithAI(file.buffer, file.originalname, options)
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
          errorMessage: error instanceof Error ? error.message : "Processing failed",
        });
      });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}