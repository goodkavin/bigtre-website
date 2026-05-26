const ROADMAPS = {
  Foundation: {
    intro: (company, channels, revenue) =>
      `You're running ${channels} sales channels with revenue around ${revenue}. Right now, the basics — knowing how the business performed, where the margin is, what your campaigns cost — are slow, fragmented, or only in your head. That's not unusual. It's where most of our anchor clients started. But it's also why generic AI tools haven't worked: there's no clean, integrated foundation for them to stand on.`,
    steps: [
      { name: 'Integrate your sources of truth', weeks: '1–3', body: 'Connect your marketplaces, POS, accounting into one source. Stop the cross-system stitching. This is the layer everything else stands on.' },
      { name: 'Make the numbers trustworthy', weeks: '3–6', body: 'Close the gap between systems and bank. Every channel, fee, and discount reconciled and tied to books. You\'ll be able to answer "how did we do" in minutes, not days.' },
      { name: 'One-screen view, team self-serves', weeks: '6–10', body: 'Profit per channel, margin per product, campaign ROI — usable without you. The owner dependency breaks. Foundation is AI-ready.' },
    ],
    after: 'With the foundation in place, you have the option to layer in AI agents — automated anomaly flagging, weekly performance reviews, ask-your-numbers chat. That\'s a separate conversation, after the foundation is sound.',
  },
  Building: {
    intro: (company, channels, revenue) =>
      `You've built real pieces — some questions get answered, some numbers reconcile, you have systems in place. But specific gaps are blocking AI from giving you real leverage. The good news: each one is fixable in weeks, not years, and we focus only on the ones that pay back fastest for ${company}.`,
    steps: [
      { name: 'Close your top 2–3 specific gaps', weeks: '1–4', body: 'Targeted Implement on the gaps from your answers — not a full rebuild. Work focused exactly where you said it hurts.' },
      { name: 'Make it self-serving', weeks: '4–7', body: 'One-screen views, on-demand answers, ask-your-numbers chat where it earns its keep.' },
      { name: 'Deploy your first AI use case', weeks: '7–10', body: 'Pick one agent that returns real money — anomaly flagging, campaign post-mortem, or weekly board-pack. Deploy and tune on your real data.' },
    ],
    after: 'Ongoing partner relationship as the business grows and adds channels. New AI agents added as you find use cases that justify them. No vendor lock-in: everything lives in your data, your systems.',
  },
  'AI-Ready': {
    intro: (company, channels, revenue) =>
      `You're in the top tier of businesses your size we've talked to — your team can self-serve, your books reconcile, your channel P&L is visible. That's rare. It means the question for ${company} isn't "are we ready" but "which AI use case earns the most first."`,
    steps: [
      { name: 'Pick the right first AI use case', weeks: '1 (working session)', body: 'A focused working session: we look at your real data, your decisions, and your team\'s bandwidth. We identify the one AI agent that pays back fastest.' },
      { name: 'Deploy and tune on your data', weeks: '2–6', body: 'Build, deploy, integrate with your existing systems. The agent runs against your actual rules. You validate the output until it\'s trustworthy.' },
      { name: 'Compound — layer additional agents', weeks: 'Ongoing', body: 'With the first agent shipped and trusted, additional ones cost a fraction to add. The platform compounds. Most of our anchor clients add 2–3 agents in the first 6 months.' },
    ],
    after: 'You\'re a strong candidate for our Case F — AI CFO for SMBs — early access program. We can talk about it on the call.',
  },
};

const REVENUE_LABELS = {
  'u10': 'under 10M THB', '10-30': '10–30M THB',
  '30-80': '30–80M THB', '80-200': '80–200M THB', '200+': '200M+ THB',
};

const ANCHOR_BY_TYPE = {
  brand: 'YVIS, a Thai fashion jewelry brand running on similar multi-channel infrastructure',
  distributor: 'Dailypal, an imported-beauty distributor with exclusive Thailand rights to Oddtype and CLE Cosmetics',
  importer: 'Dailypal, an imported-beauty distributor we work with',
  retailer: 'YVIS, a multi-channel retailer + brand we work with',
  other: 'our anchor clients YVIS (jewelry brand) and Dailypal (beauty distributor)',
};

