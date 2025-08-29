import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { photoRestorations } from '../../shared/schema.js';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Database connection (with error handling)
let db = null;
try {
  const sql = neon(process.env.DATABASE_URL, {
    fetchConnectionCache: true,
    poolQueryViaFetch: true,
  });
  db = drizzle(sql);
  console.log('✅ Database connection initialized');
} catch (dbError) {
  console.error('❌ Database connection failed:', dbError);
}

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
    console.log('🚀 Simple restore endpoint called');
    
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
      
      // Use Nero AI API for photo restoration
      const neroApiKey = process.env.NERO_AI_API_KEY;
      console.log('🔍 DEBUG: Environment check:', {
        hasApiKey: !!neroApiKey,
        keyLength: neroApiKey ? neroApiKey.length : 0,
        keyPrefix: neroApiKey ? neroApiKey.substring(0, 8) + '...' : 'N/A'
      });
      
      if (neroApiKey) {
        console.log('🔑 Nero AI API key found, processing with AI...');
        
        // First upload image to public hosting (Nero AI needs public URLs)
        console.log('📤 Uploading image to public hosting...');
        let publicImageUrl;
        
        try {
          // Upload to catbox.moe for public access
          const formData = new FormData();
          const blob = new Blob([fileBuffer], { type: photoFile.mimetype });
          formData.append('fileToUpload', blob, 'image.jpg');
          formData.append('reqtype', 'fileupload');
          
          const uploadResponse = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: formData
          });
          
          if (uploadResponse.ok) {
            const resultUrl = await uploadResponse.text();
            if (resultUrl.startsWith('https://files.catbox.moe/')) {
              publicImageUrl = resultUrl;
              console.log('📤 Image uploaded successfully:', publicImageUrl);
            }
          }
          
          if (!publicImageUrl) {
            throw new Error('Failed to upload image to public hosting');
          }
          
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          // Skip AI processing if we can't upload the image
          console.log('⚠️ Skipping AI processing - using original image');
          publicImageUrl = null;
        }
        
        if (publicImageUrl) {
          // Use Nero AI API with multiple enhancement effects for dramatic results
          console.log('🔑 Making Nero AI request with public URL for comprehensive enhancement');
          
          // Apply ScratchFix first
          const scratchFixResponse = await fetch('https://api.nero.com/biz/api/task', {
            method: 'POST',
            headers: {
              'x-neroai-api-key': neroApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'ScratchFix',
              body: {
                image: publicImageUrl
              }
            })
          });

          console.log('📡 ScratchFix response status:', scratchFixResponse.status);
          
          if (scratchFixResponse.ok) {
            const scratchFixResult = await scratchFixResponse.json();
            console.log('📊 ScratchFix result:', scratchFixResult);
          
            if (scratchFixResult.code === 0 && scratchFixResult.data?.task_id) {
              const taskId = scratchFixResult.data.task_id;
              console.log('🔄 Polling ScratchFix task:', taskId);
              
              // Poll for ScratchFix completion with longer timeout
              for (let i = 0; i < 30; i++) { // 60 seconds max for real AI processing
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                
                const statusResponse = await fetch(`https://api.nero.com/biz/api/task?task_id=${taskId}`, {
                  headers: { 'x-neroai-api-key': neroApiKey }
                });
                
                if (statusResponse.ok) {
                  const statusResult = await statusResponse.json();
                  console.log(`📊 ScratchFix status (${i+1}/30):`, statusResult.data?.status);
                  
                  if (statusResult.data?.status === 'done' && statusResult.data.result?.output) {
                    const enhancedImageUrl = statusResult.data.result.output;
                    console.log('✨ ScratchFix completed! Enhanced URL:', enhancedImageUrl);
                    
                    // Download the AI-enhanced result
                    try {
                      const downloadResponse = await fetch(enhancedImageUrl);
                      if (downloadResponse.ok) {
                        const enhancedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
                        const enhancedBase64 = enhancedBuffer.toString('base64');
                        restoredImageUrl = `data:image/jpeg;base64,${enhancedBase64}`;
                        console.log('🎯 API ENHANCEMENT SUCCESS: Photo enhanced by Nero AI!');
                      }
                    } catch (downloadError) {
                      console.error('❌ Failed to download enhanced result:', downloadError);
                    }
                    break;
                  } else if (statusResult.data?.status === 'failed') {
                    console.log('❌ ScratchFix task failed:', statusResult.data.msg);
                    break;
                  }
                } else {
                  console.log(`⏳ Status check failed (${i+1}/30):`, statusResponse.status);
                }
              }
            } else {
              console.log('⚠️ ScratchFix API error:', scratchFixResult.message || 'No task created');
            }
          } else {
            const errorText = await scratchFixResponse.text();
            console.log('⚠️ ScratchFix failed with status:', scratchFixResponse.status);
            console.log('⚠️ Error response:', errorText);
          }
      } else {
        console.log('⚠️ No public image URL - skipping AI processing');
      }
    } else {
      console.log('❌ No Nero AI API key found');
    }
      
      // Check if API enhanced the photo
      if (restoredImageUrl === originalImageUrl) {
        console.log('⚠️ API did not enhance the photo - returning original');
        console.log('🎯 API-ONLY mode: No local processing fallback per user request');
      } else {
        console.log('✅ API ENHANCEMENT SUCCESS: Photo processed by Nero AI API!');
      }
      
    } catch (error) {
      console.error('❌ Photo restoration error:', error);
      // Keep original as fallback
    }

    // Store in database if available, otherwise return in-memory result
    let restoration;
    
    if (db) {
      try {
        console.log('💾 Saving to database...');
        const [savedRestoration] = await db.insert(photoRestorations).values({
          id: id,
          originalImageUrl: originalImageUrl,
          restoredImageUrl: restoredImageUrl,
          options: {},
          status: 'completed',
          completedAt: new Date()
        }).returning();
        
        restoration = savedRestoration;
        console.log('✅ Photo saved to database!');
      } catch (dbSaveError) {
        console.error('❌ Database save failed:', dbSaveError);
        // Fallback to in-memory result
        restoration = {
          id: id,
          originalImageUrl: originalImageUrl,
          restoredImageUrl: restoredImageUrl,
          options: {},
          status: 'completed',
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
      }
    } else {
      // No database - return in-memory result
      restoration = {
        id: id,
        originalImageUrl: originalImageUrl,
        restoredImageUrl: restoredImageUrl,
        options: {},
        status: 'completed',
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      console.log('⚠️ No database - using in-memory storage');
    }

    console.log("✅ Photo restoration completed:", id);
    console.log("📊 Final restoration object:", {
      id: restoration.id,
      hasOriginalImage: !!restoration.originalImageUrl,
      hasRestoredImage: !!restoration.restoredImageUrl,
      originalImageSize: restoration.originalImageUrl.length,
      restoredImageSize: restoration.restoredImageUrl.length,
      imagesAreDifferent: restoration.originalImageUrl !== restoration.restoredImageUrl,
      status: restoration.status,
      savedToDatabase: !!db
    });

    return res.status(201).json(restoration);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message,
      stack: error.stack 
    });
  }
}