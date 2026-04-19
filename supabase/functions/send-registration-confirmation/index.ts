import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const COMPETITION_DATE = 'August 22, 2026';
const COMPETITION_LOCATION = '415 1st Ave, Seaside, OR 97138 (Seaside Convention Center)';
const FROM_EMAIL = 'TOPAZ 2.0 <onboarding@resend.dev>';
const FROM_NAME = 'TOPAZ 2.0 Dance Competition';

interface RegistrationEmailPayload {
  to: string;
  contestant_name: string;
  category: string;
  group_size: string;
  total_fee: number;
  studio_name?: string;
  teacher_name?: string;
  routine_name?: string;
  song_title?: string;
  artist_name?: string;
  music_delivery_method?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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

  let payload: RegistrationEmailPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const { to, contestant_name, category, group_size, total_fee, studio_name, teacher_name, routine_name, song_title, artist_name, music_delivery_method } = payload;

  if (!to || !contestant_name) {
    return new Response(JSON.stringify({ error: 'Missing required fields: to, contestant_name' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const musicNote = music_delivery_method === 'upload'
    ? 'Your music file has been uploaded digitally.'
    : 'Please bring your music on a USB drive and turn it in to the front desk at least 1 hour before your performance time.';

  const feeFormatted = `$${Number(total_fee).toFixed(2)}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TOPAZ 2.0 Registration Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 0; color: #222; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .header { background: #1F4E78; padding: 36px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: 1px; }
    .header p { color: #93c5fd; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 36px 40px; }
    .highlight { background: #eff6ff; border-left: 4px solid #2E75B6; padding: 16px 20px; border-radius: 6px; margin: 24px 0; }
    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; color: #6b7280; font-size: 14px; flex-shrink: 0; }
    .detail-value { font-weight: 600; font-size: 14px; }
    .fee { font-size: 24px; font-weight: 800; color: #2E75B6; }
    .note { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px 20px; margin: 24px 0; font-size: 14px; }
    .footer { background: #f9fafb; padding: 24px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer a { color: #2E75B6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>TOPAZ 2.0</h1>
      <p>Registration Confirmation</p>
    </div>
    <div class="body">
      <p style="font-size:16px">Hi <strong>${contestant_name}</strong>,</p>
      <p>Your registration for <strong>The Return of TOPAZ 2.0</strong> has been received! Here is a summary of your entry.</p>

      <div class="highlight">
        <div class="detail-row"><span class="detail-label">Dancer / Entry</span><span class="detail-value">${contestant_name}</span></div>
        ${studio_name ? `<div class="detail-row"><span class="detail-label">Studio</span><span class="detail-value">${studio_name}</span></div>` : ''}
        ${teacher_name ? `<div class="detail-row"><span class="detail-label">Teacher</span><span class="detail-value">${teacher_name}</span></div>` : ''}
        <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${category}</span></div>
        <div class="detail-row"><span class="detail-label">Entry Type</span><span class="detail-value">${group_size}</span></div>
        ${routine_name ? `<div class="detail-row"><span class="detail-label">Routine Name</span><span class="detail-value">${routine_name}</span></div>` : ''}
        ${song_title ? `<div class="detail-row"><span class="detail-label">Song</span><span class="detail-value">${song_title}${artist_name ? ' — ' + artist_name : ''}</span></div>` : ''}
      </div>

      <p>Entry fee: <span class="fee">${feeFormatted}</span></p>
      <p style="font-size:13px;color:#6b7280;">Solo $100 &bull; Duo $80/person &bull; Trio $70/person &bull; Group/Production $60/person</p>

      <div class="note">
        <strong>Music Reminder:</strong> ${musicNote}
        <br/>Each competition number requires a separate USB. TOPAZ 2.0 is not responsible for damaged or lost USBs.
      </div>

      <h3 style="color:#1F4E78;">Competition Details</h3>
      <p><strong>Date:</strong> ${COMPETITION_DATE}</p>
      <p><strong>Location:</strong> ${COMPETITION_LOCATION}</p>

      <p style="margin-top:28px;font-size:14px;color:#6b7280;">
        If you have questions or need to make changes before the deadline (July 30, 2026, 12:00 AM),
        please email <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a> or call <a href="tel:9712994401">971-299-4401</a>.
      </p>
    </div>
    <div class="footer">
      &copy; 2026 TOPAZ 2.0 LLC &bull; <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a>
    </div>
  </div>
</body>
</html>`;

  const textBody = `TOPAZ 2.0 — Registration Confirmation

Hi ${contestant_name},

Your registration for The Return of TOPAZ 2.0 has been received.

Entry Summary:
- Dancer/Entry: ${contestant_name}
${studio_name ? `- Studio: ${studio_name}\n` : ''}- Category: ${category}
- Entry Type: ${group_size}
${routine_name ? `- Routine: ${routine_name}\n` : ''}${song_title ? `- Song: ${song_title}${artist_name ? ' — ' + artist_name : ''}\n` : ''}
Entry Fee: ${feeFormatted}

Music: ${musicNote}

Competition Date: ${COMPETITION_DATE}
Location: ${COMPETITION_LOCATION}

Questions? Email topaz2.0@yahoo.com or call 971-299-4401.
Registration deadline: July 30, 2026, 12:00 AM. No exceptions.

— TOPAZ 2.0 LLC`;

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
          subject: `TOPAZ 2.0 — Registration Confirmed: ${contestant_name}`,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('[send-registration-confirmation] Resend API error:', response.status, errBody);
        return new Response(JSON.stringify({ error: 'Email delivery failed', details: errBody }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const result = await response.json();
      console.log('[send-registration-confirmation] Email sent via Resend:', result.id);
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (err) {
      console.error('[send-registration-confirmation] Unexpected error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  // No email provider configured — log and return success so registration is not blocked
  console.warn('[send-registration-confirmation] No RESEND_API_KEY set. Email not sent. To: ' + to + ', Contestant: ' + contestant_name);
  return new Response(JSON.stringify({ success: true, warning: 'No email provider configured. Set RESEND_API_KEY in Supabase edge function secrets.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
