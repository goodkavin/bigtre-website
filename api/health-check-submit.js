import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';
import { validateSubmission } from './lib/validate.js';
import { verifyTurnstile } from './lib/turnstile.js';
import { computeReadiness } from './lib/readiness.js';
import { renderRoadmap } from './lib/emails/roadmap.js';
import { renderLeadAlert } from './lib/emails/lead-alert.js';
import { appendLead } from './lib/sheets.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const validation = validateSubmission(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (process.env.TURNSTILE_SECRET_KEY) {
    const turnstileOk = await verifyTurnstile(req.body.turnstileToken, ip);
    if (!turnstileOk) {
      return res.status(400).json({ error: 'turnstile verification failed' });
    }
  }

  const { answers, name, email, company, notes } = validation.data;
  const { score, band, observations, tier } = computeReadiness(answers);

  const submission = {
    submission_id: randomUUID(),
    created_at: new Date().toISOString(),
    name, email, company, notes, answers,
    score, band, tier,
    utm: req.body.utm || {},
    user_agent: req.headers['user-agent'] || '',
    ip_country: req.headers['x-vercel-ip-country'] || '',
  };

  console.log('SUBMISSION_RECEIVED', JSON.stringify(submission));

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await Promise.all([
        resend.emails.send({
          from: process.env.ROADMAP_FROM_EMAIL,
          to: email,
          subject: `Your AI Readiness Roadmap — ${band}`,
          html: renderRoadmap({ name, company, band, observations, answers }),
          replyTo: process.env.LEADS_TO_EMAIL,
        }),
        resend.emails.send({
          from: process.env.LEADS_FROM_EMAIL,
          to: process.env.LEADS_TO_EMAIL,
          subject: `[${tier}] ${company} — AI Readiness lead, band: ${band}`,
          html: renderLeadAlert(submission),
        }),
      ]);
    } catch (err) {
      console.error('SUBMISSION_EMAIL_FAILED', submission.submission_id, err);
    }
  } else {
    console.warn('SUBMISSION_NO_EMAIL_SENT (RESEND_API_KEY missing)', submission.submission_id);
  }

  try {
    await appendLead(submission);
  } catch (err) {
    console.error('lead store write failed (non-fatal)', err);
  }

  return res.status(200).json({ ok: true, band });
}
