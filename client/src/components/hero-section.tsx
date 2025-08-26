import { Check } from "lucide-react";
import UploadZone from "@/components/upload-zone";

import TextType from "@/components/text-type";

export default function HeroSection() {
  const features = [
    "Instant Results",
    "AI Colorization", 
    "Scratch Removal",
    "Face Enhancement"
  ];

  return (
    <section id="home" className="pt-20 md:pt-24 pb-12 md:pb-20 min-h-screen flex items-center relative">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16 relative z-10 max-w-6xl">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            <TextType
              text={[
                "Bring Your Old Photos\nBack to Life",
                "Restore Faded Memories\nWith AI Magic",
                "Transform Damaged Photos\nInto Treasures"
              ]}
              as="span"
              typingSpeed={80}
              deletingSpeed={50}
              pauseDuration={3000}
              initialDelay={500}
              loop={true}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="text-blue-600 animate-pulse"
              className="text-gradient-primary"
              startOnVisible={true}
              variableSpeed={undefined}
              onSentenceComplete={undefined}
            />
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
            Transform damaged, faded, or black & white photos with AI-powered restoration. 
            Remove scratches, add color, and enhance details in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 md:mb-12 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2 text-gray-600 text-sm md:text-base">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
