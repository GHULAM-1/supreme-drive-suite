import { Crown, ShieldCheck, Timer, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";

const services = [
  {
    icon: Crown,
    title: "Luxury Chauffeur",
    description: "Executive fleet and professional drivers delivering exceptional travel experiences with meticulous attention to every detail."
  },
  {
    icon: ShieldCheck,
    title: "Close Protection",
    description: "Discreet professional security with military-grade protocols, providing seamless protection for high-profile clients."
  },
  {
    icon: Timer,
    title: "24/7 Availability",
    description: "Round-the-clock support with immediate response times, ensuring premium service whenever you need us."
  },
  {
    icon: Medal,
    title: "Premium Experience",
    description: "Bespoke service and unmatched attention to detail, crafting every journey to perfection."
  }
];

const EnhancedServiceHighlights = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal">
            Elite Services
          </h2>
          <p className="text-lg text-muted-foreground uppercase tracking-wider">
            Delivering excellence through premium transportation and security solutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.title}
                className="p-10 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-[hsl(45,100%,50%)]/40 transition-all duration-500 hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_10px_40px_rgba(255,215,0,0.2)] animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(45,100%,50%)] to-[hsl(35,100%,40%)] opacity-20 blur-2xl rounded-full group-hover:opacity-30 transition-all" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(45,100%,50%)] to-[hsl(35,100%,40%)] flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)] group-hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all">
                      <Icon className="w-10 h-10 text-background" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="space-y-4">
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
