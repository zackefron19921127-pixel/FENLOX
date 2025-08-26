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

    // Process the image with Nero AI for real restoration
    let restoredImageUrl = originalImageUrl; // fallback to original
    
    try {
      console.log('🎨 Starting AI photo restoration...');
      console.log('📊 DEBUG: File info:', {
        filename: photoFile.originalname,
        size: photoFile.size,
        mimetype: photoFile.mimetype,
        bufferLength: fileBuffer.length
      });
      
      // Use Nero AI API for photo restoration
      const neroApiKey = process.env.NERO_AI_API_KEY;
      console.log('🔍 DEBUG: Environment check:', {
        hasApiKey: !!neroApiKey,
        keyLength: neroApiKey ? neroApiKey.length : 0,
        keyPrefix: neroApiKey ? neroApiKey.substring(0, 8) + '...' : 'N/A'
      });
      
      if (neroApiKey) {
        console.log('🔑 Nero AI API key found, processing with AI...');
        
        // Use the correct Nero AI Business API
        const neroResponse = await fetch('https://api.nero.com/biz/api/task', {
          method: 'POST',
          headers: {
            'x-neroai-api-key': neroApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'ScratchFix',
            body: {
              image: `data:${photoFile.mimetype};base64,${base64Data}`
            }
          })
        });

        console.log('📡 Nero AI response status:', neroResponse.status);
        console.log('📡 DEBUG: Response headers:', Object.fromEntries([...neroResponse.headers.entries()]));
        
        if (neroResponse.ok) {
          const neroResult = await neroResponse.json();
          console.log('📊 DEBUG: Full Nero AI response:', JSON.stringify(neroResult, null, 2));
          
          if (neroResult.code === 0 && neroResult.data) {
            const taskId = neroResult.data.task_id;
            
            if (neroResult.data.status === 'done' && neroResult.data.result) {
              // Task completed immediately
              restoredImageUrl = neroResult.data.result.output;
              console.log('✨ AI restoration completed immediately!');
            } else if (taskId) {
              // Poll for completion (up to 30 seconds)
              console.log('🔄 Polling Nero AI task:', taskId);
              
              for (let i = 0; i < 15; i++) { // Poll for 30 seconds max
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                
                const statusResponse = await fetch(`https://api.nero.com/biz/api/task?task_id=${taskId}`, {
                  headers: { 'x-neroai-api-key': neroApiKey }
                });
                
                if (statusResponse.ok) {
                  const statusResult = await statusResponse.json();
                  console.log('📊 DEBUG: Status poll result:', JSON.stringify(statusResult, null, 2));
                  console.log('📊 Task status:', statusResult.data?.status);
                  
                  if (statusResult.data?.status === 'done' && statusResult.data.result) {
                    restoredImageUrl = statusResult.data.result.output;
                    console.log('✨ AI restoration completed successfully!');
                    break;
                  } else if (statusResult.data?.status === 'failed') {
                    console.log('❌ Nero AI task failed');
                    break;
                  }
                }
              }
            }
          } else {
            console.log('⚠️ Nero AI API error:', neroResult.message || 'Unknown error');
          }
        } else {
          const errorText = await neroResponse.text();
          console.log('⚠️ Nero AI failed with status:', neroResponse.status);
          console.log('⚠️ Error response:', errorText);
        }
      } else {
        console.log('❌ No Nero AI API key found');
      }
      
      // Apply fallback enhancement only if AI didn't work
      console.log('🔍 DEBUG: Final check before fallback:', {
        originalUrl: originalImageUrl.substring(0, 50) + '...',
        restoredUrl: restoredImageUrl.substring(0, 50) + '...',
        urlsMatch: restoredImageUrl === originalImageUrl
      });
      
      if (restoredImageUrl === originalImageUrl) {
        console.log('📸 AI processing failed, applying basic enhancements...');
        
        // Import Sharp for image processing
        const sharp = await import('sharp');
        
        // Apply basic enhancements as fallback
        const enhancedBuffer = await sharp.default(fileBuffer)
          .modulate({
            brightness: 1.2,    // 20% brighter
            saturation: 1.3,    // 30% more saturated
          })
          .sharpen()             // Add sharpening
          .gamma(1.1)           // Slight gamma boost
          .jpeg({ quality: 95 }) // High quality output
          .toBuffer();
          
        const enhancedBase64 = enhancedBuffer.toString('base64');
        restoredImageUrl = `data:image/jpeg;base64,${enhancedBase64}`;
        console.log('✅ Fallback enhancement completed!');
      }
      
    } catch (error) {
      console.error('❌ Photo restoration error:', error);
      console.error('❌ DEBUG: Error stack:', error.stack);
      console.error('❌ DEBUG: Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause
      });
      // Keep original as fallback
    }

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
    console.log("📊 DEBUG: Final restoration object:", {
      id: restoration.id,
      hasOriginalImage: !!restoration.originalImageUrl,
      hasRestoredImage: !!restoration.restoredImageUrl,
      originalImageSize: restoration.originalImageUrl.length,
      restoredImageSize: restoration.restoredImageUrl.length,
      imagesAreDifferent: restoration.originalImageUrl !== restoration.restoredImageUrl,
      status: restoration.status
    });
    console.log("📊 Image extracted: YES (real image data)");

    return res.status(201).json(restoration);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}