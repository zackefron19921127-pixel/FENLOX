import formidable from 'formidable';
import fs from 'fs';
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
        
        // Use the correct Nero AI Business API with detailed logging
        console.log('🔑 Making Nero AI request with key length:', neroApiKey.length);
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
        console.log('📡 Response headers:', Object.fromEntries(neroResponse.headers.entries()));
        
        const responseText = await neroResponse.text();
        console.log('📡 Raw response:', responseText.substring(0, 500));
        
        if (neroResponse.ok) {
          const neroResult = JSON.parse(responseText);
          console.log('📊 DEBUG: Nero AI response parsed:', JSON.stringify(neroResult, null, 2));
          
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
      
      // API-only mode: No fallback processing
      if (restoredImageUrl === originalImageUrl) {
        console.log('⚠️ Nero AI did not enhance the image - returning original');
        console.log('🎯 API-only mode: No local processing fallback');
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