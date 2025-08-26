import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function CookiePolicy() {
  useEffect(() => {
    document.title = "Cookie Policy - PhotoRevive AI | Data Usage Information";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Cookie Policy for PhotoRevive AI. Learn about how we use cookies and similar technologies to improve your experience with our photo restoration service.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">Last updated: August 26, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience and allow certain features to function properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the website to function properly. They enable basic features 
              like page navigation and access to secure areas of the website.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">
              We use analytics cookies to understand how visitors interact with our website. This helps us 
              improve our service and user experience.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Functional Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies remember your preferences and settings to provide a more personalized experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set cookies on our behalf, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Cloud service providers for processing and storage</li>
              <li>CDN providers for content delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Browser settings: Most browsers allow you to block or delete cookies</li>
              <li>Opt-out tools: Use browser privacy settings to limit tracking</li>
              <li>Third-party opt-outs: Visit third-party websites to opt out of their cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Duration</h2>
            <p className="text-gray-700 mb-4">
              We use both session cookies (deleted when you close your browser) and persistent cookies 
              (stored for a longer period) depending on their purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about our use of cookies, please contact us at privacy@photorevive-ai.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}