// Import shared storage
import { uploadedPhotos } from '../shared-storage.js';

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
    
    // Read the request body as buffer
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const buffer = Buffer.concat(buffers);
    
    console.log('📦 Received buffer size:', buffer.length);
    console.log('📋 Content-Type:', req.headers['content-type']);
    
    // Default placeholder  
    let originalImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgVXBsb2FkZWQgUGhvdG88L3RleHQ+PC9zdmc+`;
    
    if (buffer.length > 0) {
      console.log('🔍 Searching for image data in FormData...');
      
      // Look for JPEG magic number in FormData
      const jpegStart = buffer.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]));
      if (jpegStart !== -1) {
        console.log('📸 Found JPEG at position:', jpegStart);
        // Find JPEG end marker
        const jpegEnd = buffer.indexOf(Buffer.from([0xFF, 0xD9]), jpegStart + 10);
        if (jpegEnd !== -1) {
          const imageBuffer = buffer.slice(jpegStart, jpegEnd + 2);
          const base64Data = imageBuffer.toString('base64');
          originalImageUrl = `data:image/jpeg;base64,${base64Data}`;
          console.log('✅ JPEG extracted successfully! Size:', imageBuffer.length);
        } else {
          console.log('⚠️ JPEG start found but no end marker');
        }
      }
      
      // Look for PNG magic number in FormData
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const pngStart = buffer.indexOf(pngSignature);
      if (pngStart !== -1 && jpegStart === -1) {
        console.log('📸 Found PNG at position:', pngStart);
        // Find PNG end marker (IEND chunk)
        const iendPos = buffer.indexOf(Buffer.from('IEND'), pngStart + 20);
        if (iendPos !== -1) {
          const imageBuffer = buffer.slice(pngStart, iendPos + 8);
          const base64Data = imageBuffer.toString('base64');
          originalImageUrl = `data:image/png;base64,${base64Data}`;
          console.log('✅ PNG extracted successfully! Size:', imageBuffer.length);
        } else {
          console.log('⚠️ PNG start found but no IEND marker');
        }
      }
      
      if (jpegStart === -1 && pngStart === -1) {
        console.log('❌ No image magic numbers found');
        console.log('🔍 Buffer preview (first 200 chars):', buffer.toString('utf8', 0, Math.min(200, buffer.length)));
      }
    } else {
      console.log('❌ Empty buffer received');
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
    console.log("📊 Image extracted:", !originalImageUrl.includes('svg') ? 'YES' : 'NO (using placeholder)');

    return res.status(201).json(restoration);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}