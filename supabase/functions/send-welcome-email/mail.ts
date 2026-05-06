const FROM = 'TOPAZ 2.0 <noreply@dancetopaz.com>';
const SUBJ = 'Welcome to the TOPAZ 2.0 family! 🎉';
const J = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

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
          subject: SUBJ,
          htmlContent: htmlBody,
          textContent: textBody,
        }),
      });
      if (response.ok) {
        const result = (await response.json()) as { messageId?: string };
        console.log('[sw] Brevo:', result.messageId);
        return new Response(JSON.stringify({ success: true, id: result.messageId ?? 'brevo' }), {
          status: 200,
          headers: J,
        });
      }
      const errBody = await response.text();
      brevoFailureDetail = `Brevo ${response.status}: ${errBody}`;
      console.error('[sw] Brevo:', response.status, errBody);
    } catch (err) {
      brevoFailureDetail = err instanceof Error ? err.message : String(err);
      console.error('[sw] Brevo err:', err);
    }
  }
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: [to],
          subject: SUBJ,
          html: htmlBody,
          text: textBody,
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        console.error('[sw] Resend:', response.status, errBody);
        return new Response(JSON.stringify({ error: 'Email delivery failed', details: errBody }), {
          status: 502,
          headers: J,
        });
      }
      const result = await response.json();
      console.log('[sw] Resend:', result.id);
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: J,
      });
    } catch (err) {
      console.error('[sw] err:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: J,
      });
    }
  }
  if (brevoFailureDetail && !resendApiKey) {
    return new Response(JSON.stringify({ error: 'Email delivery failed', details: brevoFailureDetail }), {
      status: 502,
      headers: J,
    });
  }
  console.warn('[sw] No keys. To: ' + to);
  return new Response(JSON.stringify({ success: true, warning: 'No email provider configured.' }), {
    status: 200,
    headers: J,
  });
}
