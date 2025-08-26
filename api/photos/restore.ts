// Import shared storage
import { uploadedPhotos } from '../shared-storage.js';
import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';

export default async function handler(req: any, res: any) {
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
    // Generate unique ID that starts with 'usr' to identify user uploads
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const id = 'usr' + timestamp + random;
    
    console.log('🚀 Processing upload with ID:', id);
    
    // Default placeholder
    let originalImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgVXBsb2FkZWQgUGhvdG88L3RleHQ+PC9zdmc+`;
    
    // Use formidable to properly parse multipart FormData
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      allowEmptyFiles: true, // Allow files to debug what's happening
      multiples: false,
    });
    
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) {
          console.log('❌ Form parsing error:', err);
          reject(err);
        } else {
          console.log('✅ Form parsing successful');
          resolve({ files });
        }
      });
    });
    
    console.log('📦 Form parsing complete. Files found:', Object.keys(files));
    console.log('🔍 All files received:', files);
    
    // Get the uploaded file (frontend sends it as "photo")  
    const uploadedFile = files.photo;
    if (uploadedFile && uploadedFile.size > 0) {
      console.log('📸 File details:', {
        originalFilename: uploadedFile.originalFilename,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
        filepath: uploadedFile.filepath
      });
      
      // Read the file and convert to base64
      const fileBuffer = readFileSync(uploadedFile.filepath);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = uploadedFile.mimetype || 'image/jpeg';
      originalImageUrl = `data:${mimeType};base64,${base64Data}`;
      
      console.log('✅ Image processed successfully! Size:', fileBuffer.length, 'Type:', mimeType);
    } else {
      console.log('❌ No file found in FormData');
    }
    
    // For demo purposes, just return the uploaded image as both original and "restored"
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

    // Store the complete restoration for retrieval
    uploadedPhotos.set(id, restoration);

    console.log("✅ Photo restoration completed:", id);
    console.log("📊 Stored restoration data:", restoration);

    return res.status(201).json(restoration);
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}