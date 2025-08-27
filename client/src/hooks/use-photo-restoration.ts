import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type PhotoRestoration } from "@shared/schema";

interface UsePhotoRestorationOptions {
  colorization?: boolean;
  faceEnhancement?: boolean;
  scratchRemoval?: boolean;
  hdUpscaling?: boolean;
}

export function usePhotoRestoration() {
  const [currentRestorationId, setCurrentRestorationId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedRestoration, setUploadedRestoration] = useState<PhotoRestoration | null>(null);

  // Upload and start restoration
  const uploadPhoto = useMutation({
    mutationFn: async ({
      file,
      options
    }: {
      file: File;
      options: UsePhotoRestorationOptions;
    }) => {
      console.log("🚀 Starting photo upload:", file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("options", JSON.stringify(options));

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      const uploadUrl = "/api/photos/restore";
      console.log("📤 Sending upload request to", uploadUrl);
      console.log("🌐 Current window location:", window.location.href);
      console.log("🌐 Base URL being used:", window.location.origin + uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("📨 Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Upload failed:", errorData);
        throw new Error(errorData.error || "Upload failed");
      }

      const restoration: PhotoRestoration = await response.json();
      console.log("✅ Upload successful, restoration ID:", restoration.id);
      console.log("📊 Restoration data:", restoration);
      setCurrentRestorationId(restoration.id);
      setUploadedRestoration(restoration);
      return restoration;
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  // Poll for restoration status  
  const { data: restoration, isLoading: isProcessing } = useQuery({
    queryKey: ["/api/photos", currentRestorationId],
    enabled: !!currentRestorationId,
    queryFn: async () => {
      if (!currentRestorationId) return null;
      console.log("🔄 Polling restoration status for ID:", currentRestorationId);
      
      const response = await fetch(`/api/photos/${currentRestorationId}`);
      console.log("📨 Polling response status:", response.status);
      
      if (!response.ok) {
        console.error("❌ Polling failed:", response.status);
        throw new Error("Failed to fetch restoration status");
      }
      
      const pollingData = await response.json();
      console.log("📊 Polling data received:", pollingData);
      
      // Use the original upload data if available, otherwise use polling data
      return pollingData || uploadedRestoration;
    },
    refetchInterval: (query) => {
      const data = query.state.data as PhotoRestoration | undefined;
      
      // Only log when we have actual status data to reduce noise
      if (data?.status) {
        console.log("⏰ Checking if should continue polling. Status:", data.status);
      }
      
      // Stop polling if completed or failed
      if (data?.status === "completed" || data?.status === "failed") {
        console.log("✅ Stopping polling - restoration complete");
        return false;
      }
      
      // Only log continuation when we have a status (not undefined)
      if (data?.status) {
        console.log("🔄 Continuing to poll...");
      }
      
      return 2000; // Poll every 2 seconds
    },
    refetchIntervalInBackground: false,
  });

  const uploadPhotoWithOptions = (file: File, options: UsePhotoRestorationOptions) => {
    uploadPhoto.mutate({ file, options });
  };

  const reset = () => {
    setCurrentRestorationId(null);
    setUploadProgress(0);
    uploadPhoto.reset();
  };

  return {
    uploadPhoto: uploadPhotoWithOptions,
    isUploading: uploadPhoto.isPending,
    uploadProgress,
    restoration,
    isProcessing: isProcessing && (restoration as any)?.status === "processing",
    error: uploadPhoto.error,
    reset,
  };
}
