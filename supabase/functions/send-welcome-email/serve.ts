import { buildWelcomeHtml, buildWelcomeText } from './templates.ts';
import { sendWelcomeViaProviders } from './mail.ts';

interface WelcomePayload {
  to: string;
  name?: string | null;
}

Deno.serve(async (req: Request) => {
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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  let payload: WelcomePayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const to = (payload.to ?? '').trim();
  const name = (payload.name ?? '').trim();

  if (!to) {
    return new Response(JSON.stringify({ error: 'Missing required field: to' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const htmlBody = buildWelcomeHtml(greeting);
  const textBody = buildWelcomeText(greeting);

  return await sendWelcomeViaProviders(to, htmlBody, textBody);
});
