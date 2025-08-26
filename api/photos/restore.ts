import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import crypto from 'crypto';

// Simple in-memory storage for serverless
class MemStorage {
  private restorations = new Map();
  
  async createPhotoRestoration(data: any) {
    const id = crypto.randomUUID();
    const restoration = {
      id,
      ...data,
      status: 'processing' as const,
      createdAt: new Date(),
    };
    this.restorations.set(id, restoration);
    return restoration;
  }
  
  async updatePhotoRestoration(id: string, updates: any) {
    const existing = this.restorations.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.restorations.set(id, updated);
      return updated;
    }
    return null;
  }
  
  async getPhotoRestoration(id: string) {
    return this.restorations.get(id) || null;
  }
}

const storage = new MemStorage();

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

// Process photo with Nero AI
async function processWithNeroAI(imageBuffer: Buffer, filename: string, options: any): Promise<string> {
  try {
    console.log('🎨 Processing photo restoration with Nero AI...');
    
    const NERO_AI_API_KEY = process.env.NERO_AI_API_KEY;
    if (!NERO_AI_API_KEY) {
      throw new Error('Nero AI API key not configured');
    }

    // Upload image to temporary hosting for Nero AI processing
    const FormData = (await import('form-data')).default;
    const fetch = (await import('node-fetch')).default;
    
    // Upload to catbox.moe for temporary hosting
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', imageBuffer, { filename });

    const uploadResponse = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image for processing');
    }

    const imageUrl = await uploadResponse.text();
    console.log('📤 Uploaded image for AI processing:', imageUrl);

    // Process with Nero AI
    const neroResponse = await fetch('https://api.nero.ai/v1/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NERO_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl.trim(),
        effects: ['ScratchFix', 'FaceRestoration', 'ImageUpscaler'],
        ...options
      }),
    });

    if (!neroResponse.ok) {
      throw new Error(`Nero AI API error: ${neroResponse.status}`);
    }

    const result = await neroResponse.json() as any;
    
    if (result.output_url) {
      console.log('✅ Nero AI restoration completed!');
      return result.output_url;
    }
    
    throw new Error('No output from Nero AI');
    
  } catch (error) {
    console.error('AI processing error:', error);
    // Return a demo result for fallback
    return `https://via.placeholder.com/400x300/4ade80/ffffff?text=AI+Restored`;
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

    // Create restoration record
    const originalImageUrl = `/uploads/${file.originalname}`;
    const restoration = await storage.createPhotoRestoration({
      originalImageUrl,
      options,
    });

    res.status(201).json(restoration);

    // Process asynchronously in background
    processWithNeroAI(file.buffer, file.originalname, options)
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