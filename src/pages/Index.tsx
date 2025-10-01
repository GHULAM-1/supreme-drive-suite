import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ServiceHighlights from "@/components/ServiceHighlights";
import BookingWidget from "@/components/EnhancedBookingWidget";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MobileActions from "@/components/MobileActions";
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
      <Hero />
      
      <ServiceHighlights />
      
      <section className="py-20 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <BookingWidget />
          </div>
        </div>
      </section>

      <TestimonialsCarousel />

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gradient-metal">
            Ready to Experience Supreme Service?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your requirements or make a booking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="gradient-accent shadow-glow">
                Get in Touch
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-primary/50">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileActions />
    </div>
  );
};

export default Index;
