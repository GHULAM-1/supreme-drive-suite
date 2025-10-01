import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import BookingConfirmation from "./BookingConfirmation";

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
    <Card className="p-8 bg-card/90 backdrop-blur-sm border-primary/30 shadow-metal">
      <div className="space-y-8">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center max-w-md w-full">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step 
                    ? 'bg-accent border-accent text-accent-foreground' 
                    : 'border-muted text-muted-foreground'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-accent' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Journey Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-display font-semibold text-gradient-metal">Journey Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  placeholder="Enter pickup address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoffLocation">Drop-off Location</Label>
                <Input
                  id="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                  placeholder="Enter destination"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalRequirements">Additional Requirements</Label>
              <Textarea
                id="additionalRequirements"
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                placeholder="Any special requests or requirements..."
                rows={3}
              />
            </div>

            {!matchedRoute && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estimatedMiles">Estimated Miles (Optional)</Label>
                  <Input
                    id="estimatedMiles"
                    type="number"
                    step="0.1"
                    value={formData.estimatedMiles}
                    onChange={(e) => setFormData({ ...formData, estimatedMiles: e.target.value })}
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
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-6">
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
            <h3 className="text-2xl font-display font-semibold text-gradient-metal">Select Your Vehicle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className={`p-6 cursor-pointer transition-all hover:border-accent/50 ${
                    formData.vehicleId === vehicle.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border'
                  }`}
                  onClick={() => setFormData({ ...formData, vehicleId: vehicle.id })}
                >
                  <div className="space-y-4">
                    {vehicle.image_url && (
                      <img 
                        src={vehicle.image_url} 
                        alt={vehicle.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold">{vehicle.name}</h4>
                      <p className="text-sm text-muted-foreground">{vehicle.category}</p>
                    </div>
                    <div className="text-sm">
                      <p>Capacity: {vehicle.capacity} passengers</p>
                      <p className="text-accent font-semibold mt-2">
                        £{vehicle.base_price_per_mile.toFixed(2)} per mile
                      </p>
                    </div>
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {vehicle.features.slice(0, 3).join(' • ')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ChevronLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 gradient-accent hover-lift"
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
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-display font-semibold text-gradient-metal">Extras & Details</h3>
                
                {extras.length > 0 && (
                  <div className="space-y-3">
                    <Label>Optional Extras</Label>
                    {extras.map((extra) => (
                      <div key={extra.id} className="flex items-center space-x-3 p-4 border border-border rounded-lg">
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
                        />
                        <Label htmlFor={extra.id} className="flex-1 cursor-pointer">
                          <span className="font-medium">{extra.extra_name}</span>
                          {extra.description && (
                            <span className="block text-sm text-muted-foreground">{extra.description}</span>
                          )}
                        </Label>
                        <span className="text-accent font-semibold">£{extra.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-6 border-t border-border">
                  <h4 className="text-lg font-semibold">Your Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email Address</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="Your contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Price Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-gradient-dark border-accent/30 sticky top-4">
                  <h4 className="text-lg font-semibold text-gradient-metal mb-4">Price Summary</h4>
                  
                  {priceBreakdown ? (
                    <div className="space-y-3">
                      {priceBreakdown.isFixedRoute ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fixed Route Price</span>
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
                        * This is an estimated price. Final price may vary based on actual distance and time.
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Select a vehicle to see pricing</p>
                  )}
                </Card>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ChevronLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 gradient-accent hover-lift"
                size="lg"
              >
                {loading ? "Submitting..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MultiStepBookingWidget;
