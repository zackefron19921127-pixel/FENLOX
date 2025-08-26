import { Card } from "@/components/ui/card";
import { Sparkles, Wrench, Eye, ZoomIn, Zap, Shield } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Colorization",
      description: "Transform black & white photos into vibrant color images with historically accurate colorization powered by advanced AI models.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Wrench,
      title: "Damage Repair",
      description: "Remove scratches, tears, spots, and other damage from your precious memories. Our AI intelligently fills in missing details.",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: Eye,
      title: "Face Enhancement",
      description: "Sharpen facial features and enhance details to bring clarity to the people in your cherished photographs.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: ZoomIn,
      title: "HD Upscaling",
      description: "Increase resolution up to 4K quality while preserving image details. Perfect for printing or digital display.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Get your restored photos in seconds, not hours. Our optimized AI pipeline delivers fast, professional results.",
      gradient: "from-teal-500 to-green-500"
    },
    {
      icon: Shield,
      title: "Privacy Secure",
      description: "Your photos are processed securely and automatically deleted after download. We prioritize your privacy and security.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Powerful AI Restoration</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced AI technology can transform any old, damaged, or faded photograph into a stunning, high-quality image
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              data-testid={`feature-card-${index}`}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
