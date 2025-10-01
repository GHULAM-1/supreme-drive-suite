import { Shield, Car, Clock, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import serviceChauffeur from "@/assets/service-chauffeur.jpg";
import serviceProtection from "@/assets/service-protection.jpg";

const services = [
  {
    icon: Car,
    title: "Luxury Chauffeur",
    description: "Arrive in style with our premium fleet and professional drivers",
    image: serviceChauffeur,
  },
  {
    icon: Shield,
    title: "Close Protection",
    description: "Discreet security services from experienced professionals",
    image: serviceProtection,
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round-the-clock service for your convenience and peace of mind",
  },
  {
    icon: Award,
    title: "Premium Experience",
    description: "Unmatched attention to detail and customer satisfaction",
  },
];

const EnhancedServiceHighlights = () => {
  return (
    <section className="py-20 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-metal">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exceptional service tailored to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className={`p-6 shadow-metal bg-card/50 backdrop-blur hover-lift transition-smooth animate-fade-in-up animation-delay-${index * 200}`}
            >
              {service.image ? (
                <div className="relative mb-6 rounded-lg overflow-hidden">
                  <img
                    src={service.image}
                    alt={`Professional ${service.title.toLowerCase()} service with luxury vehicle and trained chauffeur`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
              ) : (
                <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-accent/20">
                  <service.icon className="w-8 h-8 text-accent" />
                </div>
              )}
              
              <h3 className="text-2xl font-display font-semibold mb-3 text-primary">
                {service.title}
              </h3>
              <p className="text-muted-foreground">
                {service.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnhancedServiceHighlights;
