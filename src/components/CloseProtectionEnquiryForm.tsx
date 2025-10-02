import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";

const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Valid phone number is required").max(20),
  serviceType: z.enum(["Event", "Travel", "Residential", "Ongoing"], {
    required_error: "Please select a service type",
  }),
  notes: z.string().trim().max(1000).optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

const CloseProtectionEnquiryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
  });

  const serviceType = watch("serviceType");

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true);
    try {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          customer_name: data.fullName,
          customer_email: data.email,
          customer_phone: data.phone,
          pickup_location: "Close Protection Service Request",
          dropoff_location: `${data.serviceType} Protection`,
          pickup_date: new Date().toISOString().split("T")[0],
          pickup_time: "00:00:00",
          passengers: 1,
          luggage: 0,
          additional_requirements: `SERVICE TYPE: ${data.serviceType}\n${data.notes || ""}`,
          internal_notes: "HIGH_PRIORITY_PROTECTION_ENQUIRY",
          status: "new",
        })
        .select()
        .single();

      if (error) throw error;

      const refNumber = booking.id.substring(0, 8).toUpperCase();
      setReferenceNumber(refNumber);
      setSubmitted(true);
      reset();

      toast({
        title: "Enquiry Submitted",
        description: `Your confidential enquiry has been received. Reference: ${refNumber}`,
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4 p-8 bg-card/50 backdrop-blur rounded-lg border border-primary/20">
        <div className="w-16 h-16 mx-auto rounded-full gradient-metal flex items-center justify-center">
          <Lock className="w-8 h-8 text-background" />
        </div>
        <h3 className="text-2xl font-display font-bold text-gradient-metal">
          Enquiry Received
        </h3>
        <p className="text-muted-foreground">
          Thank you for your confidential enquiry. Our team will contact you within 24 hours.
        </p>
        <p className="text-sm text-primary">
          Reference Number: <span className="font-mono font-bold">{referenceNumber}</span>
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="mt-4"
        >
          Submit Another Enquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="John Smith"
              className="bg-background/50"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className="bg-background/50"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+44 7700 900000"
              className="bg-background/50"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Required *</Label>
            <Select
              value={serviceType}
              onValueChange={(value) => setValue("serviceType", value as any)}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/20">
                <SelectItem value="Event">Event Protection</SelectItem>
                <SelectItem value="Travel">Travel Security</SelectItem>
                <SelectItem value="Residential">Residential Protection</SelectItem>
                <SelectItem value="Ongoing">Ongoing Security Detail</SelectItem>
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-destructive">{errors.serviceType.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Special Requirements</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Please provide any specific requirements or concerns..."
            className="bg-background/50 min-h-[120px]"
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            All enquiries are handled with strict discretion. NDAs available upon request.
            Your information is encrypted and only accessible to our security team.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-accent shadow-glow text-lg py-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting Securely...
            </>
          ) : (
            "Submit Confidential Enquiry"
          )}
        </Button>
      </form>
    </div>
  );
};

export default CloseProtectionEnquiryForm;
