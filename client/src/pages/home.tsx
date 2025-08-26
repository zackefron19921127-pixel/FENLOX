import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import DemoSection from "@/components/demo-section";
import FeaturesSection from "@/components/features-section";
import GallerySection from "@/components/gallery-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import FloatingActions from "@/components/floating-actions";
import Orb from "@/components/Orb";
import UploadZone from "@/components/upload-zone";
import TextType from "@/components/text-type";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Orb */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>
      
      <Header />
      <main className="relative z-10">
          <HeroSection />
          <DemoSection />
          <section id="upload" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  <TextType
                    text={[
                      "Try It Yourself",
                      "Upload Your Photo",
                      "See AI Magic"
                    ]}
                    as="span"
                    typingSpeed={100}
                    deletingSpeed={60}
                    pauseDuration={2500}
                    initialDelay={1000}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    cursorClassName="text-blue-600"
                    className="text-gray-900"
                    startOnVisible={true}
                    variableSpeed={undefined}
                    onSentenceComplete={undefined}
                  />
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Upload your own photo and see the AI restoration in action
                </p>
              </div>
              <div className="max-w-4xl mx-auto">
                <UploadZone />
              </div>
            </div>
          </section>
          <FeaturesSection />
          <GallerySection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
        <FloatingActions />
    </div>
  );
}
