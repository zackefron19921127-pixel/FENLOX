// Simple storage for uploaded photos
const uploadedPhotos = new Map();

export default function handler(req, res) {
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
    // For serverless, we'll handle the raw form data
    let buffer = Buffer.alloc(0);
    
    // Read the request body
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      req.on('end', () => {
        buffer = Buffer.concat(chunks);
        
        // Generate unique ID that starts with 'usr' to identify user uploads
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const id = 'usr' + timestamp + random;
        
        // Check if there's actual file data
        let originalImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzA4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgVXBsb2FkZWQgUGhvdG88L3RleHQ+PC9zdmc+`;
        
        if (buffer.length > 0) {
          // Look for image data in the multipart form data
          const bufferStr = buffer.toString('binary');
          
          // Find image boundaries and extract image data
          const jpegStart = bufferStr.indexOf('\xFF\xD8\xFF');
          const pngStart = bufferStr.indexOf('\x89PNG');
          const webpStart = bufferStr.indexOf('WEBP');
          
          let imageStart = -1;
          let mimeType = 'image/jpeg';
          
          if (jpegStart !== -1) {
            imageStart = jpegStart;
            mimeType = 'image/jpeg';
          } else if (pngStart !== -1) {
            imageStart = pngStart;
            mimeType = 'image/png';
          } else if (webpStart !== -1) {
            imageStart = webpStart - 8; // Include RIFF header
            mimeType = 'image/webp';
          }
          
          if (imageStart !== -1) {
            // Extract the image data
            let imageEnd = buffer.length;
            
            // Try to find the end boundary
            const boundaryMatch = bufferStr.match(/------WebKitFormBoundary[\w\d]+/);
            if (boundaryMatch) {
              const secondBoundary = bufferStr.indexOf(boundaryMatch[0], imageStart + 100);
              if (secondBoundary !== -1) {
                imageEnd = secondBoundary;
              }
            }
            
            const imageBuffer = buffer.slice(imageStart, imageEnd);
            const base64Data = imageBuffer.toString('base64');
            originalImageUrl = `data:${mimeType};base64,${base64Data}`;
            
            // Store for later retrieval
            uploadedPhotos.set(id, originalImageUrl);
          }
        }
        
        // Create restoration record
        const restoration = {
          id: id,
          originalImageUrl: originalImageUrl,
          options: {},
          status: 'processing',
          createdAt: new Date().toISOString()
        };

        console.log('User photo upload:', id, 'Has image data:', buffer.length > 0);

        resolve(res.status(201).json(restoration));
      });
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}