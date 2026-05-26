import { describe, it, expect } from 'vitest';
import { renderLeadAlert } from './lead-alert.js';

const submission = {
  submission_id: 'abc-123',
  created_at: '2026-05-25T10:00:00Z',
  name: 'Khun Pat',
  email: 'pat@yvis.co.th',
  company: 'YVIS',
  notes: 'We are about to launch on TikTok Shop and need this fixed yesterday.',
  answers: { q1: '0', q2: '0', q3: '0', q4: '1', q5: '1', q6: '0', q7: 'stalled', q8: 'brand', q9: '80-200', q10: '4-6' },
  score: 2,
  band: 'Foundation',
  tier: 'Standard',
};

describe('renderLeadAlert', () => {
  it('includes all profile fields', () => {
    const html = renderLeadAlert(submission);
    expect(html).toContain('Khun Pat');
    expect(html).toContain('pat@yvis.co.th');
    expect(html).toContain('YVIS');
    expect(html).toContain('80–200M THB');
  });

  it('includes all 10 answers in readable form', () => {
    const html = renderLeadAlert(submission);
    expect(html).toMatch(/Q1[:.\s]/);
    expect(html).toMatch(/Q10[:.\s]/);
  });

  it('includes the band and tier', () => {
    const html = renderLeadAlert(submission);
    expect(html).toContain('Foundation');
    expect(html).toContain('Standard');
  });

  it('includes the notes field when present', () => {
    const html = renderLeadAlert(submission);
    expect(html).toContain('TikTok Shop');
  });

  it('includes a tone hint based on Q7', () => {
    const html = renderLeadAlert(submission);
    expect(html).toMatch(/didn&#39;t stick|tried.*before|hear this constantly/i);
  });
});
