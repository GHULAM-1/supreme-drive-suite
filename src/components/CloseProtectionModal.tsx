import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CloseProtectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingDetails?: string;
}

const CloseProtectionModal = ({ 
  open, 
  onOpenChange, 
  customerName = "", 
  customerEmail = "", 
  customerPhone = "",
  bookingDetails = ""
}: CloseProtectionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    requirements: "",
    threatLevel: ""
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Note: This is a placeholder. In production, this would send to a dedicated CP enquiries table
      // For now, we'll just show success and log the enquiry
      console.log("CP Enquiry:", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        threatLevel: formData.threatLevel || "Not Sure",
        requirements: formData.requirements,
        bookingContext: bookingDetails
      });

      toast.success("Close protection enquiry submitted! Our team will contact you shortly.");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        requirements: "",
        threatLevel: ""
      });
    } catch (error) {
      toast.error("Failed to submit enquiry. Please try again.");
      console.error("CP Enquiry error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#C5A572]" />
            <DialogTitle className="text-2xl">Close Protection Services</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Add discreet security for your journey. Our trained professionals provide executive protection tailored to your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cp-name">Name *</Label>
            <Input
              id="cp-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-email">Email *</Label>
            <Input
              id="cp-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-phone">Phone *</Label>
            <Input
              id="cp-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 7XXX XXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-threat">Threat Assessment</Label>
            <Select
              value={formData.threatLevel}
              onValueChange={(value) => setFormData({ ...formData, threatLevel: value })}
            >
              <SelectTrigger id="cp-threat">
                <SelectValue placeholder="Select threat level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low - General safety preference</SelectItem>
                <SelectItem value="Medium">Medium - Some specific concerns</SelectItem>
                <SelectItem value="High">High - Known security risks</SelectItem>
                <SelectItem value="Not Sure">Not Sure - Need assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-requirements">Specific Requirements</Label>
            <Textarea
              id="cp-requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Any specific security concerns or requirements..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 gradient-accent"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Enquiry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CloseProtectionModal;
