import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'contact@travelinsupremestyle.co.uk'
const ADMIN_EMAIL = 'Travelinsupremestyle@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      customerEmail,
      customerName,
      bookingDetails,
      supportEmail
    } = await req.json()

    // Email template for CUSTOMER
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; border: 2px solid #FFD700; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; }
            .detail-value { color: #333; }
            .total { font-size: 24px; font-weight: bold; color: #FFD700; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFD700; }
            .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; }
            .checkmark { color: #10b981; margin-right: 8px; }
            .button { display: inline-block; background: linear-gradient(135deg, #FFD700, #FFC700); color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Travel in Supreme Style</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Booking Confirmation</p>
            </div>

            <div class="content">
              <h2 style="color: #1a1a1a; margin-top: 0;">Thank You, ${customerName}!</h2>
              <p>Your luxury chauffeur service booking has been confirmed. We're excited to provide you with an exceptional travel experience.</p>

              <div class="booking-card">
                <h3 style="margin-top: 0; color: #FFD700;">Booking Details</h3>

                <div class="detail-row">
                  <span class="detail-label">Pickup Location:</span>
                  <span class="detail-value">${bookingDetails.pickupLocation}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Drop-off Location:</span>
                  <span class="detail-value">${bookingDetails.dropoffLocation}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${bookingDetails.pickupDate} at ${bookingDetails.pickupTime}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Vehicle:</span>
                  <span class="detail-value">${bookingDetails.vehicleName}</span>
                </div>

                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Passengers:</span>
                  <span class="detail-value">${bookingDetails.passengers || 'N/A'}</span>
                </div>

                <div class="total">
                  Total: £${bookingDetails.totalPrice}
                </div>
              </div>

              <h3 style="color: #1a1a1a;">What's Next?</h3>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> Our team will contact you within 24 hours to confirm all details</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> You will receive your chauffeur's details 24 hours before your journey</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> Payment instructions will be sent separately</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${supportEmail}" class="button">Contact Support</a>
              </div>

              ${bookingDetails.additionalRequirements ? `
                <div style="background: #fff3cd; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0;">
                  <strong>Special Requests:</strong><br/>
                  ${bookingDetails.additionalRequirements}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p style="margin: 5px 0;"><strong>Travel in Supreme Style</strong></p>
              <p style="margin: 5px 0;">Luxury Chauffeur & Close Protection Services</p>
              <p style="margin: 15px 0 5px 0;">Need help? Contact us at ${supportEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Email template for ADMIN
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; border: 2px solid #FFD700; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .customer-card { background: white; border: 2px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; }
            .detail-value { color: #333; }
            .total { font-size: 24px; font-weight: bold; color: #FFD700; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFD700; }
            .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; }
            .priority-badge { background: #FFD700; color: #1a1a1a; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Booking Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Admin Notification</p>
            </div>

            <div class="content">
              <div class="priority-badge">NEW BOOKING</div>

              <div class="customer-card">
                <h3 style="margin-top: 0; color: #4caf50;">Customer Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value"><a href="mailto:${bookingDetails.customerEmail || customerEmail}">${bookingDetails.customerEmail || customerEmail}</a></span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value"><a href="tel:${bookingDetails.customerPhone}">${bookingDetails.customerPhone || 'Not provided'}</a></span>
                </div>
              </div>

              <div class="booking-card">
                <h3 style="margin-top: 0; color: #FFD700;">Booking Details</h3>

                <div class="detail-row">
                  <span class="detail-label">Pickup Location:</span>
                  <span class="detail-value">${bookingDetails.pickupLocation}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Drop-off Location:</span>
                  <span class="detail-value">${bookingDetails.dropoffLocation}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${bookingDetails.pickupDate} at ${bookingDetails.pickupTime}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Vehicle:</span>
                  <span class="detail-value">${bookingDetails.vehicleName}</span>
                </div>

                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Passengers:</span>
                  <span class="detail-value">${bookingDetails.passengers || 'N/A'}</span>
                </div>

                <div class="total">
                  Total: £${bookingDetails.totalPrice}
                </div>
              </div>

              ${bookingDetails.additionalRequirements ? `
                <div style="background: #fff3cd; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0;">
                  <strong>Special Requests:</strong><br/>
                  ${bookingDetails.additionalRequirements}
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${bookingDetails.customerEmail || customerEmail}" style="display: inline-block; background: linear-gradient(135deg, #FFD700, #FFC700); color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reply to Customer
                </a>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;"><strong>Travel in Supreme Style</strong></p>
              <p style="margin: 5px 0;">Admin Dashboard Notification</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to CUSTOMER
    const customerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [bookingDetails.customerEmail || customerEmail],
        subject: `Booking Confirmed - ${bookingDetails.pickupDate}`,
        html: customerEmailHtml,
      }),
    })

    // Send email to ADMIN
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `New Booking - ${customerName} - ${bookingDetails.pickupDate}`,
        html: adminEmailHtml,
        reply_to: bookingDetails.customerEmail || customerEmail,
      }),
    })

    const customerData = await customerRes.json()
    const adminData = await adminRes.json()

    if (customerRes.ok && adminRes.ok) {
      return new Response(JSON.stringify({ success: true, customerEmail: customerData, adminEmail: adminData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      throw new Error('Failed to send one or more emails')
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