export function renderRoadmap({ name, company, band, observations, answers }) {
  const tmpl = ROADMAPS[band];
  const channels = answers.q10;
  const revenue = REVENUE_LABELS[answers.q9] || 'your range';
  const anchor = ANCHOR_BY_TYPE[answers.q8] || ANCHOR_BY_TYPE.other;
  const calendarUrl = process.env.CALENDAR_URL || 'https://cal.com/bigtre/health-check-followup';

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Your AI Readiness Roadmap</title></head>
<body style="margin:0;padding:0;background:#F2EEE5;font-family:-apple-system,BlinkMacSystemFont,'Geist','Segoe UI',sans-serif;color:#14110D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2EEE5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FBF8F1;border-radius:12px;padding:40px;">
        <tr><td>
          <div style="font-size:11px;color:#0E5C3B;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">Your AI Readiness Roadmap</div>
          <h1 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:30px;font-weight:600;line-height:1.15;letter-spacing:-0.02em;margin:0 0 8px;">${escapeHtml(company)} — ${band}</h1>
          <p style="font-size:13px;color:#6B645A;margin:0 0 32px;">Personalized from your answers · ${new Date().toISOString().slice(0,10)}</p>

          <h2 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:20px;font-weight:500;letter-spacing:-0.01em;margin:0 0 12px;">Where you are now</h2>
          <p style="font-size:15px;line-height:1.6;color:#2A2620;margin:0 0 16px;">${tmpl.intro(escapeHtml(company), channels, revenue)}</p>
          ${observations.map(o => `<p style="font-size:14px;line-height:1.55;color:#2A2620;margin:0 0 12px;padding-left:14px;border-left:2px solid #0E5C3B;">${escapeHtml(o.text)}</p>`).join('')}

          <h2 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:20px;font-weight:500;letter-spacing:-0.01em;margin:32px 0 16px;">What Big Tre will do for you</h2>
          ${tmpl.steps.map((step, i) => `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background:#F2EEE5;border-radius:8px;">
              <tr><td style="padding:18px 20px;">
                <div style="font-size:11px;color:#0E5C3B;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">Step ${i+1} · ${step.weeks}</div>
                <div style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:17px;font-weight:600;margin-bottom:6px;">${step.name}</div>
                <div style="font-size:14px;line-height:1.55;color:#2A2620;">${step.body}</div>
              </td></tr>
            </table>`).join('')}

          <h2 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:20px;font-weight:500;letter-spacing:-0.01em;margin:32px 0 12px;">What comes after</h2>
          <p style="font-size:15px;line-height:1.6;color:#2A2620;margin:0 0 24px;">${tmpl.after}</p>

          <h2 style="font-family:'Bricolage Grotesque',Georgia,serif;font-size:20px;font-weight:500;letter-spacing:-0.01em;margin:0 0 12px;">Why Big Tre</h2>
          <p style="font-size:15px;line-height:1.6;color:#2A2620;margin:0 0 32px;">Four Thai founders with operator backgrounds — Thai ERP (MineERP), Accenture enterprise delivery, Silicon Valley engineering, and native Thai SMB operator experience. We've delivered exactly this for ${anchor}.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${calendarUrl}" style="display:inline-block;background:#0E5C3B;color:#FBF8F1;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;">Book a 30-min founder call →</a>
            </td></tr>
          </table>

          <p style="font-size:12px;color:#6B645A;margin:24px 0 0;border-top:1px solid #1411100D;padding-top:20px;">
            Hi ${escapeHtml(name)} — this roadmap was generated from your 10 answers on the AI Readiness Health Check. To save as a PDF: in most email clients, use Print → Save as PDF. Reply to this email if you'd like to talk before the call.
          </p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:#6B645A;margin:20px 0 0;">Big Tre · bigtre.business · Bangkok, Thailand</p>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
