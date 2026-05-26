const REVENUE_LABELS = {
  'u10': 'under 10M THB', '10-30': '10–30M THB',
  '30-80': '30–80M THB', '80-200': '80–200M THB', '200+': '200M+ THB',
};

const Q_TEXT = {
  q1: 'Can answer "how did we do last month?" in under 5 minutes?',
  q2: 'How much of the business is only in your head?',
  q3: 'Can see profit per channel after fees/discounts/shipping?',
  q4: 'After a campaign, do you know margin cost?',
  q5: 'Does reported revenue match bank deposits?',
  q6: 'How many places do you pull numbers from?',
  q7: 'Tried AI in your business yet?',
  q8: 'Business type',
  q9: 'Annual revenue',
  q10: 'Number of sales channels',
};

const SCORED_LABELS = {
  q1: { '2': 'Yes', '1': 'With effort', '0': 'No, takes days' },
  q2: { '2': 'Very little', '1': 'Some of it', '0': 'Most of it' },
  q3: { '2': 'Yes', '1': 'With effort', '0': 'No' },
  q4: { '2': 'Yes', '1': 'Roughly', '0': 'No, just look at sales' },
  q5: { '2': 'Yes, reconcile', '1': "There's always a gap", '0': "No / don't check" },
  q6: { '2': '1–2', '1': '3–4', '0': '5+' },
};

const Q7_LABELS = {
  working: "Yes, and it's working",
  stalled: "Yes, but it didn't stick",
  interested: 'Not yet, but interested',
  skeptical: 'Not yet, and skeptical',
};

const Q7_TONE = {
  working: "Lead with \"let's compare notes\" — they're further along than most.",
  stalled: "Lead with \"we hear this constantly\" — they tried AI before and it didn't stick. Acknowledge the pain.",
  interested: 'Lead with the roadmap content. No pre-frame needed.',
  skeptical: 'Lead with what YVIS and Dailypal actually got — concrete outcomes, no AI hype.',
};

const Q8_LABELS = {
  brand: 'Multi-channel brand', distributor: 'Distributor / wholesaler',
  importer: 'Importer (exclusive rights)', retailer: 'Retailer (stores + online)', other: 'Other',
};

const TIER_ACTIONS = {
  Urgent: 'Same-day personal email; offer call within 48h.',
  Standard: 'Personal email within 48h.',
  Nurture: 'Auto-handled — no founder action needed. Roadmap sent; added to nurture list.',
};

export function renderLeadAlert(s) {
  const rows = [];
  for (let i = 1; i <= 6; i++) {
    const k = `q${i}`;
    rows.push(`<tr><td style="padding:6px 12px 6px 0;color:#6B645A;font-size:13px;vertical-align:top;width:30%;">Q${i}. ${Q_TEXT[k]}</td><td style="padding:6px 0;font-size:14px;"><strong>${escapeHtml(SCORED_LABELS[k][s.answers[k]])}</strong> <span style="color:#6B645A;">(score ${s.answers[k]})</span></td></tr>`);
  }
  rows.push(`<tr><td style="padding:6px 12px 6px 0;color:#6B645A;font-size:13px;vertical-align:top;">Q7. ${Q_TEXT.q7}</td><td style="padding:6px 0;font-size:14px;"><strong>${escapeHtml(Q7_LABELS[s.answers.q7])}</strong></td></tr>`);
  rows.push(`<tr><td style="padding:6px 12px 6px 0;color:#6B645A;font-size:13px;vertical-align:top;">Q8. ${Q_TEXT.q8}</td><td style="padding:6px 0;font-size:14px;"><strong>${Q8_LABELS[s.answers.q8]}</strong></td></tr>`);
  rows.push(`<tr><td style="padding:6px 12px 6px 0;color:#6B645A;font-size:13px;vertical-align:top;">Q9. ${Q_TEXT.q9}</td><td style="padding:6px 0;font-size:14px;"><strong>${REVENUE_LABELS[s.answers.q9]}</strong></td></tr>`);
  rows.push(`<tr><td style="padding:6px 12px 6px 0;color:#6B645A;font-size:13px;vertical-align:top;">Q10. ${Q_TEXT.q10}</td><td style="padding:6px 0;font-size:14px;"><strong>${s.answers.q10}</strong></td></tr>`);

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F2EEE5;font-family:-apple-system,BlinkMacSystemFont,'Geist','Segoe UI',sans-serif;color:#14110D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:30px 20px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FBF8F1;border-radius:10px;padding:32px;">
        <tr><td>
          <div style="font-size:11px;color:#0E5C3B;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">New AI Readiness Lead</div>
          <h1 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:24px;font-weight:600;margin:0 0 4px;">${escapeHtml(s.company)} · <span style="color:#0E5C3B;">${s.tier}</span></h1>
          <p style="font-size:13px;color:#6B645A;margin:0 0 24px;">Band: <strong>${s.band}</strong> · Score: <strong>${s.score} / 12</strong> · ${s.created_at}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="padding:6px 0;font-size:14px;"><strong>Contact:</strong> ${escapeHtml(s.name)} &lt;<a href="mailto:${escapeHtml(s.email)}" style="color:#0E5C3B;">${escapeHtml(s.email)}</a>&gt;</td></tr>
            ${s.notes ? `<tr><td style="padding:6px 0;font-size:14px;"><strong>They told us:</strong> "${escapeHtml(s.notes)}"</td></tr>` : ''}
          </table>

          <div style="background:#D6E6DC;padding:14px 16px;border-radius:8px;margin-bottom:20px;font-size:14px;line-height:1.5;">
            <strong>Suggested next action:</strong> ${TIER_ACTIONS[s.tier]}<br>
            <strong>Tone hint (from Q7):</strong> ${escapeHtml(Q7_TONE[s.answers.q7])}
          </div>

          <h2 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:16px;font-weight:600;margin:24px 0 8px;">Full responses</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1411100D;">
            ${rows.join('')}
          </table>

          <p style="font-size:11px;color:#6B645A;margin:24px 0 0;border-top:1px solid #1411100D;padding-top:14px;">Submission ID: ${s.submission_id}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
