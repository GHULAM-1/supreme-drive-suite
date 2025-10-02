import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Award, Users, Globe, CheckCircle } from "lucide-react";
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

  const scrollToForm = () => {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${protectionHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-gradient-metal leading-tight">
              Discreet. Professional.<br />Trusted.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Elite close protection services tailored for high-profile clients worldwide.
            </p>
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="gradient-accent shadow-glow text-lg px-12 py-8 hover-lift"
            >
              Request a Confidential Consultation
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2" />
          </div>
        </div>
      </section>

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

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-24 bg-gradient-to-b from-background to-background/50">
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
