import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from "../assets/logo.svg";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const navigateToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location !== "/") {
      setLocation("/");
      // Wait for navigation, then scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // If we're already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 pointer-events-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={logoUrl} 
              alt="PhotoRevive AI Logo" 
              className="w-10 h-9" 
            />
            <span className="text-xl font-bold text-gradient-primary">PhotoRevive AI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigateToSection("home")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              data-testid="nav-home"
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection("upload")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              data-testid="nav-upload"
            >
              Try It
            </button>
            <button
              onClick={() => navigateToSection("features")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              data-testid="nav-features"
            >
              Features
            </button>
            <button
              onClick={() => navigateToSection("about")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              data-testid="nav-about"
            >
              About
            </button>
            <button
              onClick={() => navigateToSection("contact")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
          </nav>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4 pt-4">
              <button
                onClick={() => navigateToSection("home")}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button
                onClick={() => navigateToSection("upload")}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                data-testid="mobile-nav-upload"
              >
                Try It
              </button>
              <button
                onClick={() => navigateToSection("features")}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                data-testid="mobile-nav-features"
              >
                Features
              </button>
              <button
                onClick={() => navigateToSection("about")}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                data-testid="mobile-nav-about"
              >
                About
              </button>
              <button
                onClick={() => navigateToSection("contact")}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
