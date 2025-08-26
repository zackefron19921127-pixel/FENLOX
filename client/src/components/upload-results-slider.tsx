import { useState, useRef, MouseEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Palette, Eye, Wrench, ArrowLeftRight, RotateCcw } from "lucide-react";

interface UploadResultsSliderProps {
  originalImage: string;
  restoredImage: string;
  options?: {
    colorization?: boolean;
    faceEnhancement?: boolean;
    scratchRemoval?: boolean;
    hdUpscaling?: boolean;
  };
  onTryAnother?: () => void;
}

export default function UploadResultsSlider({ 
  originalImage, 
  restoredImage, 
  options = {},
  onTryAnother
}: UploadResultsSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      setSliderPosition(percentage);
      // Show download button when slider is close to or at the restored side
      setShowDownload(percentage >= 90);
    });
  };

  const handleDownload = () => {
    // Create a temporary link to download the restored image
    const link = document.createElement('a');
    link.href = restoredImage;
    link.download = 'photorevive-restored.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const appliedFeatures = [
    { condition: options.scratchRemoval, icon: Wrench, text: "Scratch Removal", color: "green" },
    { condition: options.colorization, icon: Palette, text: "AI Colorization", color: "blue" },
    { condition: options.faceEnhancement, icon: Eye, text: "Face Enhancement", color: "purple" },
  ].filter(feature => feature.condition);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
          ✨ Photo Successfully Restored! ✨
        </h2>
        <p className="text-lg text-gray-600">
          Drag the slider to see the amazing transformation
        </p>
      </div>

      <Card className="bg-gray-100 rounded-3xl shadow-2xl p-6 md:p-8 backdrop-blur-sm border border-gray-200">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl bg-gray-100 slider-container cursor-col-resize select-none mb-6"
          style={{ aspectRatio: "4/3" }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          data-testid="upload-results-slider"
        >
          {/* Original Image */}
          <img
            src={originalImage}
            alt="Original photo"
            className={`absolute inset-0 w-full h-full object-cover ${!isDragging ? 'transition-all duration-200 ease-out' : ''}`}
            data-testid="upload-original-image"
          />
          
          {/* Restored Image */}
          <div
            className={`absolute inset-0 overflow-hidden ${!isDragging ? 'transition-all duration-200 ease-out' : ''}`}
            style={{ 
              width: `${sliderPosition}%`,
              willChange: isDragging ? 'width' : 'auto'
            }}
          >
            <img
              src={restoredImage}
              alt="AI restored photo"
              className="w-full h-full object-cover"
              style={{ 
                width: `${(100 / sliderPosition) * 100}%`,
                willChange: isDragging ? 'width' : 'auto'
              }}
              data-testid="upload-restored-image"
            />
          </div>
          
          {/* Slider Handle */}
          <div
            className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/80 via-white to-white/80 shadow-2xl slider-handle cursor-col-resize ${!isDragging ? 'transition-all duration-200 ease-out hover:w-1' : ''}`}
            style={{ 
              left: `${sliderPosition}%`, 
              transform: "translateX(-50%)",
              boxShadow: "0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(59,130,246,0.3)",
              willChange: isDragging ? 'left' : 'auto'
            }}
            onMouseDown={handleMouseDown}
            data-testid="upload-slider-handle"
          >
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center border-2 border-gray-300/50 ${!isDragging ? 'transition-all duration-200 hover:scale-110 hover:shadow-2xl' : ''}`}>
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        {/* Enhanced Labels */}
        <div className="flex justify-between mb-6 text-sm font-medium">
          <span 
            className={`transition-all duration-300 ${sliderPosition > 50 ? 'text-gray-400' : 'text-gray-900 font-semibold'}`}
          >
            Original
          </span>
          <span 
            className={`transition-all duration-300 ${sliderPosition < 50 ? 'text-gray-400' : 'text-blue-600 font-semibold'}`}
          >
            AI Restored
          </span>
        </div>

        {/* Enhancement Options */}
        {appliedFeatures.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
            <h4 className="font-semibold text-gray-900 mb-3">Enhancements Applied:</h4>
            <div className="flex flex-wrap gap-2">
              {appliedFeatures.map((feature, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs flex items-center ${
                    feature.color === 'green' ? 'bg-green-100 text-green-800' :
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}
                  data-testid={`upload-feature-${feature.text.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <feature.icon className="w-3 h-3 mr-1" />
                  {feature.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Download Button - Shows when slider is mostly on restored side */}
          {showDownload && (
            <Button
              onClick={handleDownload}
              className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
              data-testid="upload-download-button"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Restored Photo
            </Button>
          )}
          
          {/* Try Another Button */}
          <Button
            onClick={onTryAnother}
            variant="outline"
            className="px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            data-testid="upload-try-another-button"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Another Photo
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            {showDownload 
              ? "Great! Your photo looks amazing. Download it now!" 
              : "Drag the slider to see the restoration magic happen"
            }
          </p>
        </div>
      </Card>
    </div>
  );
}