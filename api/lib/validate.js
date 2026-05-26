const SCORED = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
const SCORED_VALUES = ['0', '1', '2'];
const Q7_VALUES = ['working', 'stalled', 'interested', 'skeptical'];
const Q8_VALUES = ['brand', 'distributor', 'importer', 'retailer', 'other'];
const Q9_VALUES = ['u10', '10-30', '30-80', '80-200', '200+'];
const Q10_VALUES = ['1', '2-3', '4-6', '7+'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSubmission(body) {
  if (!body || typeof body !== 'object') return fail('body must be an object');

  const { answers, name, email, company, notes, consent, turnstileToken } = body;

  if (!consent) return fail('consent is required');
  if (!turnstileToken || typeof turnstileToken !== 'string') return fail('turnstile token missing');

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) return fail('name is required');

  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) return fail('email is invalid');

  const trimmedCompany = typeof company === 'string' ? company.trim() : '';
  if (!trimmedCompany) return fail('company is required');

  if (!answers || typeof answers !== 'object') return fail('answers is required');

  for (const q of SCORED) {
    if (!SCORED_VALUES.includes(answers[q])) return fail(`${q} is missing or out of range`);
  }
  if (!Q7_VALUES.includes(answers.q7)) return fail('q7 is invalid');
  if (!Q8_VALUES.includes(answers.q8)) return fail('q8 is invalid');
  if (!Q9_VALUES.includes(answers.q9)) return fail('q9 is invalid');
  if (!Q10_VALUES.includes(answers.q10)) return fail('q10 is invalid');

  const trimmedNotes = (typeof notes === 'string' ? notes.trim() : '').slice(0, 1000);

  return {
    ok: true,
    data: {
      answers,
      name: trimmedName,
      email: email.trim().toLowerCase(),
      company: trimmedCompany,
      notes: trimmedNotes,
    },
  };
}

function fail(error) {
  return { ok: false, error };
}
