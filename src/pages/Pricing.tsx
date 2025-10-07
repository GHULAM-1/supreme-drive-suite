import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Car, 
  CarFront, 
  Crown, 
  User, 
  Fuel, 
  Wifi, 
  Phone, 
  Plane, 
  Droplets, 
  Clock, 
  Sparkles, 
  Shield,
  GlassWater
} from "lucide-react";

interface Vehicle {
  name: string;
  category: string;
  description: string;
  base_price_per_mile: number;
  overnight_surcharge: number;
  features: string[];
  image_url?: string;
}

const getVehicleIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes('ultra') || lower.includes('luxury')) return Crown;
  if (lower.includes('suv')) return CarFront;
  return Car;
};

const Pricing = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true)
      .order("base_price_per_mile");

    if (!error && data) {
      setVehicles(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-gradient-metal leading-tight">
              Transparent Pricing
            </h1>
            <div className="flex items-center justify-center mb-8">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience clarity and confidence in every booking — no hidden fees, just premium service at honest rates.
            </p>
          </div>

          {/* Vehicle Pricing Cards */}
          <div className="space-y-8 mb-24">
            {vehicles.map((vehicle, index) => {
              const VehicleIcon = getVehicleIcon(vehicle.category);
              return (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-glow"
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-secondary/20 opacity-80" />
                  
                  <div className="relative p-8 md:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                      {/* Vehicle Image */}
                      {vehicle.image_url ? (
                        <div className="w-full lg:w-64 flex-shrink-0">
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-glow border border-accent/20">
                            <img
                              src={vehicle.image_url}
                              alt={`${vehicle.name} - Luxury vehicle`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      ) : (
                        <div className="hidden lg:flex w-64 aspect-[4/3] items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                          <VehicleIcon className="w-16 h-16 text-accent/40" />
                        </div>
                      )}
                      
                      {/* Left Content */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start gap-4">
                          {!vehicle.image_url && (
                            <div className="lg:hidden p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                              <VehicleIcon className="w-6 h-6 text-accent" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-3xl md:text-4xl font-display font-bold text-gradient-silver">
                                {vehicle.name}
                              </h3>
                            </div>
                            <p className="text-sm uppercase tracking-widest text-accent/80 font-medium">
                              {vehicle.category}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {vehicle.description}
                        </p>
                        
                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-2">
                          {vehicle.features?.map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="px-4 py-2 rounded-full bg-secondary/50 border-accent/30 text-foreground hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Right Pricing Column */}
                      <div className="lg:text-right space-y-4 lg:min-w-[200px]">
                        <div className="space-y-2">
                          <div className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-br from-accent to-accent/70 bg-clip-text text-transparent">
                            £{vehicle.base_price_per_mile}
                          </div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wider">
                            per mile
                          </div>
                        </div>
                        
                        {vehicle.overnight_surcharge > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div className="space-y-2">
                              <div className="text-3xl font-display font-semibold text-gradient-metal">
                                +£{vehicle.overnight_surcharge}
                              </div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                overnight surcharge
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* What's Included Section */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-metal mb-4">
                What's Included
              </h2>
              <div className="flex items-center justify-center">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-accent to-transparent" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Standard Service */}
              <Card className="p-8 bg-card/50 backdrop-blur shadow-metal border-accent/20">
                <div className="mb-6">
                  <h4 className="text-2xl font-display font-semibold mb-2 text-gradient-silver">
                    Standard Service
                  </h4>
                  <div className="h-[1px] w-20 bg-gradient-to-r from-accent to-transparent" />
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <User className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Professional chauffeur</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Fuel className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Fuel and insurance</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Droplets className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Complimentary water and refreshments</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Wifi className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>WiFi and device charging</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Plane className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Flight tracking (airport transfers)</span>
                  </li>
                </ul>
              </Card>

              {/* Premium Add-ons */}
              <Card className="p-8 bg-card/50 backdrop-blur shadow-metal border-accent/20">
                <div className="mb-6">
                  <h4 className="text-2xl font-display font-semibold mb-2 text-gradient-silver">
                    Premium Add-ons
                  </h4>
                  <div className="h-[1px] w-20 bg-gradient-to-r from-accent to-transparent" />
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Shield className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Close protection officer: from £500/day</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Extended waiting time: £50/hour</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Phone className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Last-minute bookings: +25%</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <GlassWater className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Champagne service: £75</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Sparkles className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Multiple stops: POA</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="text-base px-8 py-6">
                Book Your Journey
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-accent/30 hover:border-accent/50 hover:bg-accent/10">
                Request a Quote for Add-ons
              </Button>
            </div>
          </div>

          {/* Trust Banner */}
          <Card className="p-8 md:p-12 bg-gradient-to-br from-card via-secondary/20 to-card shadow-metal border-accent/20">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="flex items-center gap-6">
                <Shield className="w-10 h-10 text-accent flex-shrink-0" />
                <Separator orientation="vertical" className="h-12 hidden md:block bg-accent/30" />
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Every journey includes full insurance, professional service, and absolute discretion.
              </p>
              <div className="flex items-center gap-6">
                <Separator orientation="vertical" className="h-12 hidden md:block bg-accent/30" />
                <Crown className="w-10 h-10 text-accent flex-shrink-0" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
