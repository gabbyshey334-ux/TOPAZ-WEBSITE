const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? '';

export async function sendViaBrevo(
  to: string,
  contestant_name: string,
  htmlBody: string,
  textBody: string,
  bccForAdmin: string[] | undefined,
): Promise<{ ok: true; id: string } | { ok: false; detail: string }> {
  if (!BREVO_API_KEY) return { ok: false, detail: 'BREVO_API_KEY not set' };
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
      ...(bccForAdmin ? { bcc: bccForAdmin.map((email) => ({ email })) } : {}),
      subject: `TOPAZ 2.0 — Registration Confirmed: ${contestant_name}`,
      htmlContent: htmlBody,
      textContent: textBody,
    }),
  });
  if (response.ok) {
    const result = (await response.json()) as { messageId?: string };
    return { ok: true, id: result.messageId ?? 'brevo' };
  }
  return { ok: false, detail: `Brevo ${response.status}: ${await response.text()}` };
}
