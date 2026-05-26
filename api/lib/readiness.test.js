import { describe, it, expect } from 'vitest';
import { computeReadiness } from './readiness.js';

const baseAnswers = {
  q1: '2', q2: '2', q3: '2', q4: '2', q5: '2', q6: '2',
  q7: 'interested', q8: 'brand', q9: '30-80', q10: '4-6',
};

describe('computeReadiness', () => {
  it('sums Q1-Q6 into the score', () => {
    const r = computeReadiness({ ...baseAnswers, q1: '0', q2: '1', q3: '2', q4: '0', q5: '1', q6: '2' });
    expect(r.score).toBe(6);
  });

  it('returns AI-Ready for score >= 9', () => {
    expect(computeReadiness(baseAnswers).band).toBe('AI-Ready');
  });

  it('returns Building for score 5-8', () => {
    const r = computeReadiness({ ...baseAnswers, q1: '1', q2: '1', q3: '1', q4: '1', q5: '1', q6: '1' });
    expect(r.band).toBe('Building');
  });

  it('returns Foundation for score <= 4', () => {
    const r = computeReadiness({ ...baseAnswers, q1: '0', q2: '0', q3: '0', q4: '0', q5: '0', q6: '0' });
    expect(r.band).toBe('Foundation');
  });

  it('selects top 3 lowest-scoring observations', () => {
    const r = computeReadiness({ ...baseAnswers, q1: '0', q2: '0', q3: '0', q4: '2', q5: '2', q6: '2' });
    expect(r.observations).toHaveLength(3);
    expect(r.observations[0].q).toBe('q1');
    expect(r.observations[1].q).toBe('q2');
    expect(r.observations[2].q).toBe('q3');
  });

  it('returns the "Strong shape" observations when all six score 2', () => {
    const r = computeReadiness(baseAnswers);
    expect(r.observations).toHaveLength(3);
    expect(r.observations[0].text).toMatch(/top ~10%/);
  });

  it('classifies as Urgent when band>=Building, revenue>=30M, channels>=2-3', () => {
    const r = computeReadiness({ ...baseAnswers, q9: '80-200', q10: '4-6' });
    expect(r.tier).toBe('Urgent');
  });

  it('classifies as Nurture when revenue is under 10M', () => {
    const r = computeReadiness({ ...baseAnswers, q9: 'u10' });
    expect(r.tier).toBe('Nurture');
  });

  it('classifies as Standard otherwise', () => {
    const r = computeReadiness({ ...baseAnswers, q9: '10-30', q10: '1' });
    expect(r.tier).toBe('Standard');
  });
});
