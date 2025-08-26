import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service - PhotoRevive AI | AI Photo Restoration";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms of Service for PhotoRevive AI. Read our terms and conditions for using our AI-powered photo restoration service, including usage rights and limitations.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">Last updated: August 26, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using PhotoRevive AI, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              PhotoRevive AI provides AI-powered photo restoration services including colorization, scratch removal, 
              face enhancement, and HD upscaling. The service is provided "as is" and we make no guarantees about 
              the quality of restoration results.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You must own or have rights to the photos you upload</li>
              <li>You must not upload inappropriate, illegal, or copyrighted content</li>
              <li>You must not attempt to reverse engineer or misuse our AI technology</li>
              <li>You must comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              You retain ownership of your original photos. Restored photos are provided to you for personal use. 
              Our AI technology, algorithms, and service remain our intellectual property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Limitations</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>File size limit: 10MB per image</li>
              <li>Supported formats: JPEG, PNG</li>
              <li>Processing time may vary based on image complexity</li>
              <li>Service availability is not guaranteed 24/7</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Disclaimers</h2>
            <p className="text-gray-700 mb-4">
              PhotoRevive AI is provided "as is" without warranties of any kind. We do not guarantee specific 
              restoration results and are not liable for any damages arising from use of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate or suspend access to our service at any time for any reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us at legal@photorevive-ai.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}