import { describe, it, expect } from 'vitest';
import { renderRoadmap } from './roadmap.js';

const baseInput = {
  name: 'Khun Pat',
  company: 'YVIS',
  band: 'Foundation',
  observations: [
    { q: 'q1', score: 0, text: 'Getting a basic answer takes days.' },
    { q: 'q3', score: 0, text: 'Profit per channel is invisible.' },
  ],
  answers: { q8: 'brand', q9: '80-200', q10: '4-6', q7: 'interested' },
};

describe('renderRoadmap', () => {
  it('includes the company name in the heading', () => {
    const html = renderRoadmap(baseInput);
    expect(html).toContain('YVIS');
  });

  it('includes all observations verbatim', () => {
    const html = renderRoadmap(baseInput);
    baseInput.observations.forEach((o) => expect(html).toContain(o.text));
  });

  it('shows the Foundation 3-step roadmap when band is Foundation', () => {
    const html = renderRoadmap(baseInput);
    expect(html).toContain('Integrate your sources of truth');
    expect(html).toContain('Make the numbers trustworthy');
    expect(html).toContain('One-screen view, team self-serves');
  });

  it('shows the Building 3-step roadmap when band is Building', () => {
    const html = renderRoadmap({ ...baseInput, band: 'Building' });
    expect(html).toContain('Close your top 2–3 specific gaps');
    expect(html).toContain('Make it self-serving');
    expect(html).toContain('Deploy your first AI use case');
  });

  it('shows the AI-Ready 3-step roadmap when band is AI-Ready', () => {
    const html = renderRoadmap({ ...baseInput, band: 'AI-Ready' });
    expect(html).toContain('Pick the right first AI use case');
    expect(html).toContain('Deploy and tune on your data');
    expect(html).toContain('Compound');
  });

  it('references YVIS as anchor when business type is brand', () => {
    const html = renderRoadmap({ ...baseInput, answers: { ...baseInput.answers, q8: 'brand' } });
    expect(html).toContain('YVIS');
  });

  it('references Dailypal as anchor when business type is distributor', () => {
    const html = renderRoadmap({ ...baseInput, answers: { ...baseInput.answers, q8: 'distributor' } });
    expect(html).toContain('Dailypal');
  });

  it('includes a CTA link to the calendar', () => {
    const html = renderRoadmap(baseInput);
    expect(html).toMatch(/href="[^"]*cal/i);
  });

  it('renders inline styles only (no <link> or external CSS)', () => {
    const html = renderRoadmap(baseInput);
    expect(html).not.toMatch(/<link/i);
    expect(html).not.toMatch(/href="[^"]*\.css/i);
  });
});
