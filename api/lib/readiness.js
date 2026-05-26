const OBS = {
  q1: {
    0: "Getting a basic answer about last month takes days. Every decision you're making is on numbers that are already stale.",
    1: "You can get to last month's numbers, but only with effort. That effort is the bottleneck on every decision.",
  },
  q2: {
    0: "Most of how your business actually works lives in your head — pricing rules, supplier deals, the \"why.\" That's the #1 reason AI tools fail at your size: nothing for them to learn from.",
    1: "Real chunks of how the business runs are still only in your head. Each piece that gets out frees the team and gives any AI tool something concrete to work with.",
  },
  q3: {
    0: "You're running multiple channels but can't see profit per channel after fees and discounts. Every SMB owner we've worked with had this exact gap on Day 1 — it's the single biggest blind spot for margin.",
    1: "You can stitch profit-per-channel together with effort, but not on demand. Until it's one click, you're trading off margin without a feedback loop.",
  },
  q4: {
    0: "After a campaign, you see the sales bump but not the margin cost. Every promotion is flying blind on whether it actually paid off.",
    1: "You have a rough sense of campaign margin, but no clean number. Rough is enough to keep going — not enough to optimize.",
  },
  q5: {
    0: "Your reported revenue doesn't reconcile to bank — or isn't being checked. Every number above this in the business is suspect until that's closed.",
    1: "There's a persistent gap between what your system says and what hits the bank. The gap itself is information — fees, discounts, unbooked refunds. Closing it monthly is non-negotiable before AI touches your finances.",
  },
  q6: {
    0: "You're pulling numbers from 5+ places. Every cross-system stitch is human work, every stitch introduces error, and AI on top of that mess inherits the mess.",
    1: "3–4 sources is manageable but fragile. You're spending time stitching when you should be spending it deciding.",
  },
};

const STRONG = [
  "Your team can self-serve, your books reconcile, your channel P&L is visible. You're in the top ~10% of businesses your size we've talked to.",
  "Most of our first conversations are about the basics. With you, we'd skip ahead to which AI agent to deploy first — that's a different (and faster) conversation.",
  "The thing to watch from here: as you add channels or grow 2–3×, the system that works at today's scale usually breaks. Worth a conversation before that happens, not after.",
];

const SCORED_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

export function computeReadiness(answers) {
  const scores = SCORED_KEYS.map((q) => parseInt(answers[q], 10));
  const score = scores.reduce((a, b) => a + b, 0);

  let band;
  if (score >= 9) band = 'AI-Ready';
  else if (score >= 5) band = 'Building';
  else band = 'Foundation';

  let observations;
  if (scores.every((s) => s === 2)) {
    observations = STRONG.map((text) => ({ q: null, score: 2, text }));
  } else {
    const ranked = SCORED_KEYS
      .map((q, i) => ({ q, score: scores[i] }))
      .filter((x) => x.score < 2)
      .sort((a, b) => a.score - b.score);
    observations = ranked.slice(0, 3).map(({ q, score }) => ({
      q,
      score,
      text: OBS[q][score],
    }));
  }

  const tier = computeTier(score, answers);

  return { score, band, observations, tier };
}

function computeTier(score, answers) {
  const goodRev = ['10-30', '30-80', '80-200', '200+'].includes(answers.q9);
  const veryGoodRev = ['30-80', '80-200', '200+'].includes(answers.q9);
  const multiCh = answers.q10 !== '1';

  if (score >= 5 && veryGoodRev && multiCh) return 'Urgent';
  if (goodRev) return 'Standard';
  return 'Nurture';
}
