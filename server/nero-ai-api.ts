// Nero AI API integration for photo restoration
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Storage } from '@google-cloud/storage';

export interface NeroAIOptions {
  colorization?: boolean;
  faceEnhancement?: boolean;
  scratchRemoval?: boolean;
  hdUpscaling?: boolean;
}

export interface NeroAIResponse {
  success: boolean;
  restoredImageUrl?: string;
  error?: string;
}

export class NeroAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.nero.com/biz/api/task';

  constructor() {
    this.apiKey = process.env.NERO_AI_API_KEY || '4CI5GNA0UD2UWFDZK5MPCUQ1';
    console.log('Nero AI API configured:', this.apiKey ? 'YES' : 'NO');
  }

  async restorePhoto(imagePath: string, options: NeroAIOptions): Promise<NeroAIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Nero AI API key not configured'
      };
    }

    try {
      console.log('🎨 Starting Nero AI photo restoration...');
      
      // Create public URL for the image
      const imageUrl = await this.createPublicImageUrl(imagePath);
      console.log('📤 Image URL:', imageUrl);
      
      let processedImageUrl = imageUrl;
      
      // Apply each restoration effect sequentially
      if (options.scratchRemoval) {
        console.log('🔧 Applying ScratchFix...');
        processedImageUrl = await this.applyNeroEffect('ScratchFix', processedImageUrl);
      }
      
      if (options.faceEnhancement) {
        console.log('👤 Applying FaceRestoration...');
        processedImageUrl = await this.applyNeroEffect('FaceRestoration', processedImageUrl);
      }
      
      if (options.hdUpscaling) {
        console.log('📈 Applying ImageUpscaler...');
        processedImageUrl = await this.applyNeroEffect('ImageUpscaler:Standard', processedImageUrl);
      }
      
      // Download the final result if processing was successful
      if (processedImageUrl !== imageUrl) {
        const localPath = await this.downloadResult(processedImageUrl, imagePath);
        console.log('✅ Nero AI restoration completed successfully!');
        return {
          success: true,
          restoredImageUrl: localPath
        };
      } else {
        // No processing occurred, return error
        return {
          success: false,
          error: 'No AI processing was applied to the image'
        };
      }

    } catch (error) {
      console.error('Nero AI processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async createPublicImageUrl(imagePath: string): Promise<string> {
    // Use catbox.moe free image hosting service for Nero AI access
    try {
      // Read and convert image to JPEG for best compatibility
      const imageBuffer = fs.readFileSync(imagePath);
      let processedBuffer = imageBuffer;
      
      // Convert all formats to JPEG for Nero AI compatibility
      try {
        processedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 95 })
          .toBuffer();
      } catch (conversionError) {
        console.log('Using original image format');
      }
      
      // Upload to catbox.moe (reliable free hosting)
      const formData = new FormData();
      const blob = new Blob([processedBuffer], { type: 'image/jpeg' });
      formData.append('fileToUpload', blob, 'image.jpg');
      formData.append('reqtype', 'fileupload');
      
      const uploadResponse = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        const resultUrl = await uploadResponse.text();
        if (resultUrl.startsWith('https://files.catbox.moe/')) {
          console.log('📤 Uploaded user image to catbox.moe:', resultUrl);
          return resultUrl;
        }
      }
      
      // Fallback: Use 0x0.st
      const fallbackFormData = new FormData();
      fallbackFormData.append('file', blob, 'image.jpg');
      
      const fallbackResponse = await fetch('https://0x0.st', {
        method: 'POST',
        body: fallbackFormData
      });
      
      if (fallbackResponse.ok) {
        const fallbackUrl = await fallbackResponse.text();
        if (fallbackUrl.trim().startsWith('https://')) {
          console.log('📤 Uploaded user image to 0x0.st:', fallbackUrl.trim());
          return fallbackUrl.trim();
        }
      }
      
      throw new Error('All image hosting services failed');
      
    } catch (error) {
      console.error('Error creating public URL:', error);
      throw new Error('Failed to create publicly accessible URL for user image');
    }
  }

  private async applyNeroEffect(effectType: string, imageUrl: string): Promise<string> {
    try {
      console.log(`🎨 Applying ${effectType} effect to: ${imageUrl}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'x-neroai-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: effectType,
          body: {
            image: imageUrl
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Nero AI ${effectType} HTTP error:`, response.status, errorText);
        return imageUrl; // Return original if failed
      }

      const result = await response.json() as any;
      console.log(`📊 Nero AI ${effectType} response:`, result);

      if (result.code === 0 && result.data?.task_id) {
        console.log(`⏳ ${effectType} task created: ${result.data.task_id}`);
        // Poll for completion with longer timeout for real AI processing
        return await this.pollTaskCompletion(result.data.task_id, effectType, imageUrl);
      } else {
        console.error(`❌ Nero AI API error:`, result);
        return imageUrl; // Return original if failed
      }
    } catch (error) {
      console.error(`Error in ${effectType}:`, error);
      return imageUrl; // Return original if failed
    }
  }

  private async pollTaskCompletion(taskId: string, effectType: string, originalImageUrl: string): Promise<string> {
    const maxAttempts = 30; // 30 seconds max wait
    const pollInterval = 1000; // 1 second intervals
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        // FIXED: Use query parameter instead of path parameter
        const statusUrl = `${this.baseUrl}?task_id=${taskId}`;
        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'x-neroai-api-key': this.apiKey
          }
        });

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json() as any;
          console.log(`📊 ${effectType} status (${attempt + 1}/${maxAttempts}):`, statusResult.data?.status);

          if (statusResult.code === 0 && statusResult.data) {
            if (statusResult.data.status === 'done') {
              console.log(`✅ ${effectType} completed after ${attempt + 1} attempts!`);
              return statusResult.data.result?.output || originalImageUrl;
            } else if (statusResult.data.status === 'failed') {
              console.error(`❌ ${effectType} failed:`, statusResult.data.msg);
              return originalImageUrl;
            }
            // Continue polling if pending or running
          }
        } else {
          console.log(`⏳ Status check ${statusResponse.status} for ${effectType} (${attempt + 1}/${maxAttempts})`);
        }
      } catch (error) {
        console.error(`Error polling ${effectType} status:`, error);
      }
    }
    
    console.log(`⏰ ${effectType} timed out after ${maxAttempts} attempts`);
    return originalImageUrl;
  }

  private async downloadResult(resultUrl: string, originalPath: string): Promise<string> {
    const timestamp = Date.now();
    const originalExt = path.extname(originalPath) || '.jpg';
    const outputPath = path.join(path.dirname(originalPath), `nero-restored-${timestamp}${originalExt}`);
    
    const response = await fetch(resultUrl);
    if (!response.ok) {
      throw new Error(`Failed to download result: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    
    const filename = path.basename(outputPath);
    return `/uploads/${filename}`;
  }

  private async applyPremiumEnhancements(imagePath: string, options: NeroAIOptions): Promise<string> {
    // Create output filename with timestamp
    const timestamp = Date.now();
    const outputPath = path.join(path.dirname(imagePath), `enhanced-${timestamp}.jpg`);
    
    try {
      let pipeline = sharp(imagePath);
      
      // Apply premium enhancements based on selected options
      if (options.scratchRemoval) {
        // Advanced noise reduction and artifact removal
        pipeline = pipeline
          .median(2)           // Remove scratches and artifacts
          .blur(0.3)           // Slight blur to smooth damage
          .sharpen(1.5, 1, 2); // Re-sharpen
      }
      
      if (options.faceEnhancement) {
        // Enhanced facial detail processing
        pipeline = pipeline
          .sharpen(2.0, 1.5, 3)
          .modulate({ 
            brightness: 1.15,   // 15% brighter for faces
            saturation: 1.25,   // 25% more saturated
            hue: 0 
          });
      }
      
      if (options.colorization) {
        // Advanced colorization simulation
        pipeline = pipeline
          .modulate({ 
            brightness: 1.2,    // 20% brighter
            saturation: 1.4,    // 40% more saturated for vivid colors
            hue: 10             // Slight warm tone shift
          })
          .tint({ r: 255, g: 248, b: 240 }); // Warm color cast
      }
      
      if (options.hdUpscaling) {
        // Professional upscaling with quality enhancement
        const metadata = await sharp(imagePath).metadata();
        const newWidth = Math.floor((metadata.width || 800) * 2);
        const newHeight = Math.floor((metadata.height || 600) * 2);
        
        pipeline = pipeline.resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill'
        });
      }
      
      // Apply final premium quality improvements
      pipeline = pipeline
        .gamma(1.15)          // Better gamma correction
        .normalise()          // Auto-adjust contrast
        .sharpen(1.0, 1, 2) // Final sharpening
        .jpeg({ 
          quality: 98,        // Maximum quality output
          progressive: true,
          mozjpeg: true      // Better compression
        });
      
      await pipeline.toFile(outputPath);
      
      // Return the relative URL path
      const filename = path.basename(outputPath);
      return `/uploads/${filename}`;
      
    } catch (error) {
      console.error('Premium enhancement error:', error);
      // Fallback to original image if enhancement fails
      const filename = path.basename(imagePath);
      return `/uploads/${filename}`;
    }
  }

  private async applyImageEnhancements(imagePath: string, options: NeroAIOptions): Promise<string> {
    // Fallback method - same as applyPremiumEnhancements but with different naming
    return this.applyPremiumEnhancements(imagePath, options);
  }
}

export const neroAIService = new NeroAIService();