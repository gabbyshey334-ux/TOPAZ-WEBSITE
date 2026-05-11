const SUBJECT = 'Welcome to the TOPAZ 2.0 family! 🎉';
const RESPONSE_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? '';

export async function sendWelcomeViaProviders(
  to: string,
  htmlBody: string,
  textBody: string,
): Promise<Response> {
  if (!BREVO_API_KEY) {
    const missingProviderMsg = 'No email provider configured (set BREVO_API_KEY on Supabase).';
    console.warn('[send-welcome-email] ' + missingProviderMsg + ' To: ' + to);
    return new Response(JSON.stringify({ success: true, warning: missingProviderMsg }), {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TOPAZ 2.0',
          email: 'Topaz2.0@dancetopaz.com',
        },
        to: [{ email: to }],
        subject: SUBJECT,
        htmlContent: htmlBody,
        textContent: textBody,
      }),
    });
    if (response.ok) {
      const result = (await response.json()) as { messageId?: string };
      console.log('[send-welcome-email] Email sent via Brevo:', result.messageId);
      return new Response(JSON.stringify({ success: true, id: result.messageId ?? 'brevo' }), {
        status: 200,
        headers: RESPONSE_HEADERS,
      });
    }
    const errBody = await response.text();
    console.error('[send-welcome-email] Brevo API error:', response.status, errBody);
    return new Response(JSON.stringify({ error: 'Email delivery failed', details: errBody }), {
      status: 502,
      headers: RESPONSE_HEADERS,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[send-welcome-email] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: msg }), {
      status: 500,
      headers: RESPONSE_HEADERS,
    });
  }
}
