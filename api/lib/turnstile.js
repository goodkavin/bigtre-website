const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.append('remoteip', remoteIp);
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification error', err);
    return false;
  }
}
