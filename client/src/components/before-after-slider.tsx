import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Eye, Wrench, ArrowLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
  originalImage: string;
  restoredImage: string;
  options?: {
    colorization?: boolean;
    faceEnhancement?: boolean;
    scratchRemoval?: boolean;
    hdUpscaling?: boolean;
  };
}

export default function BeforeAfterSlider({ 
  originalImage, 
  restoredImage, 
  options = {} 
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMove = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Get X position from either mouse or touch event
    const x = 'clientX' in e ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      setSliderPosition(percentage);
    });
  };



  const appliedFeatures = [
    { condition: options.scratchRemoval, icon: Wrench, text: "Scratch Removal", color: "green" },
    { condition: options.colorization, icon: Palette, text: "AI Colorization", color: "blue" },
    { condition: options.faceEnhancement, icon: Eye, text: "Face Enhancement", color: "purple" },
  ].filter(feature => feature.condition);

  return (
    <Card className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100 max-w-4xl mx-auto">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl bg-gray-100 slider-container cursor-col-resize select-none"
        style={{ 
          aspectRatio: "4/3",
          touchAction: "none"
        }}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        data-testid="before-after-slider"
      >
        {/* Original Image - No transitions during drag for smooth performance */}
        <img
          src={originalImage}
          alt="Original photo"
          className={`absolute inset-0 w-full h-full object-cover ${!isDragging ? 'transition-all duration-200 ease-out' : ''}`}
          data-testid="original-image"
        />
        
        {/* Restored Image - Optimized for smooth dragging */}
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
            data-testid="restored-image"
          />
        </div>
        
        {/* Subtle overlay for depth - Only when not dragging */}
        {!isDragging && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `linear-gradient(90deg, 
                rgba(0,0,0,0.1) 0%, 
                transparent ${Math.max(0, sliderPosition - 5)}%, 
                transparent ${Math.min(100, sliderPosition + 5)}%, 
                rgba(0,0,0,0.1) 100%)`
            }}
          />
        )}
        
        {/* Enhanced Slider Handle - Optimized for smooth dragging */}
        <div
          className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/80 via-white to-white/80 shadow-2xl slider-handle cursor-col-resize ${!isDragging ? 'transition-all duration-200 ease-out hover:w-1' : ''}`}
          style={{ 
            left: `${sliderPosition}%`, 
            transform: "translateX(-50%)",
            boxShadow: "0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(59,130,246,0.3)",
            willChange: isDragging ? 'left' : 'auto'
          }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          data-testid="slider-handle"
        >
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center border-2 border-white/50 ${!isDragging ? 'transition-all duration-200 hover:scale-110 hover:shadow-2xl' : ''}`}>
            <ArrowLeftRight className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
      
      {/* Enhanced Labels with animation */}
      <div className="flex justify-between mt-4 text-sm font-medium">
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
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-4">Enhancement Applied:</h4>
          <div className="flex flex-wrap gap-3">
            {appliedFeatures.map((feature, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full text-sm flex items-center ${
                  feature.color === 'green' ? 'bg-green-100 text-green-800' :
                  feature.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}
                data-testid={`feature-${feature.text.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <feature.icon className="w-4 h-4 mr-2" />
                {feature.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Try It Yourself Section */}
      <div className="mt-8 text-center">
        <Button
          onClick={() => {
            const uploadSection = document.getElementById('upload');
            if (uploadSection) {
              uploadSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          data-testid="try-it-button"
        >
          Try It Yourself
        </Button>
        <p className="text-sm text-gray-500 mt-3">Upload your own photos for AI restoration</p>
      </div>
    </Card>
  );
}
