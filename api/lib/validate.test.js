import { describe, it, expect } from 'vitest';
import { validateSubmission } from './validate.js';

const valid = {
  answers: { q1: '2', q2: '1', q3: '0', q4: '2', q5: '2', q6: '2', q7: 'interested', q8: 'brand', q9: '30-80', q10: '4-6' },
  name: 'Khun Pat',
  email: 'pat@yvis.co.th',
  company: 'YVIS',
  notes: '',
  consent: true,
  turnstileToken: 'fake-token',
};

describe('validateSubmission', () => {
  it('accepts a valid submission', () => {
    const r = validateSubmission(valid);
    expect(r.ok).toBe(true);
    expect(r.data.email).toBe('pat@yvis.co.th');
  });

  it('rejects missing consent', () => {
    const r = validateSubmission({ ...valid, consent: false });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/consent/i);
  });

  it('rejects invalid email shape', () => {
    const r = validateSubmission({ ...valid, email: 'not-an-email' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/email/i);
  });

  it('rejects empty name', () => {
    const r = validateSubmission({ ...valid, name: '' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/name/i);
  });

  it('rejects empty company', () => {
    const r = validateSubmission({ ...valid, company: '   ' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/company/i);
  });

  it('rejects missing turnstile token', () => {
    const r = validateSubmission({ ...valid, turnstileToken: '' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/turnstile/i);
  });

  it('rejects answers missing a question', () => {
    const broken = { ...valid, answers: { ...valid.answers, q5: undefined } };
    const r = validateSubmission(broken);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/q5/i);
  });

  it('rejects out-of-range scored answer', () => {
    const broken = { ...valid, answers: { ...valid.answers, q1: '5' } };
    const r = validateSubmission(broken);
    expect(r.ok).toBe(false);
  });

  it('trims notes and caps to 1000 chars', () => {
    const r = validateSubmission({ ...valid, notes: '  hello  '.padEnd(2000, 'x') });
    expect(r.ok).toBe(true);
    expect(r.data.notes.length).toBeLessThanOrEqual(1000);
    expect(r.data.notes.startsWith('hello')).toBe(true);
  });
});
