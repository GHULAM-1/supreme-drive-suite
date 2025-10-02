import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import UniversalHero from "@/components/UniversalHero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Award, Users, Globe, CheckCircle, Quote, BadgeCheck, Phone } from "lucide-react";
import protectionHero from "@/assets/service-protection.jpg";
import CloseProtectionEnquiryForm from "@/components/CloseProtectionEnquiryForm";

const CloseProtection = () => {
  const features = [
    {
      icon: Shield,
      title: "Elite Security Personnel",
      description: "All our close protection officers are ex-military or law enforcement with SIA licenses and extensive experience in high-threat environments.",
    },
    {
      icon: Award,
      title: "Discreet Operations",
      description: "We pride ourselves on providing security that is both highly effective and entirely discreet, allowing you to maintain your lifestyle without intrusion.",
    },
    {
      icon: Users,
      title: "Flexible Teams",
      description: "From single operator to full security details, we scale our service to match your exact requirements and threat assessment.",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Our network of trusted partners enables us to provide close protection services anywhere in the world at short notice.",
    },
  ];

  const approach = [
    "Comprehensive Threat Assessment",
    "Continuous Training & Accreditation",
    "Seamless Global Coordination",
  ];

  const accreditations = [
    { name: "SIA Licensed", description: "Security Industry Authority" },
    { name: "ISO Certified", description: "Quality Management Standards" },
    { name: "BSIA Member", description: "British Security Industry Association" },
    { name: "CPO Certified", description: "Close Protection Officer" },
  ];

  const testimonials = [
    {
      quote: "The team provided seamless security for our high-profile corporate event. Their discretion and professionalism were exemplary.",
      clientType: "CEO, Fortune 500 Company",
    },
    {
      quote: "During international travel, I felt completely secure yet unrestricted. True professionals who understand the balance between protection and privacy.",
      clientType: "Private Client",
    },
    {
      quote: "Their residential protection service is second to none. We have complete peace of mind knowing our family is in capable hands.",
      clientType: "Private Family",
    },
  ];

  const scrollToForm = () => {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <UniversalHero
        headline={<>Discreet. Professional.<br />Trusted.</>}
        subheading="Elite close protection services tailored for high-profile clients"
        backgroundImage={protectionHero}
        backgroundAlt="Professional close protection security service"
        overlayStrength="strong"
        primaryCTA={{
          text: "Request Confidential Consultation",
          onClick: scrollToForm
        }}
        secondaryCTA={{
          text: "Call 0800 123 4567",
          href: "tel:08001234567",
          icon: <Phone className="w-5 h-5" />
        }}
        trustLine={["Fully Licensed", "Global Coverage", "24/7 Availability"]}
        showScrollIndicator={true}
      />

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                Uncompromising Excellence
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our close protection services combine military precision with discrete professionalism
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="p-10 shadow-glow bg-card/50 backdrop-blur border-primary/20 hover-lift transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full gradient-metal flex items-center justify-center mb-6 shadow-glow">
                    <feature.icon className="w-8 h-8 text-background" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-24 bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 shadow-glow bg-gradient-to-br from-card/80 to-card/50 backdrop-blur border-primary/20">
              <h2 className="text-4xl font-display font-bold mb-8 text-gradient-metal">
                Our Approach
              </h2>
              <div className="space-y-6">
                {approach.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full gradient-metal flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-background" />
                    </div>
                    <p className="text-lg font-medium text-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-muted-foreground leading-relaxed">
                We conduct comprehensive threat assessments to understand your unique security requirements. 
                Our team develops tailored protection strategies that address all potential risks while 
                maintaining your privacy and freedom of movement. All operatives undergo continuous training 
                in defensive driving, threat recognition, counter-surveillance, and emergency medical response.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Credentials Section */}
      <section className="py-24 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* Accreditations & Certifications */}
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                Accredited & Certified
              </h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Our credentials reflect our commitment to the highest security standards
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {accreditations.map((cert, index) => (
                  <Card 
                    key={index}
                    className="p-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur border-primary/30 hover:border-primary/50 transition-all hover-lift"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BadgeCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {cert.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trusted by Clients */}
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4 text-center">
                Trusted by High-Profile Clients
              </h2>
              <p className="text-lg text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
                Discover why discerning clients choose our close protection services
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <Card 
                    key={index}
                    className="p-8 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all flex flex-col"
                  >
                    <Quote className="w-10 h-10 text-primary/30 mb-4" />
                    <p className="text-muted-foreground italic mb-6 leading-relaxed flex-1">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-sm font-semibold text-primary mt-auto">
                      {testimonial.clientType}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Confidentiality Assurance */}
            <div className="text-center">
              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur border-primary/30 max-w-4xl mx-auto">
                <div className="flex items-start gap-4 text-left">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground leading-relaxed">
                    Our close protection services operate under strict confidentiality protocols. 
                    All client information and operational details remain private at all times. 
                    We maintain the highest standards of discretion and data security throughout every engagement.
                  </p>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-24 bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                Confidential Consultation
              </h2>
              <p className="text-lg text-muted-foreground">
                Begin your journey to enhanced security with a private consultation
              </p>
            </div>

            <Card className="p-8 md:p-12 shadow-glow bg-card/50 backdrop-blur border-primary/20">
              <CloseProtectionEnquiryForm />
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CloseProtection;
