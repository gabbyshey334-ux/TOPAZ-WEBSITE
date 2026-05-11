import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export async function sendViaBrevo(
  to: string,
  contestant_name: string,
  htmlBody: string,
  textBody: string,
  bccForAdmin: string[] | undefined,
): Promise<{ ok: true; id: string } | { ok: false; detail: string }> {
  const brevoKey = Deno.env.get('BREVO_API_KEY') ?? '';
  if (!brevoKey) {
    return { ok: false, detail: 'BREVO_API_KEY not set' };
  }

  const recipientEmail = to.trim();
  const subject = `TOPAZ 2.0 — Registration Confirmed: ${contestant_name}`;
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
      ...(bccForAdmin ? { bcc: bccForAdmin.map((email) => ({ email })) } : {}),
      subject,
      htmlContent,
      textContent: textBody,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Brevo error:', res.status, errorBody);
    return { ok: false, detail: errorBody };
  }

  const result = (await res.json()) as { messageId?: string };
  return { ok: true, id: result.messageId ?? 'brevo' };
}
