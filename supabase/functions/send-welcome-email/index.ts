import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const COMPETITION_DATE = 'August 22, 2026';
const COMPETITION_LOCATION = 'Seaside Convention Center — 415 1st Ave, Seaside, OR 97138';
const FROM_EMAIL = 'TOPAZ 2.0 <noreply@dancetopaz.com>';

interface WelcomePayload {
  to: string;
  name?: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  let payload: WelcomePayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const to = (payload.to ?? '').trim();
  const name = (payload.name ?? '').trim();

  if (!to) {
    return new Response(JSON.stringify({ error: 'Missing required field: to' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const greeting = name ? `Hi ${name},` : 'Hi there,';

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to TOPAZ 2.0</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 0; color: #222; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1F4E78, #2E75B6); padding: 48px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 32px; letter-spacing: 1px; font-weight: 800; }
    .header p { color: #cfe3f5; margin: 10px 0 0; font-size: 15px; }
    .body { padding: 36px 40px; line-height: 1.65; font-size: 15px; }
    .highlight { background: #eff6ff; border-left: 4px solid #2E75B6; padding: 18px 22px; border-radius: 6px; margin: 24px 0; }
    .highlight h3 { margin: 0 0 6px; color: #1F4E78; font-size: 16px; }
    .footer { background: #f9fafb; padding: 22px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer a { color: #2E75B6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Welcome to TOPAZ 2.0 🎉</h1>
      <p>You're officially on the list</p>
    </div>
    <div class="body">
      <p style="font-size:16px"><strong>${greeting}</strong></p>
      <p>Thank you for joining the <strong>TOPAZ 2.0</strong> family. We're thrilled to have you with us on the journey back to the stage.</p>

      <div class="highlight">
        <h3>The Return of TOPAZ 2.0</h3>
        <p style="margin:0"><strong>Date:</strong> ${COMPETITION_DATE}<br/>
        <strong>Location:</strong> ${COMPETITION_LOCATION}</p>
      </div>

      <p>As a subscriber, you'll be the first to hear about:</p>
      <ul>
        <li>Registration openings and important deadlines</li>
        <li>Competition announcements &amp; schedule updates</li>
        <li>New merch drops and exclusive news</li>
        <li>Stories and highlights from the TOPAZ community</li>
      </ul>

      <p>We can't wait to see you — whether on stage, in the crowd, or right here in your inbox.</p>

      <p style="margin-top:32px;">Until next time,<br/><strong>The TOPAZ 2.0 Team</strong></p>
    </div>
    <div class="footer">
      &copy; 2026 TOPAZ 2.0 LLC &bull; <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Welcome to TOPAZ 2.0!

${greeting}

Thank you for joining the TOPAZ 2.0 family. You're officially on the list.

The Return of TOPAZ 2.0
Date: ${COMPETITION_DATE}
Location: ${COMPETITION_LOCATION}

As a subscriber you'll be the first to hear about registration openings, competition announcements, new merch, and stories from the TOPAZ community.

We can't wait to see you.

— The TOPAZ 2.0 Team
topaz2.0@yahoo.com`;

  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: 'Welcome to the TOPAZ 2.0 family! 🎉',
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('[send-welcome-email] Resend API error:', response.status, errBody);
        return new Response(JSON.stringify({ error: 'Email delivery failed', details: errBody }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const result = await response.json();
      console.log('[send-welcome-email] Email sent via Resend:', result.id);
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (err) {
      console.error('[send-welcome-email] Unexpected error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  console.warn('[send-welcome-email] No RESEND_API_KEY set. Email not sent. To: ' + to);
  return new Response(JSON.stringify({ success: true, warning: 'No email provider configured.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
