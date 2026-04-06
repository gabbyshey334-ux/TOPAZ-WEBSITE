import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail =
      Deno.env.get('REGISTRATION_FROM_EMAIL') ?? 'Topaz 2.0 <onboarding@resend.dev>';

    const { registration_id } = (await req.json()) as { registration_id?: string };
    if (!registration_id) {
      return new Response(JSON.stringify({ error: 'registration_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: row, error } = await admin
      .from('registrations')
      .select(
        'id, created_at, contestant_name, email, category, total_fee, payment_method, group_size'
      )
      .eq('id', registration_id)
      .maybeSingle();

    if (error || !row) {
      return new Response(JSON.stringify({ error: 'Registration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const created = new Date(row.created_at).getTime();
    if (Date.now() - created > 15 * 60 * 1000) {
      return new Response(JSON.stringify({ error: 'Confirmation window expired' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!resendKey) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'no RESEND_API_KEY' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fee = Number(row.total_fee).toFixed(2);
    const html = `
      <p>Hello,</p>
      <p>Thank you for registering for <strong>TOPAZ 2.0</strong>.</p>
      <ul>
        <li><strong>Contestant:</strong> ${escapeHtml(row.contestant_name)}</li>
        <li><strong>Category:</strong> ${escapeHtml(row.category)}</li>
        <li><strong>Group size:</strong> ${escapeHtml(row.group_size)}</li>
        <li><strong>Entry fee total:</strong> $${fee}</li>
        <li><strong>Payment method:</strong> ${escapeHtml(row.payment_method)}</li>
      </ul>
      <p><strong>Next steps:</strong> Mail your payment (check or money order, payable to Topaz Productions) to:<br/>
      TOPAZ 2.0, PO BOX 131, BANKS OR 97106</p>
      <p><strong>Music:</strong> Remember to bring a separate USB for each competition number, turned in one hour before your competition time.</p>
      <p>— Topaz 2.0</p>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [row.email],
        reply_to: 'Topaz2.0@yahoo.com',
        subject: `TOPAZ 2.0 registration received — ${row.contestant_name}`,
        html,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error('Resend error', res.status, t);
      return new Response(JSON.stringify({ error: 'Email send failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
