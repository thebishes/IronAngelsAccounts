import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { teamName, inviterEmail, inviteeEmail, role, invitationId } = await req.json()

    // Create the invitation email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Team Invitation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .button { display: inline-block; padding: 12px 24px; background: #1e293b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Iron & Clean Pro</h1>
              <h2>Team Invitation</h2>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p><strong>${inviterEmail}</strong> has invited you to join the team <strong>"${teamName}"</strong> as a <strong>${role}</strong>.</p>
              <p>To accept this invitation, please sign in to Iron & Clean Pro and check your team invitations.</p>
              <a href="${Deno.env.get('SITE_URL') || 'http://localhost:5173'}" class="button">
                Sign In to Accept Invitation
              </a>
              <p>If you don't have an account yet, you can sign up using this email address and then accept the invitation.</p>
              <p>This invitation will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p>Iron & Clean Pro - Professional Ironing & Cleaning Business Management</p>
            </div>
          </div>
        </body>
      </html>
    `

    // For now, we'll log the email content since we don't have email service configured
    // In production, you would integrate with an email service like SendGrid, Resend, etc.
    console.log('Team invitation email would be sent to:', inviteeEmail)
    console.log('Email content:', emailHtml)

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Iron & Clean Pro <noreply@yourdomain.com>', // Change to your domain
            to: [inviteeEmail],
            subject: `Invitation to join ${teamName}`,
            html: emailHtml,
          }),
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text()
          console.error('Resend API error:', errorData)
          throw new Error('Failed to send email via Resend')
        }

        const emailResult = await emailResponse.json()
        console.log('Email sent successfully via Resend:', emailResult)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Invitation email sent successfully via Resend',
            emailId: emailResult.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (emailError) {
        console.error('Error sending email via Resend:', emailError)
        // Fall back to logging if email fails
      }
    }

    // Fallback: log email content if no email service configured
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation created (email service not configured)',
        note: 'Configure RESEND_API_KEY environment variable to enable email sending',
        emailContent: emailHtml
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})