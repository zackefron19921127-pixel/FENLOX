import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Sparkles, Heart, Zap, Users } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "About Us - PhotoRevive AI | Our Mission & Technology";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about PhotoRevive AI\'s mission to preserve memories through advanced AI technology. Discover our story, team, and commitment to bringing old photos back to life.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About PhotoRevive AI</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600 text-center mb-12">
              We're on a mission to preserve precious memories by bringing old, damaged photos back to life 
              using cutting-edge artificial intelligence technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                PhotoRevive AI was born from a simple belief: every photo tells a story, and every story deserves to be preserved. 
                We've witnessed the magic that happens when families rediscover faded memories through restored photographs.
              </p>
              <p className="text-gray-700 mb-4">
                Using advanced machine learning algorithms and computer vision technology, we've created a service that makes 
                professional-quality photo restoration accessible to everyone, regardless of technical expertise.
              </p>
              <p className="text-gray-700">
                Our team combines expertise in artificial intelligence, image processing, and user experience design to create 
                tools that honor the past while embracing the future.
              </p>
            </div>
            
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Our Technology</h2>
              <p className="text-gray-700 mb-4">
                We leverage state-of-the-art AI models trained on millions of historical photographs to understand how images 
                degrade over time and how to reverse that process effectively.
              </p>
              <p className="text-gray-700 mb-4">
                Our restoration process includes advanced algorithms for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Intelligent colorization that respects historical accuracy</li>
                <li>Scratch and damage detection and removal</li>
                <li>Facial feature enhancement and clarity improvement</li>
                <li>High-definition upscaling while preserving detail</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">Advanced machine learning for accurate restoration</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Memory Focused</h3>
              <p className="text-sm text-gray-600">Dedicated to preserving family memories</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">Results in seconds, not hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">User-Friendly</h3>
              <p className="text-sm text-gray-600">Simple interface for everyone to use</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
              To democratize access to professional photo restoration technology, ensuring that precious family memories 
              can be preserved and shared for generations to come. We believe that every photograph, no matter how damaged 
              or faded, contains irreplaceable moments that deserve to be rescued and cherished.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Join Our Community</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Thousands of families have already restored their precious memories with PhotoRevive AI. 
              Join our growing community and bring your old photos back to life today.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}