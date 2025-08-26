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

  // Upload and start restoration
  const uploadPhoto = useMutation({
    mutationFn: async ({
      file,
      options
    }: {
      file: File;
      options: UsePhotoRestorationOptions;
    }) => {
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

      const response = await fetch("/api/photos/restore", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const restoration: PhotoRestoration = await response.json();
      setCurrentRestorationId(restoration.id);
      return restoration;
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  // Poll for restoration status
  const { data: restoration, isLoading: isProcessing } = useQuery({
    queryKey: ["/api/photos/restore", currentRestorationId],
    enabled: !!currentRestorationId,
    refetchInterval: (query) => {
      const data = query.state.data as PhotoRestoration | undefined;
      // Stop polling if completed or failed
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
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
