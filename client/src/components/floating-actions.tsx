import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Back to Top Button */}
      <Button
        onClick={scrollToTop}
        className={`w-14 h-14 bg-white border border-gray-200 rounded-full shadow-lg text-gray-600 hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
          showBackToTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        data-testid="back-to-top-button"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
    </div>
  );
}
