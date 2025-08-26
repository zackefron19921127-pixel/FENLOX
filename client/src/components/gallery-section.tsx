import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GallerySection() {
  const examples = [
    {
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "Wedding Memory Restored",
      description: "1950s wedding photo with tears and fading completely restored and colorized"
    },
    {
      image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Family Heritage",
      description: "Multi-generational family portrait enhanced with AI face restoration"
    },
    {
      image: "https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      title: "Childhood Memories",
      description: "Heavily damaged childhood photo completely restored with scratch removal"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Restoration Examples</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the incredible transformations our AI has achieved for thousands of satisfied customers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {examples.map((example, index) => (
            <Card
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid={`example-card-${index}`}
            >
              <img
                src={example.image}
                alt={example.title}
                className="w-full h-48 object-cover"
                data-testid={`example-image-${index}`}
              />
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{example.title}</h4>
                <p className="text-gray-600 text-sm">{example.description}</p>
              </div>
            </Card>
          ))}
        </div>


      </div>
    </section>
  );
}
