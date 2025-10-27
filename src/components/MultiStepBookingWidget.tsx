import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChevronRight, ChevronLeft, Check,
  Baby, Coffee, MapPin, UserCheck,
  Car, Crown, TrendingUp, Users as GroupIcon,
  Calculator, Shield, CheckCircle, CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BookingConfirmation from "./BookingConfirmation";
import CloseProtectionModal from "./CloseProtectionModal";
import LocationAutocomplete from "./LocationAutocomplete";
import { stripePromise } from "@/config/stripe";

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


const MultiStepBookingWidget = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<PricingExtra[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [distanceOverride, setDistanceOverride] = useState(false);
  const [cpInterested, setCpInterested] = useState(false);
  const [showCPModal, setShowCPModal] = useState(false);
  const [cpDetails, setCpDetails] = useState<any>(null);
  const cpSubmittedRef = useRef(false); // Track if CP form was successfully submitted
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

  const [locationCoords, setLocationCoords] = useState({
    pickupLat: null as number | null,
    pickupLon: null as number | null,
    dropoffLat: null as number | null,
    dropoffLon: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Auto-calculate distance when both locations are selected or changed
  useEffect(() => {
    const { pickupLat, pickupLon, dropoffLat, dropoffLon } = locationCoords;

    if (pickupLat && pickupLon && dropoffLat && dropoffLon) {
      estimateDistance();
    }
  }, [locationCoords]);

  // Handle pre-filled service from Chauffeur Services page
  useEffect(() => {
    const prefilledRequirements = sessionStorage.getItem('prefilledRequirements');
    
    if (prefilledRequirements) {
      setFormData(prev => ({
        ...prev,
        additionalRequirements: prefilledRequirements
      }));
      
      // Clear sessionStorage after using
      sessionStorage.removeItem('prefilledService');
      sessionStorage.removeItem('prefilledRequirements');
    }
  }, []);


  const loadData = async () => {
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true)
      .order("category");

    const { data: extrasData } = await supabase
      .from("pricing_extras")
      .select("*");

    const { data: blockedDatesData } = await supabase
      .from("blocked_dates")
      .select("date");

    if (vehiclesData) setVehicles(vehiclesData);
    if (extrasData) setExtras(extrasData);
    if (blockedDatesData) {
      const formattedDates = blockedDatesData.map(d => {
        // Ensure date is in YYYY-MM-DD format
        const date = new Date(d.date);
        return format(date, "yyyy-MM-dd");
      });
      console.log("Blocked dates loaded:", formattedDates);
      setBlockedDates(formattedDates);
    }
  };

  const calculatePriceBreakdown = () => {
    const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
    if (!selectedVehicle) return null;

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
      totalPrice
    };
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

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
        payment_status: 'pending',
        service_type: cpInterested ? 'close_protection' : 'chauffeur',
        protection_details: cpDetails ? JSON.stringify(cpDetails) : null,
      }).select().single();

      if (error) throw error;

      // Generate reference using timestamp
      const reference = `SDS-${Date.now().toString(36).toUpperCase()}`;
      setBookingReference(reference);

      // Store booking details in localStorage for email and SMS after payment
      const bookingDetails = {
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        vehicleName: selectedVehicle?.name || "Selected Vehicle",
        passengers: formData.passengers,
        totalPrice: priceBreakdown?.totalPrice.toFixed(2) || "0.00",
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        additionalRequirements: formData.additionalRequirements,
        serviceType: cpInterested ? 'close_protection' : 'chauffeur',
        protectionDetails: cpDetails
      };
      localStorage.setItem('pendingBooking', JSON.stringify(bookingDetails));

      // Create Stripe Checkout Session
      const { data: sessionData, error: functionError } = await supabase.functions.invoke('-create-checkout-session', {
        body: {
          bookingId: data.id,
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          totalAmount: priceBreakdown?.totalPrice || 0,
        },
      });

      if (functionError) {
        console.error("Edge Function error:", functionError);
        throw new Error(functionError.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (sessionData?.url) {
        window.location.href = sessionData.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      toast.error("Failed to process payment. Please try again.");
      console.error("Payment error:", error);
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

  // Calculate distance using Haversine formula (great-circle distance)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const estimateDistance = async () => {
    const { pickupLat, pickupLon, dropoffLat, dropoffLon } = locationCoords;

    if (!pickupLat || !pickupLon || !dropoffLat || !dropoffLon) {
      toast.error("Please select both pickup and dropoff locations from the suggestions");
      return;
    }

    setLoading(true);
    try {
      // Use OSRM API for actual driving distance
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${dropoffLon},${dropoffLat}?overview=false`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          // Distance is in meters, convert to miles
          const distanceInMiles = Math.round((data.routes[0].distance / 1609.34) * 10) / 10;
          const durationInMinutes = Math.round(data.routes[0].duration / 60);

          setCalculatedDistance(distanceInMiles);
          setFormData({ ...formData, estimatedMiles: distanceInMiles.toString() });
          toast.success(`Driving distance: ${distanceInMiles} miles (approx. ${durationInMinutes} min)`);
        } else {
          throw new Error("No route found");
        }
      } else {
        throw new Error("Failed to calculate route");
      }
    } catch (error) {
      console.error("Error calculating driving distance:", error);

      // Fallback to straight-line distance
      const straightLineDistance = calculateDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);
      setCalculatedDistance(straightLineDistance);
      setFormData({ ...formData, estimatedMiles: straightLineDistance.toString() });
      toast.warning(`Estimated distance: ${straightLineDistance} miles (straight-line, route unavailable)`);
    } finally {
      setLoading(false);
    }
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

  // Validate individual field in real-time
  const validateSingleField = (fieldName: string, value: any) => {
    let error = "";

    switch (fieldName) {
      case "customerName":
        const nameValue = String(value).trim();
        if (!nameValue) {
          error = "Full name is required";
        } else if (nameValue.length < 2) {
          error = "Full name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s\-']+$/.test(nameValue)) {
          error = "Name must contain only letters, spaces, hyphens, and apostrophes";
        } else if (!/[a-zA-Z]{2,}/.test(nameValue)) {
          error = "Name must contain at least 2 alphabetic characters";
        } else if (nameValue.replace(/[\s\-']/g, '').length < 2) {
          error = "Name must have actual alphabetic content";
        }
        break;
      case "customerEmail":
        if (!String(value).trim()) {
          error = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          error = "Please enter a valid email address";
        }
        break;
      case "customerPhone":
        const phoneValue = String(value).trim();
        if (!phoneValue) {
          error = "Phone number is required";
        } else {
          const cleaned = phoneValue.replace(/[\s\-()]/g, '');
          const digitCount = (cleaned.match(/\d/g) || []).length;
          // Valid international phone: 7-15 digits, optional + at start
          if (digitCount < 7 || digitCount > 15) {
            error = "Please enter a valid phone number (7-15 digits)";
          } else if (cleaned.startsWith('+') && !/^\+\d+$/.test(cleaned)) {
            error = "Invalid phone number format";
          } else if (!cleaned.startsWith('+') && !/^\d+$/.test(cleaned.replace(/[\s\-()]/g, ''))) {
            error = "Phone number should contain only digits";
          }
        }
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate pickup location
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    } else {
      const pickupText = formData.pickupLocation.trim();
      // Check for meaningful location data (at least 5 characters and contains letters)
      if (pickupText.length < 5) {
        newErrors.pickupLocation = "Please enter a valid pickup address (minimum 5 characters)";
      } else if (!/[a-zA-Z]{3,}/.test(pickupText)) {
        newErrors.pickupLocation = "Please enter a meaningful pickup address with letters";
      } else if (/^[@#$%^&*()_+=\-\[\]{};:'",.<>?\/\\|`~!]{3,}/.test(pickupText)) {
        newErrors.pickupLocation = "Please enter a valid pickup address, not symbols";
      } else if (/^[a-zA-Z]+$/.test(pickupText) && pickupText.length < 15) {
        // If it's only letters and short, it's likely gibberish like "mmmmmmm"
        newErrors.pickupLocation = "Please enter a complete address (e.g., street name, city, postcode)";
      } else if (!/[\d]/.test(pickupText) && !/[,]/.test(pickupText) && pickupText.split(' ').length < 2) {
        // Valid addresses usually have numbers or commas or multiple words
        newErrors.pickupLocation = "Please enter a complete address with street name or postcode";
      }
    }

    // Validate drop-off location
    if (!formData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = "Drop-off location is required";
    } else {
      const dropoffText = formData.dropoffLocation.trim();
      // Check for meaningful location data (at least 5 characters and contains letters)
      if (dropoffText.length < 5) {
        newErrors.dropoffLocation = "Please enter a valid drop-off address (minimum 5 characters)";
      } else if (!/[a-zA-Z]{3,}/.test(dropoffText)) {
        newErrors.dropoffLocation = "Please enter a meaningful drop-off address with letters";
      } else if (/^[@#$%^&*()_+=\-\[\]{};:'",.<>?\/\\|`~!]{3,}/.test(dropoffText)) {
        newErrors.dropoffLocation = "Please enter a valid drop-off address, not symbols";
      } else if (/^[a-zA-Z]+$/.test(dropoffText) && dropoffText.length < 15) {
        // If it's only letters and short, it's likely gibberish like "mmmmmmm"
        newErrors.dropoffLocation = "Please enter a complete address (e.g., street name, city, postcode)";
      } else if (!/[\d]/.test(dropoffText) && !/[,]/.test(dropoffText) && dropoffText.split(' ').length < 2) {
        // Valid addresses usually have numbers or commas or multiple words
        newErrors.dropoffLocation = "Please enter a complete address with street name or postcode";
      }
    }
    if (!formData.pickupDate) {
      newErrors.pickupDate = "Pickup date is required";
    }
    if (!formData.pickupTime) {
      newErrors.pickupTime = "Pickup time is required";
    }
    if (!formData.passengers) {
      newErrors.passengers = "Number of passengers is required";
    } else if (parseInt(formData.passengers) < 1) {
      newErrors.passengers = "At least 1 passenger is required";
    }
    if (!formData.luggage) {
      newErrors.luggage = "Number of luggage items is required";
    } else if (parseInt(formData.luggage) < 0) {
      newErrors.luggage = "Luggage items cannot be negative";
    }

    // Validate optional fields if filled
    if (formData.estimatedMiles && formData.estimatedMiles.trim() !== "") {
      const miles = parseFloat(formData.estimatedMiles);
      if (isNaN(miles) || miles <= 0) {
        newErrors.estimatedMiles = "Please enter a number greater than 0";
      } else if (miles > 1000) {
        newErrors.estimatedMiles = "Miles cannot exceed 1000";
      }
    }

    if (formData.waitTime && formData.waitTime.trim() !== "") {
      const hours = parseFloat(formData.waitTime);
      if (isNaN(hours) || hours <= 0) {
        newErrors.waitTime = "Please enter a number greater than 0";
      } else if (hours > 24) {
        newErrors.waitTime = "Wait time cannot exceed 24 hours";
      }
    }

    // Validate additional requirements for meaningful content
    if (formData.additionalRequirements && formData.additionalRequirements.trim() !== "") {
      const trimmedText = formData.additionalRequirements.trim();
      if (trimmedText.length < 10) {
        newErrors.additionalRequirements = "Please provide at least 10 characters of meaningful information";
      } else if (!/[a-zA-Z]{3,}/.test(trimmedText)) {
        newErrors.additionalRequirements = "Please provide meaningful text (not just numbers or symbols)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = "Please select a vehicle";
      toast.error("Please select a vehicle to continue");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate customer name
    const nameValue = formData.customerName.trim();
    if (!nameValue) {
      newErrors.customerName = "Full name is required";
    } else if (nameValue.length < 2) {
      newErrors.customerName = "Full name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s\-']+$/.test(nameValue)) {
      newErrors.customerName = "Name must contain only letters, spaces, hyphens, and apostrophes";
    } else if (!/[a-zA-Z]{2,}/.test(nameValue)) {
      newErrors.customerName = "Name must contain at least 2 alphabetic characters";
    } else if (nameValue.replace(/[\s\-']/g, '').length < 2) {
      newErrors.customerName = "Name must have actual alphabetic content";
    }

    // Validate email
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    // Validate phone number (international format)
    const phoneValue = formData.customerPhone.trim();
    if (!phoneValue) {
      newErrors.customerPhone = "Phone number is required";
    } else {
      // Remove all spaces, hyphens, parentheses for validation
      const cleaned = phoneValue.replace(/[\s\-()]/g, '');
      // Count actual digits
      const digitCount = (cleaned.match(/\d/g) || []).length;
      // Valid international phone: 7-15 digits, optional + at start
      if (digitCount < 7 || digitCount > 15) {
        newErrors.customerPhone = "Please enter a valid phone number (7-15 digits)";
      } else if (cleaned.startsWith('+') && !/^\+\d+$/.test(cleaned)) {
        newErrors.customerPhone = "Invalid phone number format";
      } else if (!cleaned.startsWith('+') && !/^\d+$/.test(cleaned.replace(/[\s\-()]/g, ''))) {
        newErrors.customerPhone = "Phone number should contain only digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Continue = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

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
                  <Label htmlFor="pickupLocation">Pickup Location *</Label>
                  <LocationAutocomplete
                    id="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={(value, lat, lon) => {
                      setFormData({ ...formData, pickupLocation: value });
                      setLocationCoords({ ...locationCoords, pickupLat: lat || null, pickupLon: lon || null });
                      if (errors.pickupLocation) {
                        setErrors({ ...errors, pickupLocation: "" });
                      }
                    }}
                    placeholder="Enter pickup address"
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                  {errors.pickupLocation && (
                    <p className="text-sm text-destructive">{errors.pickupLocation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoffLocation">Drop-off Location *</Label>
                  <LocationAutocomplete
                    id="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={(value, lat, lon) => {
                      setFormData({ ...formData, dropoffLocation: value });
                      setLocationCoords({ ...locationCoords, dropoffLat: lat || null, dropoffLon: lon || null });
                      if (errors.dropoffLocation) {
                        setErrors({ ...errors, dropoffLocation: "" });
                      }
                    }}
                    placeholder="Enter destination"
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                  {errors.dropoffLocation && (
                    <p className="text-sm text-destructive">{errors.dropoffLocation}</p>
                  )}
                </div>
              </div>

              {/* Distance Calculator */}
              {formData.pickupLocation && formData.dropoffLocation && (
                <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <Calculator className="w-5 h-5 text-accent flex-shrink-0" />
                  {calculatedDistance && !distanceOverride ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                      <span className="text-sm font-medium">Driving Distance:</span>
                      <span className="text-lg font-bold text-accent">{calculatedDistance} miles</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Distance will be calculated automatically</span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Pickup Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal p-[10px] h-auto",
                          !formData.pickupDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.pickupDate ? (
                          format(new Date(formData.pickupDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.pickupDate ? new Date(formData.pickupDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const dateStr = format(date, "yyyy-MM-dd");
                            if (blockedDates.includes(dateStr)) {
                              toast.error("This date is not available for booking. Please select another date.");
                              return;
                            }
                            setFormData({ ...formData, pickupDate: dateStr });
                            if (errors.pickupDate) {
                              setErrors({ ...errors, pickupDate: "" });
                            }
                          }
                        }}
                        disabled={(date) => {
                          const dateStr = format(date, "yyyy-MM-dd");
                          const today = new Date(new Date().setHours(0, 0, 0, 0));
                          const oneMonthFromNow = new Date(today);
                          oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
                          const isBlocked = blockedDates.includes(dateStr);
                          if (isBlocked) {
                            console.log("Date blocked:", dateStr, "Blocked dates:", blockedDates);
                          }
                          return date < today || date > oneMonthFromNow || isBlocked;
                        }}
                        initialFocus
                        classNames={{
                          day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          day_disabled: "text-muted-foreground opacity-50 line-through",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.pickupDate && (
                    <p className="text-sm text-destructive">{errors.pickupDate}</p>
                  )}
                  {!errors.pickupDate && blockedDates.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Dates with a strikethrough are not available for booking
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time *</Label>
                  <TimePicker
                    id="pickupTime"
                    value={formData.pickupTime}
                    onChange={(value) => {
                      setFormData({ ...formData, pickupTime: value });
                      if (errors.pickupTime) {
                        setErrors({ ...errors, pickupTime: "" });
                      }
                    }}
                    className="focus-visible:ring-[#C5A572]"
                  />
                  {errors.pickupTime && (
                    <p className="text-sm text-destructive">{errors.pickupTime}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Passengers & Luggage Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
                <GroupIcon className="w-5 h-5 text-accent" />
                Passengers & Luggage
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passengers">Passengers *</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        setFormData({ ...formData, passengers: '' });
                      } else {
                        const value = Math.max(1, parseInt(inputValue) || 1);
                        setFormData({ ...formData, passengers: value.toString() });
                      }
                      if (errors.passengers) {
                        setErrors({ ...errors, passengers: "" });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') e.preventDefault();
                    }}
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                  {errors.passengers && (
                    <p className="text-sm text-destructive">{errors.passengers}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage">Luggage Items *</Label>
                  <Input
                    id="luggage"
                    type="number"
                    min="0"
                    value={formData.luggage}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        setFormData({ ...formData, luggage: '' });
                      } else {
                        const value = Math.max(0, parseInt(inputValue) || 0);
                        setFormData({ ...formData, luggage: value.toString() });
                      }
                      if (errors.luggage) {
                        setErrors({ ...errors, luggage: "" });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') e.preventDefault();
                    }}
                    className="p-4 focus-visible:ring-[#C5A572]"
                  />
                  {errors.luggage && (
                    <p className="text-sm text-destructive">{errors.luggage}</p>
                  )}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow letters, numbers, spaces, and common punctuation
                    const sanitized = value.replace(/[^a-zA-Z0-9\s.,;:!?()\-'"]/g, '');
                    setFormData({ ...formData, additionalRequirements: sanitized });
                    if (errors.additionalRequirements) {
                      setErrors({ ...errors, additionalRequirements: "" });
                    }
                  }}
                  placeholder="Any special requests or requirements..."
                  rows={3}
                  className="p-4 focus-visible:ring-[#C5A572]"
                  maxLength={500}
                />
                {errors.additionalRequirements && (
                  <p className="text-sm text-destructive">{errors.additionalRequirements}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.additionalRequirements.length}/500 characters
                </p>
              </div>

              {(distanceOverride || !calculatedDistance) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedMiles">Estimated Miles</Label>
                    <Input
                      id="estimatedMiles"
                      type="number"
                      step="0.1"
                      min="1"
                      max="1000"
                      value={formData.estimatedMiles}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setFormData({ ...formData, estimatedMiles: '' });
                        } else {
                          const value = parseFloat(inputValue);
                          if (!isNaN(value) && value >= 0 && value <= 1000) {
                            setFormData({ ...formData, estimatedMiles: inputValue });
                          }
                        }
                        if (errors.estimatedMiles) {
                          setErrors({ ...errors, estimatedMiles: "" });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                    {errors.estimatedMiles && (
                      <p className="text-sm text-destructive">{errors.estimatedMiles}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waitTime">Wait Time (Hours)</Label>
                    <Input
                      id="waitTime"
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={formData.waitTime}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setFormData({ ...formData, waitTime: '' });
                        } else {
                          const value = parseFloat(inputValue);
                          if (!isNaN(value) && value >= 0 && value <= 24) {
                            setFormData({ ...formData, waitTime: inputValue });
                          }
                        }
                        if (errors.waitTime) {
                          setErrors({ ...errors, waitTime: "" });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                    {errors.waitTime && (
                      <p className="text-sm text-destructive">{errors.waitTime}</p>
                    )}
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
              onClick={handleStep1Continue}
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

            {errors.vehicleId && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.vehicleId}</p>
              </div>
            )}

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
                      onClick={() => {
                        setFormData({ ...formData, vehicleId: vehicle.id });
                        if (errors.vehicleId) {
                          setErrors({ ...errors, vehicleId: "" });
                        }
                      }}
                    >
                      {/* Badge */}
                      {badge && (
                        <div className={`absolute z-10 top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${badge.color} bg-background/80 backdrop-blur-sm`}>
                          <badge.icon className="w-3 h-3" />
                          {badge.text}
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Vehicle Image */}
                        <div className={`relative flex items-center justify-center h-48 rounded-lg overflow-hidden ${
                          isRollsRoyce 
                            ? 'bg-gradient-to-br from-[#C5A572]/20 to-[#8B7355]/20' 
                            : 'bg-accent/5'
                        }`}>
                          {vehicle.image_url ? (
                            <img 
                              src={vehicle.image_url} 
                              alt={vehicle.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`${vehicle.image_url ? 'hidden' : 'flex'} absolute inset-0 flex-col items-center justify-center bg-muted/30 backdrop-blur-sm`}>
                            <Car className={`w-16 h-16 mb-2 ${isRollsRoyce ? 'text-[#C5A572]' : 'text-accent'} opacity-40`} />
                            <span className="text-xs text-muted-foreground/70">Image coming soon</span>
                          </div>
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
                          <div>
                            <p className="font-semibold text-[#C5A572] text-lg">
                              £{vehicle.base_price_per_mile.toFixed(2)}/mile
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Minimum 3 hours
                            </p>
                          </div>
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
                onClick={handleStep2Continue}
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
                      onChange={(e) => {
                        // Allow only letters, spaces, hyphens, and apostrophes
                        const sanitized = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
                        setFormData({ ...formData, customerName: sanitized });
                        validateSingleField("customerName", sanitized);
                      }}
                      onBlur={(e) => validateSingleField("customerName", e.target.value)}
                      placeholder="Enter your name"
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive">{errors.customerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email Address *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, customerEmail: e.target.value });
                        validateSingleField("customerEmail", e.target.value);
                      }}
                      onBlur={(e) => validateSingleField("customerEmail", e.target.value)}
                      placeholder="your@email.com"
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-destructive">{errors.customerEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => {
                        // Allow only numbers, spaces, +, -, (, )
                        const sanitized = e.target.value.replace(/[^\d\s+\-()]/g, '');
                        setFormData({ ...formData, customerPhone: sanitized });
                        validateSingleField("customerPhone", sanitized);
                      }}
                      onBlur={(e) => validateSingleField("customerPhone", e.target.value)}
                      placeholder="Enter phone number"
                      className="p-4 focus-visible:ring-[#C5A572]"
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-destructive">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Price Summary (Desktop) */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-gradient-dark border-accent/30 lg:sticky lg:top-24 lg:self-start">
                  <h4 className="text-lg font-semibold text-gradient-metal mb-4">Price Summary</h4>
                  
                  {priceBreakdown ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-medium text-[#C5A572]">£{priceBreakdown.mileagePrice.toFixed(2)}</span>
                      </div>
                      {priceBreakdown.waitTimePrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wait Time</span>
                          <span className="font-medium text-[#C5A572]">£{priceBreakdown.waitTimePrice.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.overnightFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Overnight</span>
                          <span className="font-medium text-[#C5A572]">£{priceBreakdown.overnightFee.toFixed(2)}</span>
                        </div>
                      )}

                      {priceBreakdown.extrasTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Extras</span>
                          <span className="font-medium text-[#C5A572]">£{priceBreakdown.extrasTotal.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-2xl font-bold text-[#C5A572]">
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
                  disabled={loading}
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
          onOpenChange={(open) => {
            setShowCPModal(open);
            // If modal is being closed and form wasn't successfully submitted, reset the toggle
            if (!open && !cpSubmittedRef.current) {
              setCpInterested(false);
            }
            // Reset the ref when modal is closed
            if (!open) {
              cpSubmittedRef.current = false;
            }
          }}
          customerName={formData.customerName}
          customerEmail={formData.customerEmail}
          customerPhone={formData.customerPhone}
          bookingDetails={`${formData.pickupLocation} → ${formData.dropoffLocation} on ${formData.pickupDate} at ${formData.pickupTime}`}
          fullBookingData={{
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
            pickupDate: formData.pickupDate,
            pickupTime: formData.pickupTime,
            vehicleName: vehicles.find(v => v.id === formData.vehicleId)?.name || 'Not selected',
            passengers: formData.passengers,
          }}
          onSubmit={(details) => {
            setCpDetails(details);
            setCpInterested(true);
            cpSubmittedRef.current = true; // Mark as successfully submitted
          }}
        />
      </div>
    </Card>
  );
};

export default MultiStepBookingWidget;
