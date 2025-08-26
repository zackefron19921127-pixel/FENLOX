// Facewow API integration utility functions

export interface FacewowOptions {
  colorization?: boolean;
  faceEnhancement?: boolean;
  scratchRemoval?: boolean;
  hdUpscaling?: boolean;
}

export interface FacewowResponse {
  success: boolean;
  restoredImageUrl?: string;
  jobId?: string;
  error?: string;
}

export class FacewowAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_FACEWOW_API_KEY || process.env.FACEWOW_API_KEY || "";
    this.baseUrl = "https://api.facewow.ai/v1";
  }

  async restorePhoto(imageFile: File, options: FacewowOptions): Promise<FacewowResponse> {
    try {
      // Convert file to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${this.baseUrl}/restore`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          options: {
            colorization: options.colorization || false,
            faceEnhancement: options.faceEnhancement || true,
            scratchRemoval: options.scratchRemoval || true,
            hdUpscaling: options.hdUpscaling || false,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Facewow API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        restoredImageUrl: result.restoredImageUrl || result.output_url,
        jobId: result.jobId
      };
    } catch (error) {
      // Handle Facewow API error
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  async checkJobStatus(jobId: string): Promise<FacewowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Facewow API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.status === "completed",
        restoredImageUrl: result.restoredImageUrl || result.output_url,
        jobId: result.jobId
      };
    } catch (error) {
      // Handle Facewow job status error
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const facewowAPI = new FacewowAPI();
