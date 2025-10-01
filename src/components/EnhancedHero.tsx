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
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-gradient-metal leading-tight">
              TRAVEL IN<br />SUPREME STYLE
            </h1>
            <p className="text-lg md:text-2xl text-foreground/90 max-w-3xl mx-auto font-light">
              Experience unparalleled luxury with our elite chauffeur services and professional close protection
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-200">
            <a href="tel:08001234567">
              <Button size="lg" className="gradient-accent shadow-glow text-lg px-8 py-6 hover-lift">
                <Phone className="w-5 h-5 mr-2" />
                Call 0800 123 4567
              </Button>
            </a>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10 hover-scale">
                Book Online
              </Button>
            </Link>
          </div>

          <p className="text-sm text-foreground/70 animate-fade-in-up animation-delay-400">
            Available 24/7 • Immediate Response • Discreet Service
          </p>
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
