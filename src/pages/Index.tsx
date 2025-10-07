import Navigation from "@/components/Navigation";
import UniversalHero from "@/components/UniversalHero";
import TrustBadges from "@/components/TrustBadges";
import rollsRoyceHero from "@/assets/rolls-royce-city-hero.jpg";
import { Phone } from "lucide-react";
import EnhancedServiceHighlights from "@/components/EnhancedServiceHighlights";
import MultiStepBookingWidget from "@/components/MultiStepBookingWidget";
import EnhancedTestimonials from "@/components/EnhancedTestimonials";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MobileActions from "@/components/MobileActions";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PWAInstall from "@/components/PWAInstall";

const Index = () => {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Supreme Drive Suite",
    "description": "Luxury chauffeur and close protection services in the UK",
    "telephone": "+44-800-123-4567",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressCountry": "UK"
    },
    "priceRange": "£££",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "150"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Luxury Chauffeur & Close Protection Services"
        description="Premium chauffeur and close protection services in the UK. Experienced drivers, luxury vehicles, and 24/7 availability. Book your journey today."
        keywords="luxury chauffeur, close protection, executive transport, bodyguard services, UK chauffeur"
        schema={businessSchema}
      />
      <Navigation />
      <div className="animate-fade-in">
        <UniversalHero
          headline={<>Travel in<br />Supreme Style</>}
          subheading="Experience unparalleled luxury with our elite chauffeur services and professional close protection"
          backgroundImage={rollsRoyceHero}
          backgroundAlt="Ultra-luxury Rolls-Royce chauffeur service in prestigious city skyline"
          overlayStrength="medium"
          primaryCTA={{
            text: "Call 0800 123 4567",
            href: "tel:08001234567",
            icon: <Phone className="w-5 h-5" />
          }}
          secondaryCTA={{
            text: "Book Online",
            href: "#booking"
          }}
          trustLine={["Available 24/7", "Immediate Response", "Discreet Service"]}
          showScrollIndicator={true}
        />
      </div>
      <TrustBadges />
      
      <EnhancedServiceHighlights />
      
      <section id="booking" className="py-24 md:py-28 lg:py-32 bg-gradient-dark">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-accent/80 font-medium mb-2">
              Simple Booking Process
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal">
              Book Your Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your booking in three simple steps
            </p>
          </div>
          <div className="max-w-6xl mx-auto animate-fade-in animation-delay-200">
            <MultiStepBookingWidget />
          </div>
        </div>
      </section>

      <EnhancedTestimonials />

      <section className="py-24 md:py-28 lg:py-32 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in space-y-8">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-gradient-metal">
              Ready to Experience Supreme Service?
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Join our distinguished clients and discover what true luxury transportation means
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="shadow-glow hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all text-lg px-10 py-7 font-semibold min-w-[200px]"
                >
                  Get in Touch
                </Button>
              </Link>
              <a href="#booking">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-accent/30 hover:border-accent/50 hover:bg-accent/10 text-lg px-10 py-7 font-semibold min-w-[200px] transition-all"
                >
                  Book Now
                </Button>
              </a>
            </div>
            <div className="pt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Professional
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Discreet
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                24/7 Availability
              </span>
            </div>
          </div>
        </div>
      </section>

      <PWAInstall />

      <Footer />
      <MobileActions />
      <ScrollToTop />
    </div>
  );
};

export default Index;
