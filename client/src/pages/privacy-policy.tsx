import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy - PhotoRevive AI | Photo Restoration Service";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for PhotoRevive AI. Learn how we collect, use, and protect your personal information and photos when using our AI photo restoration service.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">Last updated: August 26, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">Photos and Images</h3>
            <p className="text-gray-700 mb-4">
              When you use PhotoRevive AI, you upload photos for restoration. These images are temporarily processed on our servers 
              and are automatically deleted within 24 hours of processing completion.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Usage Data</h3>
            <p className="text-gray-700 mb-4">
              We collect information about how you use our service, including processing times, restoration options selected, 
              and general usage patterns to improve our AI models and service quality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To process and restore your uploaded photos using AI technology</li>
              <li>To improve our AI models and restoration algorithms</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To analyze usage patterns and improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your photos and data. All uploads are encrypted 
              in transit and at rest. Photos are processed in secure cloud environments and automatically deleted after processing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              Uploaded photos are automatically deleted from our servers within 24 hours of processing completion. 
              We do not store your photos permanently unless you explicitly create an account and choose to save them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We use trusted third-party AI services to process your photos. These services are bound by strict 
              confidentiality agreements and data protection standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to request information about your data, request deletion of your data, 
              and withdraw consent for data processing at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at privacy@photorevive-ai.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}