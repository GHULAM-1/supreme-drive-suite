import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle, AlertCircle, Shield, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Link } from "react-router-dom";
import PWAInstall from "@/components/PWAInstall";

// UK phone validation regex (various UK formats)
const ukPhoneRegex = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(ukPhoneRegex, "Please enter a valid UK phone number"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  gdprConsent: z.boolean().refine(val => val === true, "You must consent to being contacted"),
});

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    gdprConsent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSubmitStatus('idle');

    try {
      // Validate form data
      contactSchema.parse(formData);

      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      toast.success("Thank you — your message has been sent. We'll respond shortly.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        gdprConsent: false,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please correct the errors in the form");
      } else {
        setSubmitStatus('error');
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Texture */}
      <section className="pt-32 pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 to-background pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-gradient-metal leading-tight">
              Get in Touch
            </h1>
            <div className="flex items-center justify-center mb-8">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're here to assist with your travel and protection requirements.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left Column - Contact Info */}
            <div className="space-y-6 animate-fade-in animation-delay-200">
              {/* Phone Card */}
              <Card className="group p-6 shadow-metal bg-card/50 backdrop-blur border-t-2 border-t-accent/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold mb-2 text-gradient-silver">Phone</h3>
                    <a 
                      href="tel:08001234567" 
                      className="text-lg text-accent hover:underline block mb-2 font-medium"
                    >
                      0800 123 4567
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Available 24/7 for bookings and emergencies
                    </p>
                  </div>
                </div>
              </Card>

              {/* Email Card */}
              <Card className="group p-6 shadow-metal bg-card/50 backdrop-blur border-t-2 border-t-accent/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold mb-2 text-gradient-silver">Email</h3>
                    <a 
                      href="mailto:info@supremedrive.co.uk" 
                      className="text-lg text-accent hover:underline block mb-2 font-medium break-all"
                    >
                      info@supremedrive.co.uk
                    </a>
                    <p className="text-sm text-muted-foreground">
                      We typically reply within 2 hours during business hours
                    </p>
                  </div>
                </div>
              </Card>

              {/* Office Card */}
              <Card className="group p-6 shadow-metal bg-card/50 backdrop-blur border-t-2 border-t-accent/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold mb-2 text-gradient-silver">Office</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Mayfair, London<br />
                      United Kingdom
                    </p>
                  </div>
                </div>
              </Card>

              {/* Availability Card */}
              <Card className="group p-6 shadow-metal bg-card/50 backdrop-blur border-t-2 border-t-accent/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold mb-2 text-gradient-silver">Availability</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Available 24/7, 365 days a year
                    </p>
                  </div>
                </div>
              </Card>

              {/* WhatsApp Button */}
              <Card className="group p-6 shadow-metal bg-card/50 backdrop-blur border-t-2 border-t-accent/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold mb-2 text-gradient-silver">WhatsApp</h3>
                    <a 
                      href="https://wa.me/448001234567" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-accent hover:underline block mb-2 font-medium"
                    >
                      Message us on WhatsApp
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Quick response for urgent enquiries
                    </p>
                  </div>
                </div>
              </Card>

              {/* Trust Badges */}
              <Card className="p-6 shadow-metal bg-gradient-to-br from-card via-secondary/20 to-card backdrop-blur border-accent/20">
                <div className="flex items-center justify-around text-center gap-4">
                  <div className="flex-1">
                    <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">Secure</p>
                  </div>
                  <div className="h-10 w-[1px] bg-accent/20" />
                  <div className="flex-1">
                    <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">Confidential</p>
                  </div>
                  <div className="h-10 w-[1px] bg-accent/20" />
                  <div className="flex-1">
                    <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">24/7</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Contact Form */}
            <Card className="p-8 lg:p-10 shadow-metal bg-card/50 backdrop-blur border-accent/20 animate-fade-in animation-delay-400">
              <h3 className="text-3xl font-display font-bold mb-2 text-gradient-silver">Send Us a Message</h3>
              <p className="text-sm text-muted-foreground mb-8">
                We typically reply within 2 hours during business hours.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''} h-12`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''} h-12`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
                
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">Phone Number (UK) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0800 123 4567"
                    className={`${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''} h-12`}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
                
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`${errors.subject ? 'border-destructive focus-visible:ring-destructive' : ''} h-12`}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                  />
                  {errors.subject && (
                    <p id="subject-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>
                
                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className={`${errors.message ? 'border-destructive focus-visible:ring-destructive' : ''} min-h-[120px]`}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* GDPR Consent */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-accent/20">
                  <Checkbox
                    id="gdprConsent"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, gdprConsent: checked as boolean })
                    }
                    className={errors.gdprConsent ? 'border-destructive' : ''}
                    aria-invalid={!!errors.gdprConsent}
                    aria-describedby={errors.gdprConsent ? "gdpr-error" : undefined}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="gdprConsent" 
                      className="text-sm cursor-pointer leading-relaxed font-normal"
                    >
                      I consent to being contacted regarding my enquiry. *
                    </Label>
                    {errors.gdprConsent && (
                      <p id="gdpr-error" className="text-sm text-destructive flex items-center gap-1 mt-1" role="alert">
                        <AlertCircle className="w-4 h-4" />
                        {errors.gdprConsent}
                      </p>
                    )}
                  </div>
                </div>

                {/* Privacy Note */}
                <p className="text-xs text-muted-foreground">
                  Your data is handled in accordance with our{' '}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  . We never share your information with third parties.
                </p>

                {/* Success State */}
                {submitStatus === 'success' && (
                  <div 
                    className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
                    role="alert"
                    aria-live="polite"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-500 mb-1">Message sent successfully</p>
                      <p className="text-sm text-muted-foreground">
                        Thank you — your message has been sent. We'll respond shortly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {submitStatus === 'error' && (
                  <div 
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive mb-1">Something went wrong</p>
                      <p className="text-sm text-muted-foreground">
                        Please try again or contact us directly by phone or email.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base shadow-glow hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <PWAInstall />

      <Footer />
    </div>
  );
};

export default Contact;
