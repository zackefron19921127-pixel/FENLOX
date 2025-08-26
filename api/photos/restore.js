import formidable from 'formidable';
import fs from 'fs';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// In-memory storage for demo
const restorations = new Map();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype && (mimetype.includes('image/jpeg') || mimetype.includes('image/png'));
      }
    });

    const [fields, files] = await form.parse(req);
    
    const photoFile = files.photo?.[0];
    if (!photoFile) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // Generate unique ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const id = 'usr' + timestamp + random;
    
    console.log('🚀 Processing upload with ID:', id);

    // Read the uploaded file and convert to base64
    const fileBuffer = fs.readFileSync(photoFile.filepath);
    const base64Data = fileBuffer.toString('base64');
    const originalImageUrl = `data:${photoFile.mimetype};base64,${base64Data}`;
    
    console.log('✅ Image converted to base64 successfully! Size:', fileBuffer.length);

    // For demo, return the uploaded image as both original and "restored"
    const restoredImageUrl = originalImageUrl;

    const restoration = {
      id: id,
      originalImageUrl: originalImageUrl,
      restoredImageUrl: restoredImageUrl,
      options: {},
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    // Store the restoration
    restorations.set(id, restoration);

    console.log("✅ Photo restoration completed:", id);
    console.log("📊 Image extracted: YES (real image data)");

    return res.status(201).json(restoration);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}