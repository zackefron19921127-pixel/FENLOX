// Debug endpoint to test enhancement
import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
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
    console.log('🔧 DEBUG: Starting photo enhancement test...');
    
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

    console.log('📁 File info:', {
      originalname: photoFile.originalFilename,
      size: photoFile.size,
      mimetype: photoFile.mimetype,
      filepath: photoFile.filepath
    });

    // Read file
    const fileBuffer = fs.readFileSync(photoFile.filepath);
    const originalBase64 = fileBuffer.toString('base64');
    const originalImageUrl = `data:${photoFile.mimetype};base64,${originalBase64}`;
    
    console.log('✅ Original image processed, size:', fileBuffer.length);

    // Test Sharp enhancement
    try {
      console.log('🔧 Testing Sharp enhancement...');
      
      const enhancedBuffer = await sharp(fileBuffer)
        .modulate({
          brightness: 1.3,    // 30% brighter
          saturation: 1.4,    // 40% more saturated
        })
        .sharpen(2)           // Strong sharpening
        .gamma(1.2)          // Gamma boost
        .jpeg({ quality: 95 }) 
        .toBuffer();
        
      const enhancedBase64 = enhancedBuffer.toString('base64');
      const enhancedImageUrl = `data:image/jpeg;base64,${enhancedBase64}`;
      
      console.log('✅ Sharp enhancement completed!');
      console.log('📊 Size comparison:', {
        original: fileBuffer.length,
        enhanced: enhancedBuffer.length,
        difference: enhancedBuffer.length - fileBuffer.length
      });

      return res.status(200).json({
        success: true,
        message: 'Enhancement test completed',
        original: {
          size: originalBase64.length,
          preview: originalBase64.substring(0, 100) + '...'
        },
        enhanced: {
          size: enhancedBase64.length,
          preview: enhancedBase64.substring(0, 100) + '...'
        },
        imagesAreDifferent: originalBase64 !== enhancedBase64,
        sizeIncrease: enhancedBuffer.length - fileBuffer.length
      });
      
    } catch (sharpError) {
      console.error('❌ Sharp error:', sharpError);
      return res.status(500).json({ 
        error: 'Sharp enhancement failed',
        details: sharpError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return res.status(500).json({ 
      error: 'Debug test failed',
      message: error.message 
    });
  }
}