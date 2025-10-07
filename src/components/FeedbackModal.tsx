import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { z } from "zod";

const feedbackSchema = z.object({
  customer_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  customer_email: z.string().trim().email("Invalid email address").max(255),
  customer_phone: z.string().trim().max(20).optional(),
  service_type: z.string().optional(),
  booking_reference: z.string().trim().max(50).optional(),
  rating: z.number().min(1, "Please select a rating").max(5),
  feedback_message: z.string().trim().min(10, "Feedback must be at least 10 characters").max(1000),
  would_recommend: z.boolean(),
  gdpr_consent: z.boolean().refine((val) => val === true, "You must agree to the privacy policy"),
});

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [gdprConsent, setGdprConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      customer_name: formData.get("customer_name") as string,
      customer_email: formData.get("customer_email") as string,
      customer_phone: formData.get("customer_phone") as string,
      service_type: formData.get("service_type") as string,
      booking_reference: formData.get("booking_reference") as string,
      rating,
      feedback_message: formData.get("feedback_message") as string,
      would_recommend: wouldRecommend,
      gdpr_consent: gdprConsent,
    };

    try {
      const validated = feedbackSchema.parse(data);

      await supabase.from("feedback_submissions").insert({
        customer_name: validated.customer_name,
        customer_email: validated.customer_email,
        customer_phone: validated.customer_phone || null,
        service_type: validated.service_type || null,
        booking_reference: validated.booking_reference || null,
        rating: validated.rating,
        feedback_message: validated.feedback_message,
        would_recommend: validated.would_recommend,
      });

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback has been submitted successfully.",
      });

      // Reset form
      setRating(0);
      setWouldRecommend(true);
      setGdprConsent(false);
      e.currentTarget.reset();
      setTimeout(() => onOpenChange(false), 500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        const fieldName = firstError.path[0] as string;
        
        const fieldLabels: Record<string, string> = {
          customer_name: "Name",
          customer_email: "Email",
          rating: "Rating",
          feedback_message: "Feedback message",
          gdpr_consent: "Privacy policy consent",
        };
        
        toast({
          title: "Please check your input",
          description: `${fieldLabels[fieldName] || fieldName}: ${firstError.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            We value your feedback. Please share your experience with our service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Name *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                required
                maxLength={100}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Email *</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                required
                maxLength={255}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone (Optional)</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                maxLength={20}
                placeholder="+44 800 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select name="service_type">
                <SelectTrigger id="service_type">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chauffeur">Chauffeur Service</SelectItem>
                  <SelectItem value="close_protection">Close Protection</SelectItem>
                  <SelectItem value="airport_transfer">Airport Transfer</SelectItem>
                  <SelectItem value="event">Event Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_reference">Booking Reference (Optional)</Label>
            <Input
              id="booking_reference"
              name="booking_reference"
              maxLength={50}
              placeholder="e.g., BK-12345"
            />
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback_message">Your Feedback *</Label>
            <Textarea
              id="feedback_message"
              name="feedback_message"
              required
              maxLength={1000}
              rows={5}
              placeholder="Please share your experience with our service..."
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="would_recommend"
              checked={wouldRecommend}
              onCheckedChange={(checked) => setWouldRecommend(checked as boolean)}
            />
            <Label htmlFor="would_recommend" className="cursor-pointer font-normal">
              I would recommend this service to others
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="gdpr_consent"
              checked={gdprConsent}
              onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
              required
            />
            <Label htmlFor="gdpr_consent" className="cursor-pointer font-normal text-sm">
              I agree to the processing of my personal data in accordance with the{" "}
              <a href="/privacy" className="text-primary underline" target="_blank">
                privacy policy
              </a>
              . *
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0 || !gdprConsent}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
