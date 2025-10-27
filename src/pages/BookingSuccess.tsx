import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Update booking status and send confirmation email
    const updateBookingStatus = async () => {
      if (sessionId) {
        try {
          // Get booking data from localStorage
          const bookingData = localStorage.getItem('pendingBooking');
          if (bookingData) {
            const booking = JSON.parse(bookingData);
            setBookingDetails(booking);

            // Send confirmation email to admin (until domain is configured)
            const isCloseProtection = booking.serviceType === 'close_protection';
            const emailBody = isCloseProtection ? {
              customerEmail: 'ilyasghulam32@gmail.com',
              customerName: booking.customerName,
              bookingDetails: {
                pickupLocation: booking.pickupLocation,
                dropoffLocation: booking.dropoffLocation,
                pickupDate: booking.pickupDate,
                pickupTime: booking.pickupTime,
                vehicleName: `🛡️ ${booking.vehicleName} + CLOSE PROTECTION`,
                passengers: booking.passengers,
                totalPrice: booking.totalPrice,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                additionalRequirements: `
                  <strong>🛡️ CLOSE PROTECTION BOOKING CONFIRMED</strong><br/><br/>
                  <strong>Service Details:</strong><br/>
                  Service Type: ${booking.protectionDetails?.serviceType || 'Combined with Chauffeur Service'}<br/>
                  Risk Level: <strong>${booking.protectionDetails?.threat_level || booking.protectionDetails?.riskLevel || 'Not specified'}</strong><br/>
                  ${booking.protectionDetails?.agentsRequired ? `Agents Required: ${booking.protectionDetails.agentsRequired}<br/>` : ''}
                  ${booking.protectionDetails?.durationHours ? `Duration: ${booking.protectionDetails.durationHours} hours<br/>` : ''}<br/>
                  <strong>Chauffeur Details:</strong><br/>
                  Vehicle: ${booking.vehicleName}<br/>
                  Passengers: ${booking.passengers}<br/><br/>
                  ${booking.additionalRequirements ? `<strong>Additional Requirements:</strong><br/>${booking.additionalRequirements}<br/><br/>` : ''}
                  ${booking.protectionDetails?.requirements ? `<strong>Protection Requirements:</strong><br/>${booking.protectionDetails.requirements}<br/><br/>` : ''}
                  <strong>⚠️ HIGH PRIORITY - This is a confirmed close protection booking requiring immediate team assignment.</strong>
                `
              },
              supportEmail: 'ilyasghulam32@gmail.com'
            } : {
              customerEmail: 'ilyasghulam32@gmail.com',
              customerName: booking.customerName,
              bookingDetails: {
                pickupLocation: booking.pickupLocation,
                dropoffLocation: booking.dropoffLocation,
                pickupDate: booking.pickupDate,
                pickupTime: booking.pickupTime,
                vehicleName: booking.vehicleName,
                passengers: booking.passengers,
                totalPrice: booking.totalPrice,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                additionalRequirements: booking.additionalRequirements || ''
              },
              supportEmail: 'ilyasghulam32@gmail.com'
            };

            await supabase.functions.invoke('hyper-api', {
              body: emailBody
            });

            // Send SMS confirmation - DISABLED FOR TRIAL (Pakistan numbers not supported on Twilio trial)
            // Uncomment when Twilio account is upgraded
            /*
            const smsMessage = `Supreme Drive Suite - Booking Confirmed!\n\nThank you ${booking.customerName}!\n\nPickup: ${booking.pickupLocation}\nDate: ${booking.pickupDate} at ${booking.pickupTime}\nVehicle: ${booking.vehicleName}\nTotal: £${booking.totalPrice}\n\nWe'll contact you within 24hrs.`;

            await supabase.functions.invoke('send-sms', {
              body: {
                to: booking.customerPhone || '+923220425939',
                message: smsMessage
              }
            });
            */

            // TODO: Enable SMS when Twilio account is upgraded
            console.log('SMS notification disabled - Twilio trial restrictions for Pakistan numbers');

            // Clear stored booking data
            localStorage.removeItem('pendingBooking');
          }
        } catch (error) {
          console.error('Error sending confirmation email:', error);
        }
      }
    };

    updateBookingStatus();
  }, [sessionId]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-card rounded-2xl shadow-metal border border-accent/20 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-metal mb-4">
              Payment Successful!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your booking. Your payment has been processed successfully.
            </p>

            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent" />
                What's Next?
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>A confirmation email has been sent to your email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Our team will contact you within 24 hours to confirm your booking details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>You will receive your chauffeur details 24 hours before your journey</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="gradient-accent hover-lift w-full sm:w-auto">
                  Return to Home
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BookingSuccess;
