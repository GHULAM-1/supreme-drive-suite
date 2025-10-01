import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BookingConfirmation from "./BookingConfirmation";

interface Vehicle {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  luggage_capacity: number;
  base_price_per_mile: number;
  overnight_surcharge: number;
}

interface PricingExtra {
  id: string;
  extra_name: string;
  price: number;
  description: string;
}

interface FixedRoute {
  id: string;
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  fixed_price: number;
  vehicle_id: string | null;
}

const EnhancedBookingWidget = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pricingExtras, setPricingExtras] = useState<PricingExtra[]>([]);
  const [fixedRoutes, setFixedRoutes] = useState<FixedRoute[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [matchedRoute, setMatchedRoute] = useState<FixedRoute | null>(null);
  const [estimatedMiles, setEstimatedMiles] = useState(50);
  const [waitTimeHours, setWaitTimeHours] = useState(0);
  const [isLongDrive, setIsLongDrive] = useState(false);
  const [hasOvernightStop, setHasOvernightStop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    pickupTime: "",
    passengers: "1",
    luggage: "1",
    additionalRequirements: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    checkForFixedRoute();
  }, [formData.pickupLocation, formData.dropoffLocation]);

  const loadData = async () => {
    const [vehiclesRes, extrasRes, routesRes] = await Promise.all([
      supabase.from("vehicles").select("*").eq("is_active", true).order("base_price_per_mile"),
      supabase.from("pricing_extras").select("*").eq("is_active", true),
      supabase.from("fixed_routes").select("*").eq("is_active", true)
    ]);

    if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    if (extrasRes.data) setPricingExtras(extrasRes.data);
    if (routesRes.data) setFixedRoutes(routesRes.data);
  };

  const checkForFixedRoute = () => {
    const route = fixedRoutes.find(
      r => r.pickup_location.toLowerCase().includes(formData.pickupLocation.toLowerCase()) &&
           r.dropoff_location.toLowerCase().includes(formData.dropoffLocation.toLowerCase())
    );
    setMatchedRoute(route || null);
  };

  const calculatePriceBreakdown = () => {
    if (!selectedVehicle) return { basePrice: 0, extras: 0, waitTime: 0, overnight: 0, total: 0 };

    let basePrice = selectedVehicle.base_price_per_mile * estimatedMiles;
    
    // Override with fixed route if matched
    if (matchedRoute) {
      basePrice = matchedRoute.fixed_price;
    }

    const extrasTotal = selectedExtras.reduce((sum, extraId) => {
      const extra = pricingExtras.find(e => e.id === extraId);
      return sum + (extra?.price || 0);
    }, 0);

    const waitTimeTotal = waitTimeHours * 25; // £25 per hour wait time
    const overnightTotal = hasOvernightStop ? selectedVehicle.overnight_surcharge : 0;

    return {
      basePrice,
      extras: extrasTotal,
      waitTime: waitTimeTotal,
      overnight: overnightTotal,
      total: basePrice + extrasTotal + waitTimeTotal + overnightTotal
    };
  };

  const breakdown = calculatePriceBreakdown();

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("bookings").insert({
      vehicle_id: selectedVehicle.id,
      pickup_location: formData.pickupLocation,
      dropoff_location: formData.dropoffLocation,
      pickup_date: formData.pickupDate,
      pickup_time: formData.pickupTime,
      passengers: parseInt(formData.passengers),
      luggage: parseInt(formData.luggage),
      additional_requirements: formData.additionalRequirements,
      is_long_drive: isLongDrive,
      has_overnight_stop: hasOvernightStop,
      estimated_miles: estimatedMiles,
      total_price: breakdown.total,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      status: "new",
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to submit booking");
      return;
    }

    setConfirmedBooking({
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      vehicleName: selectedVehicle.name,
      totalPrice: breakdown.total.toFixed(2),
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
    });
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setConfirmedBooking(null);
    setFormData({
      pickupLocation: "",
      dropoffLocation: "",
      pickupDate: "",
      pickupTime: "",
      passengers: "1",
      luggage: "1",
      additionalRequirements: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    });
    setSelectedVehicle(null);
    setSelectedExtras([]);
    setIsLongDrive(false);
    setHasOvernightStop(false);
    setWaitTimeHours(0);
  };

  if (showConfirmation && confirmedBooking) {
    return <BookingConfirmation bookingDetails={confirmedBooking} onClose={handleCloseConfirmation} />;
  }

  return (
    <Card className="p-6 md:p-8 shadow-metal bg-card/50 backdrop-blur">
      <h3 className="text-2xl font-display font-bold mb-6 text-gradient-metal">Book Your Journey</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {matchedRoute && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <p className="text-sm font-medium text-accent">✓ Fixed Route Available: {matchedRoute.route_name}</p>
            <p className="text-xs text-muted-foreground mt-1">Special rate applied: £{matchedRoute.fixed_price}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="Enter pickup address"
              list="pickup-suggestions"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dropoffLocation">Drop-off Location</Label>
            <Input
              id="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
              placeholder="Enter destination"
              list="dropoff-suggestions"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickupDate">Pickup Date</Label>
            <Input
              id="pickupDate"
              type="date"
              value={formData.pickupDate}
              onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pickupTime">Pickup Time</Label>
            <Input
              id="pickupTime"
              type="time"
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passengers">Passengers</Label>
            <Select value={formData.passengers} onValueChange={(value) => setFormData({ ...formData, passengers: value })}>
              <SelectTrigger id="passengers">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Passenger" : "Passengers"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="luggage">Luggage Items</Label>
            <Select value={formData.luggage} onValueChange={(value) => setFormData({ ...formData, luggage: value })}>
              <SelectTrigger id="luggage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Item" : "Items"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waitTime">Wait Time (hours)</Label>
            <Input
              id="waitTime"
              type="number"
              value={waitTimeHours}
              onChange={(e) => setWaitTimeHours(parseInt(e.target.value) || 0)}
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        {!matchedRoute && (
          <div className="space-y-2">
            <Label htmlFor="estimatedMiles">Estimated Miles</Label>
            <Input
              id="estimatedMiles"
              type="number"
              value={estimatedMiles}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setEstimatedMiles(isNaN(value) ? 50 : value);
              }}
              min="1"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="longDrive"
              checked={isLongDrive}
              onCheckedChange={(checked) => setIsLongDrive(checked as boolean)}
            />
            <Label htmlFor="longDrive" className="text-sm cursor-pointer">
              Long drive (over 100 miles)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overnightStop"
              checked={hasOvernightStop}
              onCheckedChange={(checked) => setHasOvernightStop(checked as boolean)}
            />
            <Label htmlFor="overnightStop" className="text-sm cursor-pointer">
              Overnight stop required
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle">Select Vehicle</Label>
          <Select onValueChange={(value) => {
            const vehicle = vehicles.find(v => v.id === value);
            setSelectedVehicle(vehicle || null);
          }}>
            <SelectTrigger id="vehicle">
              <SelectValue placeholder="Choose your vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - £{vehicle.base_price_per_mile}/mile
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pricingExtras.length > 0 && (
          <div className="space-y-3">
            <Label>Optional Extras</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {pricingExtras.map((extra) => (
                <div key={extra.id} className="flex items-start space-x-2 p-3 border rounded hover:bg-secondary/30">
                  <Checkbox
                    id={extra.id}
                    checked={selectedExtras.includes(extra.id)}
                    onCheckedChange={() => toggleExtra(extra.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={extra.id} className="cursor-pointer font-medium">
                      {extra.extra_name} - £{extra.price}
                    </Label>
                    <p className="text-xs text-muted-foreground">{extra.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedVehicle && (
          <Card className="p-4 bg-secondary/30">
            <div className="space-y-3">
              <h4 className="font-semibold">{selectedVehicle.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedVehicle.description}</p>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base fare ({matchedRoute ? "Fixed route" : `${estimatedMiles} miles`})</span>
                  <span>£{breakdown.basePrice.toFixed(2)}</span>
                </div>
                
                {breakdown.extras > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Extras</span>
                    <span>£{breakdown.extras.toFixed(2)}</span>
                  </div>
                )}
                
                {breakdown.waitTime > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Wait time ({waitTimeHours}h)</span>
                    <span>£{breakdown.waitTime.toFixed(2)}</span>
                  </div>
                )}
                
                {breakdown.overnight > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Overnight surcharge</span>
                    <span>£{breakdown.overnight.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold">Total Price:</span>
                  <span className="text-3xl font-display font-bold text-accent">
                    £{breakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          <Label htmlFor="additionalRequirements">Additional Requirements</Label>
          <Textarea
            id="additionalRequirements"
            value={formData.additionalRequirements}
            onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
            placeholder="Any special requests or requirements?"
            rows={3}
          />
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="font-semibold">Your Details</h4>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full gradient-accent shadow-glow"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </Button>
      </form>
    </Card>
  );
};

export default EnhancedBookingWidget;
