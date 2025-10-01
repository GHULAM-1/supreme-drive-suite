import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import luxuryHero from "@/assets/luxury-hero.jpg";

const EnhancedHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={luxuryHero}
          alt="Premium luxury chauffeur service featuring elegant black vehicle with professional driver in executive setting"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/40" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-gradient-metal leading-tight">
              TRAVEL IN<br />SUPREME STYLE
            </h1>
            <p className="text-xl md:text-3xl text-foreground/90 max-w-3xl mx-auto font-light leading-relaxed">
              Experience unparalleled luxury with our elite chauffeur services and professional close protection
            </p>
          </div>

          <p className="text-sm md:text-base text-accent/90 font-medium tracking-wider animate-fade-in-up animation-delay-200">
            Available 24/7 • Immediate Response • Discreet Service
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <a href="tel:08001234567">
              <Button size="lg" className="gradient-accent shadow-glow text-lg px-10 py-7 hover-lift font-semibold">
                <Phone className="w-5 h-5 mr-2" />
                Call 0800 123 4567
              </Button>
            </a>
            <a href="#booking">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-primary/50 hover:bg-primary/10 hover-scale font-semibold">
                Book Online
              </Button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in animation-delay-600">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default EnhancedHero;
