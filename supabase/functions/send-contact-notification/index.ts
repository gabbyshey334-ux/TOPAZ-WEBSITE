const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TO_EMAIL = 'topaz2.0@yahoo.com';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: {
    submissionId?: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
  };

  try {
    body = await req.json();
    if (!body.name || !body.email || !body.message) throw new Error('Missing required fields');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  if (!RESEND_API_KEY) {
    console.error('[send-contact-notification] RESEND_API_KEY not set');
    return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500 });
  }

  const subjectLabel = body.subject
    ? body.subject.charAt(0).toUpperCase() + body.subject.slice(1).replace(/_/g, ' ')
    : 'General Inquiry';

  const safeMessage = body.message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
  <div style="background:#0a0a0a;border-radius:12px;padding:32px;margin-bottom:24px">
    <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px">TOPAZ<span style="color:#2E75B6">2.0</span></h1>
    <p style="color:#6b7280;font-size:14px;margin:0">New Contact Message</p>
  </div>
  <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
    <h2 style="color:#0a0a0a;font-size:20px;margin:0 0 24px">You have a new message</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:120px">Name</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#0a0a0a;font-size:14px;font-weight:600">${body.name}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Email</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px">
          <a href="mailto:${body.email}" style="color:#2E75B6">${body.email}</a>
        </td>
      </tr>
      ${body.phone ? `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Phone</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#0a0a0a;font-size:14px">${body.phone}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Subject</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#0a0a0a;font-size:14px;font-weight:600">${subjectLabel}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top">Message</td>
        <td style="padding:10px 0;color:#0a0a0a;font-size:14px;line-height:1.6;white-space:pre-wrap">${safeMessage}</td>
      </tr>
    </table>
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f3f4f6">
      <a href="mailto:${body.email}"
         style="display:inline-block;background:#2E75B6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
        Reply to ${body.name}
      </a>
    </div>
  </div>
  ${body.submissionId ? `<p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px">Submission ID: ${body.submissionId}</p>` : ''}
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TOPAZ 2.0 Website <noreply@dancetopaz.com>',
      to: [TO_EMAIL],
      subject: 'New Contact Message — TOPAZ 2.0 Website',
      html,
      reply_to: body.email,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[send-contact-notification] Resend error:', text);
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
