import { Crown, ShieldCheck, Timer, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";

const services = [
  {
    icon: Crown,
    title: "Luxury Chauffeur",
    description: "Professional drivers and premium vehicles for every occasion. Experience the pinnacle of executive travel with our meticulously maintained fleet and expertly trained chauffeurs."
  },
  {
    icon: ShieldCheck,
    title: "Close Protection",
    description: "Discreet security services from experienced professionals. Military-grade protection protocols combined with seamless luxury service for high-profile clients."
  },
  {
    icon: Timer,
    title: "24/7 Availability",
    description: "Round-the-clock service whenever you need us. Immediate response times with dedicated support ensuring you're never left waiting."
  },
  {
    icon: Medal,
    title: "Premium Experience",
    description: "Unmatched quality and attention to detail. Every journey is crafted to perfection with bespoke services tailored to your exact requirements."
  }
];

const EnhancedServiceHighlights = () => {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-gradient-metal">
            Elite Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Delivering excellence through premium transportation and security solutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.title}
                className="p-10 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-accent/40 transition-all duration-500 hover:-translate-y-3 shadow-metal animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full group-hover:bg-accent/30 transition-all" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/30 group-hover:border-accent/50 transition-all">
                      <Icon className="w-10 h-10 text-accent" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-foreground font-display">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">{service.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EnhancedServiceHighlights;
