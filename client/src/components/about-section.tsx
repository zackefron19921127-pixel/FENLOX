import { Card } from "@/components/ui/card";
import { Brain, Clock, Heart } from "lucide-react";

export default function AboutSection() {
  const stats = [
    { value: "50,000+", label: "Photos Restored" },
    { value: "12,000+", label: "Happy Customers" },
    { value: "99%", label: "Satisfaction Rate" }
  ];

  const highlights = [
    {
      icon: Brain,
      title: "Advanced AI",
      description: "State-of-the-art neural networks trained on millions of photos",
      color: "blue"
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Get your restored photos in seconds, not hours or days",
      color: "purple"
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every algorithm is crafted with care for your precious memories",
      color: "green"
    }
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About PhotoRevive AI</h2>
            <p className="text-xl text-gray-600">
              Preserving memories through cutting-edge artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="AI research team working on photo restoration"
                className="rounded-3xl shadow-xl w-full h-auto"
                data-testid="about-image"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 text-lg mb-6">
                PhotoRevive AI was founded with a simple mission: to help people preserve and restore their most precious memories using the power of artificial intelligence.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                Our team of AI researchers and computer vision experts have developed state-of-the-art algorithms that can intelligently restore damaged photos, colorize black and white images, and enhance facial details with unprecedented accuracy.
              </p>
              <div className="flex items-center space-x-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-3xl font-bold ${index === 0 ? 'text-blue-600' : index === 1 ? 'text-purple-600' : 'text-green-600'}`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-gradient-soft rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PhotoRevive AI?</h3>
              <p className="text-gray-600 text-lg">We combine cutting-edge technology with a passion for preserving memories</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="text-center" data-testid={`highlight-${index}`}>
                  <div className={`w-16 h-16 ${
                    highlight.color === 'blue' ? 'bg-blue-100' :
                    highlight.color === 'purple' ? 'bg-purple-100' : 'bg-green-100'
                  } rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <highlight.icon className={`${
                      highlight.color === 'blue' ? 'text-blue-600' :
                      highlight.color === 'purple' ? 'text-purple-600' : 'text-green-600'
                    } w-8 h-8`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{highlight.title}</h4>
                  <p className="text-gray-600 text-sm">{highlight.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
