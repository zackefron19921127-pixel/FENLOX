import { Sparkles } from "lucide-react";
import logoSvg from "@/assets/logo.svg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Logo and Description */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src={logoSvg} 
                alt="PhotoRevive AI Logo" 
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">PhotoRevive AI</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Bringing your old photos back to life with cutting-edge AI technology. Preserve your memories for generations to come.
            </p>
          </div>

          {/* Legal Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 text-center">
            <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Cookie Policy
            </a>
            <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
              Contact
            </a>
            <a href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
              About Us
            </a>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {currentYear} PhotoRevive AI. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Made with ❤️ for preserving memories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
