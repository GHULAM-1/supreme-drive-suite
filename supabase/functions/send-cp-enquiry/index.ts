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
      adminEmail,
      customerName,
      customerEmail,
      customerPhone,
      enquiryDetails,
      supportEmail
    } = await req.json()

    // Email template for CUSTOMER (acknowledgment)
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b0000, #dc143c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .shield-icon { font-size: 48px; margin-bottom: 10px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .enquiry-card { background: white; border: 2px solid #dc143c; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { padding: 12px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; display: block; margin-bottom: 5px; }
            .detail-value { color: #333; display: block; }
            .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; }
            .checkmark { color: #10b981; margin-right: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="shield-icon">🛡️</div>
              <h1>Travel in Supreme Style</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Close Protection Enquiry Received</p>
            </div>

            <div class="content">
              <h2 style="color: #1a1a1a; margin-top: 0;">Thank You, ${customerName.split(' ')[0]}!</h2>
              <p>We have received your close protection enquiry. Due to the sensitive nature of security services, a member of our specialist team will contact you directly to discuss your requirements in detail.</p>

              <div class="enquiry-card">
                <h3 style="margin-top: 0; color: #dc143c;">Your Enquiry Summary</h3>

                <div class="detail-row">
                  <span class="detail-label">Service Type:</span>
                  <span class="detail-value">${enquiryDetails.serviceType}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${enquiryDetails.date}</span>
                </div>

                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Primary Location:</span>
                  <span class="detail-value">${enquiryDetails.primaryLocation}</span>
                </div>
              </div>

              <h3 style="color: #1a1a1a;">What Happens Next?</h3>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> Our security team will review your requirements</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> We will contact you within 24 hours</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> All communications are handled with strict confidentiality</p>
              <p style="margin: 10px 0;"><span class="checkmark">✓</span> For urgent matters, call us at 0800 920 2040</p>

              <div style="background: #fff3cd; border-left: 4px solid #dc143c; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>🔒 Confidentiality Notice:</strong><br/>
                Your enquiry details are handled with the utmost discretion and confidentiality.
              </div>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;"><strong>Travel in Supreme Style</strong></p>
              <p style="margin: 5px 0;">Close Protection & Executive Security Services</p>
              <p style="margin: 10px 0 5px 0;">📞 0800 920 2040</p>
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
            .header { background: linear-gradient(135deg, #8b0000, #dc143c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .shield-icon { font-size: 48px; margin-bottom: 10px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .enquiry-card { background: white; border: 2px solid #dc143c; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { padding: 12px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; display: block; margin-bottom: 5px; }
            .detail-value { color: #333; display: block; }
            .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; }
            .priority-badge { background: #dc143c; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; margin: 15px 0; }
            .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .customer-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
            .risk-high { color: #dc143c; font-weight: bold; font-size: 18px; }
            .risk-medium { color: #ff9800; font-weight: bold; font-size: 18px; }
            .risk-low { color: #4caf50; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="shield-icon">🛡️</div>
              <h1>Close Protection Enquiry</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">New Security Request</p>
            </div>

            <div class="content">
              <div class="priority-badge">⚠️ HIGH PRIORITY ENQUIRY</div>

              <h2 style="color: #1a1a1a; margin-top: 20px;">New Close Protection Request</h2>
              <p>A client has submitted a confidential close protection enquiry. Please review and respond within 24 hours.</p>

              <div class="customer-box">
                <h3 style="margin-top: 0; color: #2e7d32;">👤 Customer Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value"><a href="mailto:${customerEmail}">${customerEmail}</a></span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value"><a href="tel:${customerPhone}">${customerPhone}</a></span>
                </div>
              </div>

              <div class="enquiry-card">
                <h3 style="margin-top: 0; color: #dc143c;">🛡️ Service Requirements</h3>

                <div class="detail-row">
                  <span class="detail-label">Service Type:</span>
                  <span class="detail-value">${enquiryDetails.serviceType}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${enquiryDetails.date}</span>
                </div>

                ${enquiryDetails.startTime && enquiryDetails.startTime !== 'TBD' ? `
                  <div class="detail-row">
                    <span class="detail-label">Start Time:</span>
                    <span class="detail-value">${enquiryDetails.startTime}</span>
                  </div>
                ` : ''}

                ${enquiryDetails.durationHours && enquiryDetails.durationHours !== 'TBD' ? `
                  <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${enquiryDetails.durationHours} hours</span>
                  </div>
                ` : ''}

                <div class="detail-row">
                  <span class="detail-label">Primary Location:</span>
                  <span class="detail-value">${enquiryDetails.primaryLocation}</span>
                </div>

                ${enquiryDetails.secondaryLocation && enquiryDetails.secondaryLocation.trim() !== '' ? `
                  <div class="detail-row">
                    <span class="detail-label">Secondary Location:</span>
                    <span class="detail-value">${enquiryDetails.secondaryLocation}</span>
                  </div>
                ` : ''}

                ${enquiryDetails.agentsRequired && enquiryDetails.agentsRequired !== 'TBD' ? `
                  <div class="detail-row">
                    <span class="detail-label">Agents Required:</span>
                    <span class="detail-value">${enquiryDetails.agentsRequired}</span>
                  </div>
                ` : ''}

                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Risk Level:</span>
                  <span class="detail-value">
                    <span class="risk-${enquiryDetails.riskLevel.toLowerCase()}">${enquiryDetails.riskLevel.toUpperCase()}</span>
                  </span>
                </div>
              </div>

              ${enquiryDetails.notes ? `
                <div class="info-box">
                  <strong>📝 Additional Notes:</strong><br/><br/>
                  ${enquiryDetails.notes.replace(/\n/g, '<br/>')}
                </div>
              ` : ''}

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong>⏰ Action Required:</strong><br/>
                1. Review security requirements and assess risk level<br/>
                2. Prepare custom quote based on service requirements<br/>
                3. Contact customer at <a href="tel:${customerPhone}">${customerPhone}</a> or <a href="mailto:${customerEmail}">${customerEmail}</a><br/>
                4. Respond within 24 hours
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${customerEmail}" style="display: inline-block; background: linear-gradient(135deg, #dc143c, #8b0000); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reply to Customer
                </a>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #dc143c; font-weight: bold; font-size: 16px;">
                  ⚠️ CONFIDENTIAL - Handle with discretion
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;"><strong>Travel in Supreme Style</strong></p>
              <p style="margin: 5px 0;">Close Protection & Executive Security Services</p>
              <p style="margin: 10px 0 5px 0;">📞 0800 920 2040</p>
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
        to: [customerEmail],
        subject: `Close Protection Enquiry Received - Travel in Supreme Style`,
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
        subject: `CP Enquiry - ${enquiryDetails.riskLevel} Risk - ${customerName} - ${enquiryDetails.date}`,
        html: adminEmailHtml,
        reply_to: customerEmail,
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
    console.error('Error sending CP enquiry email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
