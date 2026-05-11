import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildRegistrationBodies } from './mail.ts';
import { sendViaBrevo } from './providers.ts';

interface RegistrationEmailPayload {
  registrationId?: string;
  to?: string;
  contestant_name?: string;
  category?: string;
  group_size?: string;
  total_fee?: number;
  studio_name?: string;
  teacher_name?: string;
  routine_name?: string;
  song_title?: string;
  artist_name?: string;
  music_delivery_method?: string;
  payment_type?: string;
  payment_method?: string;
}

function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key);
}

async function markEmailSent(registrationId: string) {
  const client = getServiceClient();
  if (!client) return;
  await client
    .from('registrations')
    .update({
      confirmation_email_sent_at: new Date().toISOString(),
      confirmation_email_error: null,
    })
    .eq('id', registrationId);
}

async function markEmailFailed(registrationId: string, err: string) {
  const client = getServiceClient();
  if (!client) return;
  await client
    .from('registrations')
    .update({ confirmation_email_error: err.slice(0, 500) })
    .eq('id', registrationId);
}

export async function handleRegistrationRequest(req: Request): Promise<Response> {
  const jsonHdr = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHdr });
  }

  let payload: RegistrationEmailPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: jsonHdr });
  }

  let {
    to,
    contestant_name,
    category,
    group_size,
    total_fee,
    studio_name,
    teacher_name,
    routine_name,
    song_title,
    artist_name,
    music_delivery_method,
    payment_type,
    payment_method,
  } = payload;
  const registrationId = payload.registrationId;

  if (registrationId && (!to || !contestant_name)) {
    const client = getServiceClient();
    if (!client) {
      return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }), {
        status: 500,
        headers: jsonHdr,
      });
    }
    const { data: reg, error: regErr } = await client
      .from('registrations')
      .select(
        'email, contestant_name, category, group_size, total_fee, payment_type, payment_method, studio_name, teacher_name, routine_name, song_title, artist_name, music_delivery_method',
      )
      .eq('id', registrationId)
      .single();
    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: `Registration not found: ${regErr?.message}` }), {
        status: 404,
        headers: jsonHdr,
      });
    }
    to = reg.email as string;
    contestant_name = reg.contestant_name as string;
    category = reg.category as string;
    group_size = reg.group_size as string;
    total_fee = Number(reg.total_fee);
    payment_type = (reg.payment_type as string | null) ?? 'individual';
    studio_name = (reg.studio_name as string | null) ?? undefined;
    teacher_name = (reg.teacher_name as string | null) ?? undefined;
    routine_name = (reg.routine_name as string | null) ?? undefined;
    song_title = (reg.song_title as string | null) ?? undefined;
    artist_name = (reg.artist_name as string | null) ?? undefined;
    music_delivery_method = (reg.music_delivery_method as string | null) ?? undefined;
    payment_method = (reg.payment_method as string | null) ?? undefined;
  }

  if (!to || !contestant_name) {
    return new Response(JSON.stringify({ error: 'Missing required fields: to, contestant_name' }), {
      status: 400,
      headers: jsonHdr,
    });
  }

  const paymentTypeResolved = payment_type === 'group_full' ? 'group_full' : 'individual';
  const paymentTypeLabel =
    paymentTypeResolved === 'group_full'
      ? 'Full group total (entire routine fee on this registration)'
      : 'Individual share (per dancer registering separately)';
  const ADMIN_NOTIFICATION_BCC = 'topaz2.0@dancetopaz.com';
  const paymentMethodResolved = (payment_method ?? '').trim();
  const musicNote = music_delivery_method === 'upload'
    ? 'Your music file has been uploaded digitally.'
    : 'Please bring your music on a USB drive and turn it in to the front desk at least 1 hour before your performance time.';
  const feeFormatted = `$${Number(total_fee).toFixed(2)}`;

  const { html: htmlBody, text: textBody } = buildRegistrationBodies({
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
  });

  const bccForAdmin =
    to.trim().toLowerCase() === ADMIN_NOTIFICATION_BCC.toLowerCase()
      ? undefined
      : [ADMIN_NOTIFICATION_BCC];

  const br = await sendViaBrevo(to, contestant_name, htmlBody, textBody, bccForAdmin);
  if (br.ok) {
    console.log('[send-registration-confirmation] Brevo:', br.id);
    if (registrationId) await markEmailSent(registrationId);
    return new Response(JSON.stringify({ success: true, id: br.id }), { status: 200, headers: jsonHdr });
  }
  console.error('[send-registration-confirmation]', br.detail);
  if (registrationId) await markEmailFailed(registrationId, br.detail.slice(0, 500));
  return new Response(JSON.stringify({ error: 'Email delivery failed', details: br.detail }), {
    status: 502,
    headers: jsonHdr,
  });
}
