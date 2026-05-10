const FROM_EMAIL = 'TOPAZ 2.0 <noreply@dancetopaz.com>';

export async function sendViaBrevo(
  to: string,
  contestant_name: string,
  htmlBody: string,
  textBody: string,
  bccForAdmin: string[] | undefined,
): Promise<{ ok: true; id: string } | { ok: false; detail: string }> {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  if (!brevoApiKey) return { ok: false, detail: 'no brevo key' };
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'TOPAZ 2.0', email: 'noreply@dancetopaz.com' },
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

export async function sendViaResend(
  to: string,
  contestant_name: string,
  htmlBody: string,
  textBody: string,
  bccForAdmin: string[] | undefined,
): Promise<{ ok: true; id: string } | { ok: false; detail: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) return { ok: false, detail: 'no resend key' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      ...(bccForAdmin ? { bcc: bccForAdmin } : {}),
      subject: `TOPAZ 2.0 — Registration Confirmed: ${contestant_name}`,
      html: htmlBody,
      text: textBody,
    }),
  });
  if (response.ok) {
    const result = (await response.json()) as { id?: string };
    return { ok: true, id: result.id ?? 'resend' };
  }
  return { ok: false, detail: `Resend ${response.status}: ${await response.text()}` };
}
