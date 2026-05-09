const FROM_EMAIL = 'TOPAZ 2.0 <noreply@dancetopaz.com>';
const SUBJECT = 'Welcome to the TOPAZ 2.0 family! 🎉';
const RESPONSE_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function sendWelcomeViaProviders(
  to: string,
  htmlBody: string,
  textBody: string,
): Promise<Response> {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  let brevoFailureDetail: string | null = null;
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'TOPAZ 2.0', email: 'noreply@dancetopaz.com' },
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
      brevoFailureDetail = `Brevo ${response.status}: ${errBody}`;
      console.error('[send-welcome-email] Brevo API error:', response.status, errBody);
    } catch (err) {
      brevoFailureDetail = err instanceof Error ? err.message : String(err);
      console.error('[send-welcome-email] Brevo unexpected error:', err);
    }
  }
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: SUBJECT,
          html: htmlBody,
          text: textBody,
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        console.error('[send-welcome-email] Resend API error:', response.status, errBody);
        return new Response(JSON.stringify({ error: 'Email delivery failed', details: errBody }), {
          status: 502,
          headers: RESPONSE_HEADERS,
        });
      }
      const result = await response.json();
      console.log('[send-welcome-email] Email sent via Resend:', result.id);
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
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
  if (brevoFailureDetail && !resendApiKey) {
    return new Response(JSON.stringify({ error: 'Email delivery failed', details: brevoFailureDetail }), {
      status: 502,
      headers: RESPONSE_HEADERS,
    });
  }
  const missingProviderMsg =
    'No email provider configured (set BREVO_API_KEY or RESEND_API_KEY on Supabase).';
  console.warn('[send-welcome-email] ' + missingProviderMsg + ' To: ' + to);
  return new Response(JSON.stringify({ success: true, warning: missingProviderMsg }), {
    status: 200,
    headers: RESPONSE_HEADERS,
  });
}
