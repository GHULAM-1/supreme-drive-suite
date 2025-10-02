import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import UniversalHero from "@/components/UniversalHero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Briefcase, Sparkles, Map, UserCheck, Car, Shield, Clock, Star, Phone } from "lucide-react";
import chauffeurHero from "@/assets/chauffeur-hero.jpg";
import EnhancedTestimonials from "@/components/EnhancedTestimonials";
import MultiStepBookingWidget from "@/components/MultiStepBookingWidget";
import SEO from "@/components/SEO";

const ChauffeurServices = () => {
  const services = [
    {
      title: "Airport Transfers",
      description: "Arrive relaxed and on time with our professional meet-and-greet service. Flight tracking ensures we're always ready when you land.",
      icon: Plane,
      cta: "Book Airport Transfer",
      serviceType: "Airport transfer",
      prefilledText: "Airport transfer - Meet and greet service required",
    },
    {
      title: "Corporate Travel",
      description: "Confidential executive transport for meetings, events, and roadshows. WiFi, charging, and multiple stops as standard.",
      icon: Briefcase,
      cta: "Book Corporate Journey",
      serviceType: "Corporate travel",
      prefilledText: "Corporate travel - Executive transportation",
    },
    {
      title: "Special Events",
      description: "Make your entrance unforgettable. From weddings to galas, we deliver red-carpet service with champagne on arrival.",
      icon: Sparkles,
      cta: "Book Event Transport",
      serviceType: "Special event",
      prefilledText: "Special event transport",
    },
    {
      title: "City Tours",
      description: "Discover hidden gems with a knowledgeable chauffeur. Custom itineraries, flexible timing, perfect for photography.",
      icon: Map,
      cta: "Book City Tour",
      serviceType: "City tour",
      prefilledText: "Bespoke city tour - Custom itinerary",
    },
  ];

  const trustPillars = [
    {
      icon: UserCheck,
      title: "Professional Chauffeurs",
      description: "Vetted, trained professionals with impeccable service standards",
    },
    {
      icon: Car,
      title: "Immaculate Vehicles",
      description: "Mercedes S-Class, Rolls-Royce Phantom, Range Rover fleet",
    },
    {
      icon: Shield,
      title: "Discreet & Reliable",
      description: "Absolute confidentiality and punctuality guaranteed",
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Immediate response for urgent bookings, any time of day",
    },
  ];

  const handleServiceClick = (serviceType: string, prefilledText: string) => {
    sessionStorage.setItem('prefilledService', serviceType);
    sessionStorage.setItem('prefilledRequirements', prefilledText);
    
    const bookingSection = document.getElementById('booking');
    bookingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroCTA = () => {
    const bookingSection = document.getElementById('booking');
    bookingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Luxury Chauffeur Services"
        description="Experience unparalleled luxury with our elite chauffeur services. Professional airport transfers, corporate travel, special events, and bespoke city tours."
        keywords="luxury chauffeur, executive transport, airport transfers, corporate travel, chauffeur services"
      />
      
      <Navigation />
      
      <UniversalHero
        headline={<>Luxury<br />Chauffeur Services</>}
        subheading="Executive travel tailored to your schedule, with unmatched comfort and discretion"
        backgroundImage={chauffeurHero}
        backgroundAlt="Professional luxury chauffeur service at airport terminal"
        overlayStrength="medium"
        primaryCTA={{
          text: "Book Your Journey",
          onClick: handleHeroCTA
        }}
        secondaryCTA={{
          text: "Call 0800 123 4567",
          href: "tel:08001234567",
          icon: <Phone className="w-5 h-5" />
        }}
        trustLine={["Available 24/7", "Discreet Service", "Immediate Response"]}
        minHeight="min-h-[75vh]"
      />

      {/* Service Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                Our Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tailored luxury transportation for every occasion
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card 
                  key={index} 
                  className="p-8 bg-card/60 backdrop-blur-lg border border-primary/20 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-16 h-16 rounded-full gradient-metal flex items-center justify-center mb-4">
                      <service.icon className="w-8 h-8 text-background" />
                    </div>
                    
                    <h3 className="text-2xl font-display font-bold text-primary mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed flex-1 mb-6">
                      {service.description}
                    </p>

                    <Button
                      onClick={() => handleServiceClick(service.serviceType, service.prefilledText)}
                      className="w-full gradient-accent shadow-glow hover:scale-105 transition-transform"
                    >
                      {service.cta} →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal text-center mb-16">
              Why Leading Executives Choose Us
            </h2>

            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8">
              {trustPillars.map((pillar, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="flex justify-center">
                    <pillar.icon className="w-12 h-12 text-[#C5A572]" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                What Our Clients Say
              </h2>
              <p className="text-lg text-muted-foreground">
                Trusted by executives, families, and event organizers
              </p>
            </div>
            <EnhancedTestimonials />
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                Book Your Chauffeur Service
              </h2>
              <p className="text-lg text-muted-foreground">
                Complete your booking in three simple steps
              </p>
            </div>
            
            <MultiStepBookingWidget />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChauffeurServices;
