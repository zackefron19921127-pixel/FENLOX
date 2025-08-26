import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePhotoRestoration } from "@/hooks/use-photo-restoration";
import BeforeAfterSlider from "@/components/before-after-slider";
import UploadResultsSlider from "@/components/upload-results-slider";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploadPhoto,
    isUploading,
    uploadProgress,
    restoration,
    isProcessing,
    reset,
  } = usePhotoRestoration();



  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp',
      'image/jfif', 'image/jfi', 'image/jpe', 'image/jif', 'image/heic', 'image/heif'
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a supported image file (JPG, JPEG, PNG, BMP, WEBP, JFIF, JFI, JPE, JIF, HEIC, HEIF).');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB.');
      return;
    }

    setSelectedFile(file);
    uploadPhoto(file, {
      colorization: true,
      faceEnhancement: true,
      scratchRemoval: true,
      hdUpscaling: false,
    });
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Show results if restoration is completed
  const restorationData = restoration as any;
  
  // Force component to check for completed restoration
  const isCompleted = restorationData?.status === "completed" && restorationData?.restoredImageUrl;
  
  if (isCompleted) {
    
    // Scroll to results after a short delay to ensure rendering
    setTimeout(() => {
      const resultsElement = document.getElementById('photo-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    return (
      <div id="photo-results" className="w-full">
        <UploadResultsSlider
          originalImage={restorationData.originalImageUrl}
          restoredImage={restorationData.restoredImageUrl}
          options={restorationData.options}
          onTryAnother={() => {
            reset();
            setSelectedFile(null);
            // Scroll back to upload section
            const uploadElement = document.querySelector('[data-testid="upload-zone"]');
            if (uploadElement) {
              uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      </div>
    );
  }

  return (
    <Card
      className={`relative bg-gradient-soft backdrop-blur-sm border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
        isDragging 
          ? 'border-blue-400 bg-blue-50/50' 
          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      data-testid="upload-zone"
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/bmp,image/webp,image/jfif,image/jfi,image/jpe,image/jif,image/heic,image/heif"
        onChange={handleFileInputChange}
        data-testid="file-input"
      />
      
      {(isUploading || isProcessing || (restorationData && restorationData.status === "processing")) ? (
        <div data-testid="upload-progress">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isUploading ? "Uploading..." : "Processing Your Photo..."}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {isUploading ? "Uploading your image" : "AI is analyzing and restoring your image"}
          </p>
          <Progress value={isUploading ? uploadProgress : 75} className="w-full max-w-md mx-auto" />
          
          {/* Processing Steps */}
          {restorationData && restorationData.status === "processing" && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Analyzing image quality...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-300"></div>
                <span>Removing scratches and damage...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-600"></div>
                <span>Enhancing facial features...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-900"></div>
                <span>Adding natural colors...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div data-testid="upload-content">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CloudUpload className="text-white w-8 h-8" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Upload Your Photo</h3>
          <p className="text-gray-600 mb-6">Drag and drop your photo here or click to browse</p>
          <p className="text-sm text-gray-500">Supports JPG, JPEG, PNG, BMP, WEBP, JFIF, JFI, JPE, JIF, HEIC, HEIF up to 100MB</p>
        </div>
      )}

      {restorationData && restorationData.status === "failed" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="error-message">
          <p className="text-red-600">
            Error: {restorationData.errorMessage || "Failed to process photo. Please try again."}
          </p>
        </div>
      )}
    </Card>
  );
}
