import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ContactSection from "@/components/contact-section";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Us - PhotoRevive AI | Get Support & Help";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact PhotoRevive AI for support, questions, or feedback about our AI photo restoration service. Get help with photo processing, technical issues, or general inquiries.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="py-24">
        <div className="container mx-auto px-4 mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Have questions about our photo restoration service? Need help with your photos? 
            We're here to help you bring your memories back to life.
          </p>
        </div>
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}