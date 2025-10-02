import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import rollsRoyceHero from "@/assets/rolls-royce-hero.jpg";

const EnhancedHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={rollsRoyceHero}
          alt="Ultra-luxury Rolls-Royce chauffeur service at prestigious hotel entrance with professional executive transport"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-gradient-metal leading-[0.85] tracking-tight">
              TRAVEL IN<br />SUPREME STYLE
            </h1>
            <p className="text-xl md:text-3xl text-foreground/90 max-w-3xl mx-auto font-light leading-relaxed">
              Experience unparalleled luxury with our elite chauffeur services and professional close protection
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up animation-delay-200">
            <p className="text-xs md:text-sm text-muted-foreground/80 font-medium tracking-wider">
              Available 24/7 · Immediate Response · Discreet Service
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="tel:08001234567">
                <Button size="lg" className="gradient-accent shadow-glow text-lg px-8 py-4 hover:shadow-glow transition-all font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Call 0800 123 4567
                </Button>
              </a>
              <a href="#booking">
                <Button size="lg" className="text-lg px-8 py-4 border-2 border-muted-foreground/40 bg-transparent hover:bg-accent/10 hover:border-accent text-foreground hover:text-accent hover:shadow-glow transition-all font-semibold">
                  Book Online
                </Button>
              </a>
            </div>
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
