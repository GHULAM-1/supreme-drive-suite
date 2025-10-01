import Navigation from "@/components/Navigation";
import EnhancedHero from "@/components/EnhancedHero";
import TrustBadges from "@/components/TrustBadges";
import EnhancedServiceHighlights from "@/components/EnhancedServiceHighlights";
import MultiStepBookingWidget from "@/components/MultiStepBookingWidget";
import EnhancedTestimonials from "@/components/EnhancedTestimonials";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MobileActions from "@/components/MobileActions";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
      <EnhancedHero />
      <TrustBadges />
      
      <EnhancedServiceHighlights />
      
      <section id="booking" className="py-24 bg-gradient-dark">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal">
              Book Your Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your booking in three simple steps
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <MultiStepBookingWidget />
          </div>
        </div>
      </section>

      <EnhancedTestimonials />

      <section className="py-24 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 text-gradient-metal">
            Ready to Experience Supreme Service?
          </h2>
          <p className="text-xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our distinguished clients and discover what true luxury transportation means
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact">
              <Button size="lg" className="gradient-accent shadow-glow hover-lift text-lg px-10 py-7 font-semibold">
                Get in Touch
              </Button>
            </Link>
            <a href="#booking">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover-scale text-lg px-10 py-7 font-semibold">
                Book Now
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <MobileActions />
      <ScrollToTop />
    </div>
  );
};

export default Index;
