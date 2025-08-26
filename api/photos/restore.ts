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
    
    // Read the request body as buffer
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const buffer = Buffer.concat(buffers);
    
    let originalImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgVXBsb2FkZWQgUGhvdG88L3RleHQ+PC9zdmc+`;
    
    if (buffer.length > 0) {
      // More robust image detection
      const bufferStr = buffer.toString('binary');
      
      // Look for image magic numbers with better detection
      let imageStart = -1;
      let imageEnd = buffer.length;
      let mimeType = 'image/jpeg';
      
      // JPEG detection
      const jpegStart = buffer.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]));
      if (jpegStart !== -1) {
        imageStart = jpegStart;
        mimeType = 'image/jpeg';
        // Find JPEG end marker
        const jpegEnd = buffer.indexOf(Buffer.from([0xFF, 0xD9]), jpegStart + 10);
        if (jpegEnd !== -1) {
          imageEnd = jpegEnd + 2;
        }
      }
      
      // PNG detection
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const pngStart = buffer.indexOf(pngSignature);
      if (pngStart !== -1 && (imageStart === -1 || pngStart < imageStart)) {
        imageStart = pngStart;
        mimeType = 'image/png';
        // PNG files end with IEND chunk
        const iendStart = buffer.indexOf(Buffer.from('IEND'), pngStart + 20);
        if (iendStart !== -1) {
          imageEnd = iendStart + 8; // IEND + 4 bytes CRC
        }
      }
      
      if (imageStart !== -1) {
        // Extract the image data
        const imageBuffer = buffer.slice(imageStart, imageEnd);
        const base64Data = imageBuffer.toString('base64');
        originalImageUrl = `data:${mimeType};base64,${base64Data}`;
        
        // Store for later retrieval
        uploadedPhotos.set(id, originalImageUrl);
        
        console.log('User photo upload:', id, 'Has image data: true, size:', imageBuffer.length, 'type:', mimeType);
      } else {
        console.log('User photo upload:', id, 'No valid image data found in buffer of size:', buffer.length);
      }
    }
    
    // Create restoration record and immediately complete it with the processed image
    const restoredImageUrl = originalImageUrl.includes('svg') 
      ? `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjM2NmYxIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BSSBSZXN0b3JlZDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgUGhvdG88L3RleXQ+PC9zdmc+` 
      : originalImageUrl; // For real uploads, return the same image as "restored" for demo

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

    return res.status(201).json(restoration);
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}