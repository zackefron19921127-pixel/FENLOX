import BeforeAfterSlider from "@/components/before-after-slider";
import { Card } from "@/components/ui/card";
import { Sparkles, Palette, Eye, Wrench, Zap } from "lucide-react";
import beforeImage from "@assets/generated_images/Damaged_vintage_family_portrait_cc2e207c.png";
import afterImage from "@assets/generated_images/Restored_colorized_family_portrait_29efa125.png";

export default function DemoSection() {
  const features = [
    {
      icon: Palette,
      title: "AI Colorization",
      description: "Transform black & white photos into vibrant, naturally colored images"
    },
    {
      icon: Wrench,
      title: "Scratch Removal",
      description: "Automatically detect and remove scratches, tears, and damage"
    },
    {
      icon: Eye,
      title: "Face Enhancement",
      description: "Sharpen facial features and improve clarity for better portraits"
    },
    {
      icon: Zap,
      title: "HD Upscaling",
      description: "Increase resolution while maintaining photo quality and detail"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16 max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 bg-gray-100/80 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            <span className="text-xs md:text-sm font-semibold text-gray-700">Live Demo</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
            See AI Photo Restoration in Action
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Drag the slider to see how our AI transforms old, damaged photos into stunning restored memories. 
            This is a real example of our photo restoration technology.
          </p>
        </div>

        {/* Interactive Demo - Mobile Optimized */}
        <div className="mb-12 md:mb-16 px-2 md:px-0">
          <BeforeAfterSlider
            originalImage={beforeImage}
            restoredImage={afterImage}
            options={{
              colorization: true,
              faceEnhancement: true,
              scratchRemoval: true,
              hdUpscaling: true
            }}
          />
        </div>

        {/* Features Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-100/90 backdrop-blur-sm border-0 shadow-lg p-4 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">{feature.title}</h3>
              <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Clean call to action without button */}
        <div className="text-center mt-16">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Ready to Restore Your Photos?</h3>
            <p className="text-gray-600 mb-6">Upload your photos below and watch our AI bring them back to life!</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-center">Instant processing • No signup required • Download immediately</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}