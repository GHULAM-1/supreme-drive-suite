import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ChevronRight, ChevronLeft, Check, 
  Baby, Coffee, MapPin, UserCheck, 
  Car, Crown, TrendingUp, Users as GroupIcon,
  Calculator, Shield, CheckCircle
} from "lucide-react";
import BookingConfirmation from "./BookingConfirmation";
import CloseProtectionModal from "./CloseProtectionModal";

interface Vehicle {
  id: string;
  name: string;
  category: string;
  base_price_per_mile: number;
  overnight_surcharge: number;
  image_url: string | null;
  capacity: number;
  features: string[];
}

interface PricingExtra {
  id: string;
  extra_name: string;
  price: number;
  description: string | null;
}

interface FixedRoute {
  id: string;
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  fixed_price: number;
  vehicle_id: string | null;
}

const MultiStepBookingWidget = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<PricingExtra[]>([]);
  const [fixedRoutes, setFixedRoutes] = useState<FixedRoute[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [matchedRoute, setMatchedRoute] = useState<FixedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [distanceOverride, setDistanceOverride] = useState(false);
  const [cpInterested, setCpInterested] = useState(false);
  const [showCPModal, setShowCPModal] = useState(false);

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    pickupTime: "",
    passengers: "",
    luggage: "",
    additionalRequirements: "",
    vehicleId: "",
    estimatedMiles: "",
    waitTime: "",
    isLongDrive: false,
    hasOvernightStop: false,
    customerName: "",
    customerEmail: "",
    customerPhone: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.pickupLocation && formData.dropoffLocation) {
      checkForFixedRoute();
    }
  }, [formData.pickupLocation, formData.dropoffLocation]);

  const loadData = async () => {
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true)
      .order("category");

    const { data: extrasData } = await supabase
      .from("pricing_extras")
      .select("*")
      .eq("is_active", true);

    const { data: routesData } = await supabase
      .from("fixed_routes")
      .select("*")
      .eq("is_active", true);

    if (vehiclesData) setVehicles(vehiclesData);
    if (extrasData) setExtras(extrasData);
    if (routesData) setFixedRoutes(routesData);
  };

  const checkForFixedRoute = () => {
    const route = fixedRoutes.find(
      (r) =>
        r.pickup_location.toLowerCase().includes(formData.pickupLocation.toLowerCase()) &&
        r.dropoff_location.toLowerCase().includes(formData.dropoffLocation.toLowerCase())
    );
    setMatchedRoute(route || null);
  };

  const calculatePriceBreakdown = () => {
    const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
    if (!selectedVehicle) return null;

    if (matchedRoute) {
      const extrasTotal = selectedExtras.reduce((sum, extraId) => {
        const extra = extras.find((e) => e.id === extraId);
        return sum + (extra?.price || 0);
      }, 0);

      return {
        basePrice: matchedRoute.fixed_price,
        extrasTotal,
        totalPrice: matchedRoute.fixed_price + extrasTotal,
        isFixedRoute: true
      };
    }

    const miles = parseFloat(formData.estimatedMiles) || 0;
    const waitHours = parseFloat(formData.waitTime) || 0;
    
    const mileagePrice = miles * selectedVehicle.base_price_per_mile;
    const waitTimePrice = waitHours * 50;
    const overnightFee = formData.hasOvernightStop ? selectedVehicle.overnight_surcharge : 0;
    const extrasTotal = selectedExtras.reduce((sum, extraId) => {
      const extra = extras.find((e) => e.id === extraId);
      return sum + (extra?.price || 0);
    }, 0);

    const totalPrice = mileagePrice + waitTimePrice + overnightFee + extrasTotal;

    return {
      mileagePrice,
      waitTimePrice,
      overnightFee,
      extrasTotal,
      totalPrice,
      isFixedRoute: false
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const priceBreakdown = calculatePriceBreakdown();
      const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
      
      const { data, error } = await supabase.from("bookings").insert({
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        passengers: parseInt(formData.passengers),
        luggage: parseInt(formData.luggage),
        additional_requirements: formData.additionalRequirements,
        vehicle_id: formData.vehicleId || null,
        estimated_miles: parseFloat(formData.estimatedMiles) || null,
        is_long_drive: formData.isLongDrive,
        has_overnight_stop: formData.hasOvernightStop,
        total_price: priceBreakdown?.totalPrice || 0,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
      }).select();

      if (error) throw error;

      const reference = `SDS-${data[0].id.substring(0, 8).toUpperCase()}`;
      setBookingReference(reference);
      
      // Store booking details for confirmation
      const details = {
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        vehicleName: selectedVehicle?.name || "Selected Vehicle",
        totalPrice: priceBreakdown?.totalPrice.toFixed(2) || "0.00",
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
      };
      setBookingDetails(details);
      
      setShowConfirmation(true);
      toast.success("Booking request submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit booking. Please try again.");
      console.error("Booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setCurrentStep(1);
    setFormData({
      pickupLocation: "",
      dropoffLocation: "",
      pickupDate: "",
      pickupTime: "",
      passengers: "",
      luggage: "",
      additionalRequirements: "",
      vehicleId: "",
      estimatedMiles: "",
      waitTime: "",
      isLongDrive: false,
      hasOvernightStop: false,
      customerName: "",
      customerEmail: "",
      customerPhone: ""
    });
    setSelectedExtras([]);
    setCalculatedDistance(null);
    setDistanceOverride(false);
    setCpInterested(false);
  };

  const estimateDistance = () => {
    // Placeholder distance calculator
    // In production, integrate with Google Distance Matrix API or similar
    const baseDistance = Math.floor(Math.random() * 50) + 10;
    setCalculatedDistance(baseDistance);
    setFormData({ ...formData, estimatedMiles: baseDistance.toString() });
    toast.success(`Estimated distance: ${baseDistance} miles`);
  };

  const getExtraIcon = (extraName: string) => {
    const name = extraName.toLowerCase();
    if (name.includes("child") || name.includes("seat")) return Baby;
    if (name.includes("meet") || name.includes("greet")) return UserCheck;
    if (name.includes("stop") || name.includes("pickup")) return MapPin;
    if (name.includes("refresh") || name.includes("beverage")) return Coffee;
    return Coffee;
  };

  const getVehicleBadge = (vehicleName: string, category: string) => {
    const name = vehicleName.toLowerCase();
    if (name.includes("rolls") || name.includes("phantom")) {
      return { text: "Ultra Luxury", icon: Crown, color: "text-[#C5A572] border-[#C5A572]" };
    }
    if (name.includes("s-class") || name.includes("s class")) {
      return { text: "Most Popular", icon: TrendingUp, color: "text-blue-400 border-blue-400" };
    }
    if (name.includes("v-class") || name.includes("v class") || category.toLowerCase().includes("mpv")) {
      return { text: "Best for Groups", icon: GroupIcon, color: "text-green-400 border-green-400" };
    }
    return null;
  };

  const priceBreakdown = calculatePriceBreakdown();

  const canProceedStep1 = formData.pickupLocation && formData.dropoffLocation && 
                          formData.pickupDate && formData.pickupTime && 
                          formData.passengers && formData.luggage;

  const canProceedStep2 = formData.vehicleId;

  const canSubmit = formData.customerName && formData.customerEmail && formData.customerPhone;

  if (showConfirmation && bookingDetails) {
    return <BookingConfirmation bookingDetails={bookingDetails} onClose={handleCloseConfirmation} />;
  }

  return (
    <Card className="p-4 md:p-8 bg-card/90 backdrop-blur-sm border-primary/30 shadow-metal">
      <div className="space-y-8">
        {/* Enhanced Progress Indicator */}
        <div className="w-full">
          <div className="flex items-center justify-between relative">
            {[
              { step: 1, label: "Journey" },
              { step: 2, label: "Vehicle" },
              { step: 3, label: "Details" }
            ].map(({ step, label }, index) => (
              <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all ${
                  currentStep >= step 
                    ? 'bg-accent border-accent text-accent-foreground shadow-lg' 
                    : 'border-muted text-muted-foreground bg-background'
                } ${currentStep === step ? 'animate-pulse' : ''}`}>
                  {currentStep > step ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <span className="text-lg md:text-xl font-semibold">{step}</span>}
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium ${
                  currentStep >= step ? 'text-accent' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
                {index < 2 && (
                  <div className={`absolute top-6 left-[calc(50%+24px)] md:left-[calc(50%+28px)] w-[calc(100%-48px)] md:w-[calc(100%-56px)] h-0.5 ${
                    currentStep > step ? 'bg-accent' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Journey Details */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl md:text-3xl font-display font-semibold text-gradient-metal">Journey Details</h3>
            
            {/* Journey Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Journey
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <Input
                    id="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    placeholder="Enter pickup address"
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoffLocation">Drop-off Location</Label>
                  <Input
                    id="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    placeholder="Enter destination"
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Pickup Date</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                </div>
              </div>

              {/* Distance Calculator */}
              {!matchedRoute && formData.pickupLocation && formData.dropoffLocation && (
                <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <Calculator className="w-5 h-5 text-accent" />
                  {calculatedDistance && !distanceOverride ? (
                    <>
                      <span className="text-sm">Estimated: <span className="font-semibold text-accent">~{calculatedDistance} miles</span></span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDistanceOverride(true)}
                        className="ml-auto"
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={estimateDistance}
                      className="ml-auto"
                    >
                      Calculate Distance
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Passengers & Luggage Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
                <GroupIcon className="w-5 h-5 text-accent" />
                Passengers & Luggage
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passengers">Passengers</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage">Luggage Items</Label>
                  <Input
                    id="luggage"
                    type="number"
                    min="0"
                    value={formData.luggage}
                    onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Options Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground/90">Additional Options</h4>
              
              <div className="space-y-2">
                <Label htmlFor="additionalRequirements">Special Requests</Label>
                <Textarea
                  id="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  placeholder="Any special requests or requirements..."
                  rows={3}
                  className="p-4 focus-visible:ring-[#C5A572]"
                />
              </div>

              {!matchedRoute && (distanceOverride || !calculatedDistance) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedMiles">Estimated Miles</Label>
                    <Input
                      id="estimatedMiles"
                      type="number"
                      step="0.1"
                      value={formData.estimatedMiles}
                      onChange={(e) => setFormData({ ...formData, estimatedMiles: e.target.value })}
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waitTime">Wait Time (Hours)</Label>
                    <Input
                      id="waitTime"
                      type="number"
                      step="0.5"
                      value={formData.waitTime}
                      onChange={(e) => setFormData({ ...formData, waitTime: e.target.value })}
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isLongDrive"
                    checked={formData.isLongDrive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isLongDrive: checked as boolean })}
                  />
                  <Label htmlFor="isLongDrive" className="cursor-pointer">Long drive (4+ hours)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasOvernightStop"
                    checked={formData.hasOvernightStop}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasOvernightStop: checked as boolean })}
                  />
                  <Label htmlFor="hasOvernightStop" className="cursor-pointer">Overnight stop required</Label>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className="w-full gradient-accent hover-lift"
              size="lg"
            >
              Continue to Vehicle Selection <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl md:text-3xl font-display font-semibold text-gradient-metal">Select Your Vehicle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {vehicles
                .sort((a, b) => {
                  // Rolls-Royce Phantom first
                  if (a.name.toLowerCase().includes("rolls") || a.name.toLowerCase().includes("phantom")) return -1;
                  if (b.name.toLowerCase().includes("rolls") || b.name.toLowerCase().includes("phantom")) return 1;
                  return 0;
                })
                .map((vehicle) => {
                  const badge = getVehicleBadge(vehicle.name, vehicle.category);
                  const isRollsRoyce = vehicle.name.toLowerCase().includes("rolls") || vehicle.name.toLowerCase().includes("phantom");
                  
                  return (
                    <Card
                      key={vehicle.id}
                      className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative ${
                        formData.vehicleId === vehicle.id 
                          ? 'border-accent bg-accent/10 shadow-lg' 
                          : 'border-border hover:border-accent/50'
                      } ${isRollsRoyce ? 'border-[#C5A572] shadow-[0_0_20px_rgba(197,165,114,0.2)]' : ''}`}
                      onClick={() => setFormData({ ...formData, vehicleId: vehicle.id })}
                    >
                      {/* Badge */}
                      {badge && (
                        <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${badge.color} bg-background/80 backdrop-blur-sm`}>
                          <badge.icon className="w-3 h-3" />
                          {badge.text}
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Vehicle Icon/Image */}
                        <div className={`flex items-center justify-center h-32 rounded-lg ${
                          isRollsRoyce 
                            ? 'bg-gradient-to-br from-[#C5A572]/20 to-[#8B7355]/20' 
                            : 'bg-accent/5'
                        }`}>
                          {vehicle.image_url ? (
                            <img 
                              src={vehicle.image_url} 
                              alt={vehicle.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Car className={`w-20 h-20 ${isRollsRoyce ? 'text-[#C5A572]' : 'text-accent'}`} />
                          )}
                        </div>

                        {/* Vehicle Details */}
                        <div>
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            {vehicle.name}
                            {isRollsRoyce && <Crown className="w-5 h-5 text-[#C5A572]" />}
                          </h4>
                          <p className="text-sm text-muted-foreground">{vehicle.category}</p>
                        </div>

                        {/* Capacity & Pricing */}
                        <div className="flex items-center justify-between text-sm border-t border-border/50 pt-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <GroupIcon className="w-4 h-4 text-muted-foreground" />
                              {vehicle.capacity}
                            </span>
                          </div>
                          <p className={`font-semibold ${isRollsRoyce ? 'text-[#C5A572]' : 'text-accent'}`}>
                            £{vehicle.base_price_per_mile.toFixed(2)}/mile
                          </p>
                        </div>

                        {/* Key Features */}
                        {vehicle.features && vehicle.features.length > 0 && (
                          <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                            {vehicle.features.slice(0, 3).join(' • ')}
                          </div>
                        )}

                        {/* Selected Indicator */}
                        {formData.vehicleId === vehicle.id && (
                          <div className="flex items-center gap-2 text-accent font-medium text-sm pt-2">
                            <CheckCircle className="w-4 h-4" />
                            Selected
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="w-full sm:flex-1 order-2 sm:order-1"
                size="lg"
              >
                <ChevronLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedStep2}
                className="w-full sm:flex-1 gradient-accent hover-lift order-1 sm:order-2"
                size="lg"
              >
                Continue to Extras <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Extras & Client Details */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl md:text-3xl font-display font-semibold text-gradient-metal">Extras & Details</h3>
                
                {/* Optional Extras with Icons */}
                {extras.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Optional Extras</Label>
                    {extras.map((extra) => {
                      const IconComponent = getExtraIcon(extra.extra_name);
                      return (
                        <div 
                          key={extra.id} 
                          className={`flex items-start gap-4 p-4 border rounded-lg transition-all cursor-pointer hover:border-accent/50 ${
                            selectedExtras.includes(extra.id) ? 'border-accent bg-accent/5' : 'border-border'
                          }`}
                          onClick={() => {
                            if (selectedExtras.includes(extra.id)) {
                              setSelectedExtras(selectedExtras.filter(id => id !== extra.id));
                            } else {
                              setSelectedExtras([...selectedExtras, extra.id]);
                            }
                          }}
                        >
                          <div className={`p-2 rounded-lg ${selectedExtras.includes(extra.id) ? 'bg-accent/20' : 'bg-muted/50'}`}>
                            <IconComponent className={`w-5 h-5 ${selectedExtras.includes(extra.id) ? 'text-accent' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{extra.extra_name}</p>
                                {extra.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{extra.description}</p>
                                )}
                              </div>
                              <span className="text-accent font-semibold whitespace-nowrap">£{extra.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <Checkbox
                            id={extra.id}
                            checked={selectedExtras.includes(extra.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedExtras([...selectedExtras, extra.id]);
                              } else {
                                setSelectedExtras(selectedExtras.filter(id => id !== extra.id));
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Close Protection Toggle */}
                <div className="p-6 border border-[#C5A572]/30 rounded-lg bg-gradient-to-br from-[#C5A572]/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[#C5A572]/20">
                      <Shield className="w-6 h-6 text-[#C5A572]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">Interested in Close Protection?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add discreet security for this journey with our trained professionals
                      </p>
                      <div className="flex items-center gap-3">
                        <Switch
                          id="cp-toggle"
                          checked={cpInterested}
                          onCheckedChange={(checked) => {
                            setCpInterested(checked);
                            if (checked) {
                              setShowCPModal(true);
                            }
                          }}
                        />
                        <Label htmlFor="cp-toggle" className="cursor-pointer text-sm">
                          I'm interested
                        </Label>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setShowCPModal(true)}
                          className="ml-auto text-[#C5A572] hover:text-[#C5A572]/80"
                        >
                          Learn More →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4 pt-6 border-t border-border">
                  <h4 className="text-lg font-semibold">Your Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Enter your name"
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email Address *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="your@email.com"
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+44 7XXX XXXXXX"
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Price Summary (Desktop) */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-gradient-dark border-accent/30 lg:sticky lg:top-24 lg:self-start">
                  <h4 className="text-lg font-semibold text-gradient-metal mb-4">Price Summary</h4>
                  
                  {priceBreakdown ? (
                    <div className="space-y-3">
                      {priceBreakdown.isFixedRoute ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fixed Route</span>
                          <span className="font-medium">£{priceBreakdown.basePrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mileage</span>
                            <span className="font-medium">£{priceBreakdown.mileagePrice.toFixed(2)}</span>
                          </div>
                          {priceBreakdown.waitTimePrice > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Wait Time</span>
                              <span className="font-medium">£{priceBreakdown.waitTimePrice.toFixed(2)}</span>
                            </div>
                          )}
                          {priceBreakdown.overnightFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Overnight</span>
                              <span className="font-medium">£{priceBreakdown.overnightFee.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {priceBreakdown.extrasTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Extras</span>
                          <span className="font-medium">£{priceBreakdown.extrasTotal.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-2xl font-bold text-accent">
                            £{priceBreakdown.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-4">
                        * Estimated price. Final price may vary based on actual distance and time.
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Select a vehicle to see pricing</p>
                  )}
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="w-full sm:flex-1 order-2 sm:order-1"
                  size="lg"
                >
                  <ChevronLeft className="mr-2 w-5 h-5" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  className="w-full sm:flex-1 gradient-accent hover-lift order-1 sm:order-2"
                  size="lg"
                >
                  {loading ? "Submitting..." : "Confirm Booking"}
                </Button>
              </div>
              
              {/* Reassurance Text */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p>Your request will be reviewed by our team. You'll receive confirmation shortly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Close Protection Modal */}
        <CloseProtectionModal
          open={showCPModal}
          onOpenChange={setShowCPModal}
          customerName={formData.customerName}
          customerEmail={formData.customerEmail}
          customerPhone={formData.customerPhone}
          bookingDetails={`${formData.pickupLocation} → ${formData.dropoffLocation} on ${formData.pickupDate} at ${formData.pickupTime}`}
        />
      </div>
    </Card>
  );
};

export default MultiStepBookingWidget;
