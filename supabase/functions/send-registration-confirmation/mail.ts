const COMPETITION_DATE = 'August 22, 2026';
const COMPETITION_LOCATION = '415 1st Ave, Seaside, OR 97138 (Seaside Convention Center)';
const ZELLE_PAYEE = 'topaz2.0@yahoo.com';
const CASH_MAILING_ADDRESS = 'PO BOX 131, BANKS OR 97106';

export type MailContext = {
  contestant_name: string;
  category: string;
  group_size: string;
  paymentTypeLabel: string;
  paymentMethodResolved: string;
  studio_name?: string;
  teacher_name?: string;
  routine_name?: string;
  song_title?: string;
  artist_name?: string;
  musicNote: string;
  feeFormatted: string;
};

export function buildRegistrationBodies(ctx: MailContext): { html: string; text: string } {
  const {
    contestant_name,
    category,
    group_size,
    paymentTypeLabel,
    paymentMethodResolved,
    studio_name,
    teacher_name,
    routine_name,
    song_title,
    artist_name,
    musicNote,
    feeFormatted,
  } = ctx;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>TOPAZ 2.0 Registration Confirmation</title><style>body{font-family:Arial,sans-serif;background:#f5f7fa;margin:0;padding:0;color:#222}.wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)}.header{background:#1F4E78;padding:36px 40px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;letter-spacing:1px}.header p{color:#93c5fd;margin:8px 0 0;font-size:14px}.body{padding:36px 40px}.highlight{background:#eff6ff;border-left:4px solid #2E75B6;padding:16px 20px;border-radius:6px;margin:24px 0}.detail-row{display:flex;padding:10px 0;border-bottom:1px solid #f0f0f0}.detail-row:last-child{border-bottom:none}.detail-label{width:160px;color:#6b7280;font-size:14px;flex-shrink:0}.detail-value{font-weight:600;font-size:14px}.fee{font-size:24px;font-weight:800;color:#2E75B6}.note{background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px 20px;margin:24px 0;font-size:14px}.footer{background:#f9fafb;padding:24px 40px;text-align:center;font-size:12px;color:#9ca3af}.footer a{color:#2E75B6;text-decoration:none}</style></head><body><div class="wrapper"><div class="header"><h1>TOPAZ 2.0</h1><p>Registration Confirmation</p></div><div class="body"><p style="font-size:16px">Hi <strong>${contestant_name}</strong>,</p><p>Your registration for <strong>The Return of TOPAZ 2.0</strong> has been received! Here is a summary of your entry.</p><div class="highlight"><div class="detail-row"><span class="detail-label">Dancer / Entry</span><span class="detail-value">${contestant_name}</span></div> ${studio_name ? `<div class="detail-row"><span class="detail-label">Studio</span><span class="detail-value">${studio_name}</span></div>` : ''} ${teacher_name ? `<div class="detail-row"><span class="detail-label">Teacher</span><span class="detail-value">${teacher_name}</span></div>` : ''} <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${category}</span></div><div class="detail-row"><span class="detail-label">Entry Type</span><span class="detail-value">${group_size}</span></div><div class="detail-row"><span class="detail-label">Payment type</span><span class="detail-value">${paymentTypeLabel}</span></div> ${paymentMethodResolved ? `<div class="detail-row"><span class="detail-label">Payment method</span><span class="detail-value">${paymentMethodResolved}</span></div>` : ''} ${routine_name ? `<div class="detail-row"><span class="detail-label">Routine Name</span><span class="detail-value">${routine_name}</span></div>` : ''} ${song_title ? `<div class="detail-row"><span class="detail-label">Song</span><span class="detail-value">${song_title}${artist_name ? ' — ' + artist_name : ''}</span></div>` : ''} </div><div style="background:#f5f3ff;border-left:4px solid #6D1ED4;padding:16px;margin:20px 0;border-radius:4px;"><strong style="font-size:16px;">Payment required</strong><br/><br/><strong>Zelle:</strong> Pay to <strong style="font-size:18px;">${ZELLE_PAYEE}</strong><br/> Include your dancer name and routine name in the memo.<br/><br/><strong>Cash:</strong> Bring payment to the event or mail to <strong>TOPAZ 2.0</strong>, ${CASH_MAILING_ADDRESS}.<br/><br/> ${paymentMethodResolved ? `<span style="color:#374151;">You selected: <strong>${paymentMethodResolved}</strong>.</span><br/><br/>` : ''} Amount due: <strong>${feeFormatted}</strong><br/> Memo (Zelle): <strong>${contestant_name} — ${routine_name ?? '—'}</strong><br/><br/><em style="color:#6b7280;">Your registration is not confirmed until payment is received.</em></div><p>Entry fee: <span class="fee">${feeFormatted}</span></p><p style="font-size:13px;color:#6b7280;">Solo $100 &bull; Duo $80/person &bull; Trio $70/person &bull; Group/Production $60/person</p><div class="note"><strong>Music Reminder:</strong> ${musicNote}<br/>Each competition number requires a separate USB. TOPAZ 2.0 is not responsible for damaged or lost USBs.</div><h3 style="color:#1F4E78;">Competition Details</h3><p><strong>Date:</strong> ${COMPETITION_DATE}</p><p><strong>Location:</strong> ${COMPETITION_LOCATION}</p><p style="margin-top:28px;font-size:14px;color:#6b7280;">If you have questions or need to make changes before the deadline (July 30, 2026, 12:00 AM), please email <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a> or call <a href="tel:9712994401">971-299-4401</a>.</p></div><div class="footer">&copy; 2026 TOPAZ 2.0 LLC &bull; <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a></div></div></body></html>`;

  const text = `TOPAZ 2.0 — Registration Confirmation

Hi ${contestant_name},

Your registration for The Return of TOPAZ 2.0 has been received.

Entry Summary:
- Dancer/Entry: ${contestant_name}
${studio_name ? `- Studio: ${studio_name}\n` : ''}- Category: ${category}
- Entry Type: ${group_size}
${routine_name ? `- Routine: ${routine_name}\n` : ''}${song_title ? `- Song: ${song_title}${artist_name ? ' — ' + artist_name : ''}\n` : ''}- Payment type: ${paymentTypeLabel}
${paymentMethodResolved ? `- Payment method: ${paymentMethodResolved}\n` : ''}Entry Fee: ${feeFormatted}

Payment — Zelle: Pay to ${ZELLE_PAYEE}; include dancer and routine in the memo. Cash: bring to the event or mail to TOPAZ 2.0, ${CASH_MAILING_ADDRESS}.${paymentMethodResolved ? ` You selected: ${paymentMethodResolved}.` : ''} Amount due: ${feeFormatted}. Zelle memo: ${contestant_name} — ${routine_name ?? '—'}. Your registration is not confirmed until payment is received.

Music: ${musicNote}

Competition Date: ${COMPETITION_DATE}
Location: ${COMPETITION_LOCATION}

Questions? Email topaz2.0@yahoo.com or call 971-299-4401.
Registration deadline: July 30, 2026, 12:00 AM. No exceptions.

— TOPAZ 2.0 LLC`;

  return { html, text };
}
