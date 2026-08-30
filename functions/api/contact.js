/* POST /api/contact — Cloudflare Pages Function.
 *
 * Required environment:
 *   RESEND_API_KEY   secret, created in the Resend dashboard
 *   CONTACT_TO       destination address (defaults to info@mk313.com)
 *   CONTACT_FROM     sender on a domain verified with Resend
 *
 * Optional:
 *   TURNSTILE_SECRET when set, a Turnstile token is required and verified
 */

const LIMITS = { name: 120, email: 200, company: 160, message: 4000 };
const MIN_FILL_MS = 2500;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function looksLikeEmail(value) {
  return /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/.test(value);
}

async function verifyTurnstile(secret, token, ip) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token || '');
  if (ip) body.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  const data = await res.json().catch(() => ({}));
  return data.success === true;
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Expected a JSON body.' });
  }

  // Honeypot: a real person never fills a field they cannot see.
  if (clean(payload.company, LIMITS.company)) {
    return json(200, { ok: true });
  }

  // Bots submit near-instantly. Accept silently rather than teaching them.
  const elapsed = Number(payload.elapsed);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return json(200, { ok: true });
  }

  const name = clean(payload.name, LIMITS.name);
  const email = clean(payload.email, LIMITS.email);
  const message = clean(payload.message, LIMITS.message);

  const errors = {};
  if (!name) errors.name = 'Please tell us your name.';
  if (!email) errors.email = 'Please add an email address.';
  else if (!looksLikeEmail(email)) errors.email = 'That email address does not look right.';
  if (!message) errors.message = 'Please describe what you need.';
  else if (message.length < 20) errors.message = 'A little more detail would help us reply usefully.';

  if (Object.keys(errors).length) {
    return json(422, { ok: false, errors });
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';

  if (env.TURNSTILE_SECRET) {
    const passed = await verifyTurnstile(env.TURNSTILE_SECRET, payload.token, ip);
    if (!passed) {
      return json(403, { ok: false, error: 'Verification failed. Please try again.' });
    }
  }

  if (!env.RESEND_API_KEY) {
    // Misconfiguration, not the visitor's problem — tell them a channel that works.
    console.error('contact: RESEND_API_KEY is not configured');
    return json(503, { ok: false, error: 'unavailable' });
  }

  const to = env.CONTACT_TO || 'info@mk313.com';
  const from = env.CONTACT_FROM || 'MK313 website <website@mk313.com>';
  const country = request.headers.get('CF-IPCountry') || 'unknown';

  const text = [
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Country: ${country}`,
    '',
    message
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `mk313.com enquiry — ${name}`,
      text
    })
  });

  if (!res.ok) {
    // Log the status only. The body can echo submitted content.
    console.error('contact: delivery failed with status', res.status);
    return json(502, { ok: false, error: 'delivery' });
  }

  return json(200, { ok: true });
}
