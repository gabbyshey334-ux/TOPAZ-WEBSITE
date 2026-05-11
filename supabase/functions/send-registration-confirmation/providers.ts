export async function sendViaBrevo(
  to: string,
  contestant_name: string,
  htmlBody: string,
  textBody: string,
  bccForAdmin: string[] | undefined,
): Promise<{ ok: true; id: string } | { ok: false; detail: string }> {
  const recipientEmail = to.trim();
  const subject = `TOPAZ 2.0 — Registration Confirmed: ${contestant_name}`;
  const htmlContent = htmlBody;
  if (!Deno.env.get('BREVO_API_KEY')) {
    return { ok: false, detail: 'BREVO_API_KEY not set' };
  }
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
        ...(bccForAdmin ? { bcc: bccForAdmin.map((email) => ({ email })) } : {}),
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
    return { ok: true, id: result.messageId ?? 'brevo' };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, detail };
  }
}
