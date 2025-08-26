// Replicate AI API integration for photo restoration
import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';

export interface ReplicateOptions {
  colorization?: boolean;
  faceEnhancement?: boolean;
  scratchRemoval?: boolean;
  hdUpscaling?: boolean;
}

export interface ReplicateResponse {
  success: boolean;
  restoredImageUrl?: string;
  error?: string;
}

export class ReplicateService {
  private replicate: Replicate | null = null;

  constructor() {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (apiToken) {
      this.replicate = new Replicate({
        auth: apiToken
      });
      console.log('Replicate API configured: YES');
    } else {
      console.log('Replicate API configured: NO');
    }
  }

  async restorePhoto(imagePath: string, options: ReplicateOptions): Promise<ReplicateResponse> {
    if (!this.replicate) {
      return {
        success: false,
        error: 'Replicate API token not configured'
      };
    }

    try {
      console.log('🎨 Starting Replicate AI photo restoration...');
      
      // Upload image to get public URL
      const imageUrl = await this.uploadImageFile(imagePath);
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      let processedImageUrl = imageUrl;
      
      // Apply face enhancement first (most important)
      if (options.faceEnhancement) {
        console.log('👤 Enhancing faces with GFPGAN...');
        processedImageUrl = await this.applyFaceRestoration(processedImageUrl);
      }
      
      // Apply general restoration and upscaling
      if (options.scratchRemoval || options.hdUpscaling) {
        console.log('🔧 Removing artifacts and upscaling with Real-ESRGAN...');
        const scale = options.hdUpscaling ? 4 : 2;
        processedImageUrl = await this.applyRealESRGAN(processedImageUrl, scale, options.faceEnhancement);
      }
      
      // Apply colorization last
      if (options.colorization) {
        console.log('🎨 Adding colors with DDColor...');
        processedImageUrl = await this.applyColorization(processedImageUrl);
      }
      
      // Download and save the final result
      const localPath = await this.downloadResult(processedImageUrl, imagePath);
      
      console.log('✅ Replicate AI restoration completed successfully!');
      
      return {
        success: true,
        restoredImageUrl: localPath
      };

    } catch (error) {
      console.error('Replicate AI processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async uploadImageFile(imagePath: string): Promise<string> {
    // For now, create a data URL - in production you'd use a proper file host
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  }

  private async applyFaceRestoration(imageUrl: string): Promise<string> {
    if (!this.replicate) throw new Error('Replicate not configured');
    
    const output = await this.replicate.run(
      "tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
      {
        input: {
          img: imageUrl,
          version: "v1.4",
          scale: 2
        }
      }
    );
    
    return Array.isArray(output) ? output[0] : output as string;
  }

  private async applyRealESRGAN(imageUrl: string, scale: number, faceEnhance: boolean = false): Promise<string> {
    if (!this.replicate) throw new Error('Replicate not configured');
    
    const output = await this.replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      {
        input: {
          image: imageUrl,
          scale: scale,
          face_enhance: faceEnhance
        }
      }
    );
    
    return Array.isArray(output) ? output[0] : output as string;
  }

  private async applyColorization(imageUrl: string): Promise<string> {
    if (!this.replicate) throw new Error('Replicate not configured');
    
    const output = await this.replicate.run(
      "cjwbw/bigcolor:9451bfbf652b21f3d7c68747dfa02d7a15245d0e82aac04932ced9f13d8c45ab",
      {
        input: {
          image: imageUrl
        }
      }
    );
    
    return Array.isArray(output) ? output[0] : output as string;
  }

  private async downloadResult(resultUrl: string, originalPath: string): Promise<string> {
    const timestamp = Date.now();
    const originalExt = path.extname(originalPath) || '.jpg';
    const outputPath = path.join(path.dirname(originalPath), `replicate-restored-${timestamp}${originalExt}`);
    
    const response = await fetch(resultUrl);
    if (!response.ok) {
      throw new Error(`Failed to download result: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    
    const filename = path.basename(outputPath);
    return `/uploads/${filename}`;
  }
}

export const replicateService = new ReplicateService();