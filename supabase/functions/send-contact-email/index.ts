import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'contact@travelinsupremestyle.co.uk'
const ADMIN_EMAIL = 'Travelinsupremestyle@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      adminEmail
    } = await req.json()

    // Email template for CUSTOMER (acknowledgment)
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
            .message-card { background: white; border: 2px solid #FFD700; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; margin-top: 20px; border-radius: 10px; }
            .checkmark { color: #10b981; margin-right: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Travel in Supreme Style</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Message Received</p>
            </div>

            <div class="content">
              <h2 style="color: #1a1a1a; margin-top: 0;">Thank You, ${name.split(' ')[0]}!</h2>
              <p>We have received your message and our team is reviewing it. We'll get back to you as soon as possible.</p>

              <div class="message-card">
                <h3 style="margin-top: 0; color: #FFD700;">Your Message</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px;">${message}</p>
              </div>

              <h3 style="color: #1a1a1a;">What Happens Next?</h3>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> Our team will review your enquiry</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> We typically respond within 24 hours</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> For urgent matters, call us at 0800 920 2040</p>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;"><strong>Travel in Supreme Style</strong></p>
              <p style="margin: 5px 0;">Luxury Chauffeur & Close Protection Services</p>
              <p style="margin: 15px 0 5px 0;">Phone: 0800 920 2040</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Email template for ADMIN (notification)
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
            .message-card { background: white; border: 2px solid #FFD700; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; display: inline-block; width: 100px; }
            .detail-value { color: #333; }
            .message-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #FFD700; margin: 15px 0; border-radius: 4px; }
            .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; margin-top: 20px; border-radius: 10px; }
            .priority-badge { background: #FFD700; color: #1a1a1a; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Admin Notification</p>
            </div>

            <div class="content">
              <div class="priority-badge">NEW MESSAGE</div>

              <div class="message-card">
                <h2 style="margin-top: 0; color: #FFD700;">Contact Details</h2>

                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${name}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value"><a href="mailto:${email}" style="color: #FFD700;">${email}</a></span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value"><a href="tel:${phone}" style="color: #FFD700;">${phone}</a></span>
                </div>

                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Subject:</span>
                  <span class="detail-value"><strong>${subject}</strong></span>
                </div>
              </div>

              <div class="message-box">
                <h3 style="margin-top: 0; color: #333;">Message:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="background: #fff3cd; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Received:</strong> ${new Date().toLocaleString('en-GB', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                  timeZone: 'Europe/London'
                })}
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #FFD700, #FFC700); color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px;">
                  Reply to ${name.split(' ')[0]}
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

    // Send acknowledgment email to CUSTOMER
    const customerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `We've received your message - Travel in Supreme Style`,
        html: customerEmailHtml,
      }),
    })

    // Send notification email to ADMIN
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `New Contact Form: ${subject} - ${name}`,
        html: adminEmailHtml,
        reply_to: email,
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
    console.error('Error sending contact email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
