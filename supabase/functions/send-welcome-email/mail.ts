const SUBJECT = 'Welcome to the TOPAZ 2.0 family! 🎉';
const RESPONSE_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function sendWelcomeViaProviders(
  to: string,
  htmlBody: string,
  textBody: string,
): Promise<Response> {
  if (!Deno.env.get('BREVO_API_KEY')) {
    const missingProviderMsg = 'No email provider configured (set BREVO_API_KEY on Supabase).';
    console.warn('[send-welcome-email] ' + missingProviderMsg + ' To: ' + to);
    return new Response(JSON.stringify({ success: true, warning: missingProviderMsg }), {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  }

  const recipientEmail = to.trim();
  const subject = SUBJECT;
  const htmlContent = htmlBody;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('BREVO_API_KEY') ?? '',
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
      const errorText = await res.text();
      throw new Error(`Brevo error ${res.status}: ${errorText}`);
    }
    const result = (await res.json()) as { messageId?: string };
    console.log('[send-welcome-email] Email sent via Brevo:', result.messageId);
    return new Response(JSON.stringify({ success: true, id: result.messageId ?? 'brevo' }), {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[send-welcome-email] Unexpected error:', err);
    const status = msg.startsWith('Brevo error') ? 502 : 500;
    return new Response(JSON.stringify({ error: 'Email delivery failed', details: msg }), {
      status,
      headers: RESPONSE_HEADERS,
    });
  }
}
