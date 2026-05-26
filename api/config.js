export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(`window.BIGTRE_CONFIG = ${JSON.stringify({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
  })};`);
}
