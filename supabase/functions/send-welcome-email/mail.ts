import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUBJECT = 'Welcome to the TOPAZ 2.0 family! 🎉';
const RESPONSE_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function sendWelcomeViaProviders(
  to: string,
  htmlBody: string,
  textBody: string,
): Promise<Response> {
  const brevoKey = Deno.env.get('BREVO_API_KEY') ?? '';
  if (!brevoKey) {
    console.error('[send-welcome-email] BREVO_API_KEY not set');
    return new Response(JSON.stringify({ error: 'Email configuration missing' }), {
      status: 500,
      headers: RESPONSE_HEADERS,
    });
  }

  const recipientEmail = (to ?? '').trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.error('[send-welcome-email] Invalid recipient email:', recipientEmail);
    return new Response(JSON.stringify({ error: 'Invalid recipient email' }), {
      status: 400,
      headers: RESPONSE_HEADERS,
    });
  }

  const subject = SUBJECT;
  const htmlContent = htmlBody;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'TOPAZ 2.0', email: 'Topaz2.0@dancetopaz.com' },
      to: [{ email: recipientEmail }],
      subject,
      htmlContent,
      textContent: textBody,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Brevo failed:', res.status, errText);
    return new Response(
      JSON.stringify({ error: 'Email delivery failed', detail: errText }),
      { status: 500, headers: RESPONSE_HEADERS },
    );
  }

  const result = (await res.json()) as { messageId?: string };
  console.log('[send-welcome-email] Email sent via Brevo:', result.messageId);
  return new Response(JSON.stringify({ success: true, id: result.messageId ?? 'brevo' }), {
    status: 200,
    headers: RESPONSE_HEADERS,
  });
}
