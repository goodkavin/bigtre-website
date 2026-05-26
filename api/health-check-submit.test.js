import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

const { appendLeadMock } = vi.hoisted(() => ({ appendLeadMock: vi.fn() }));
vi.mock('./lib/sheets.js', () => ({ appendLead: appendLeadMock }));

const { verifyTurnstileMock } = vi.hoisted(() => ({ verifyTurnstileMock: vi.fn() }));
vi.mock('./lib/turnstile.js', () => ({ verifyTurnstile: verifyTurnstileMock }));

import handler from './health-check-submit.js';

const validBody = {
  answers: { q1: '0', q2: '0', q3: '0', q4: '0', q5: '0', q6: '0', q7: 'interested', q8: 'brand', q9: '30-80', q10: '4-6' },
  name: 'Pat',
  email: 'pat@yvis.co.th',
  company: 'YVIS',
  notes: '',
  consent: true,
  turnstileToken: 'token',
};

function makeReqRes(method = 'POST', body = validBody) {
  const req = { method, body, headers: { 'x-forwarded-for': '1.2.3.4' } };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json: vi.fn(),
    setHeader: vi.fn(),
    end: vi.fn(),
  };
  return { req, res };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = 'test';
  process.env.LEADS_TO_EMAIL = 'leads@bigtre.business';
  process.env.LEADS_FROM_EMAIL = 'leads@bigtre.business';
  process.env.ROADMAP_FROM_EMAIL = 'Big Tre <hello@bigtre.business>';
  verifyTurnstileMock.mockResolvedValue(true);
  sendMock.mockResolvedValue({ id: 'email-id' });
  appendLeadMock.mockResolvedValue();
});

describe('health-check-submit handler', () => {
  it('rejects non-POST requests with 405', async () => {
    const { req, res } = makeReqRes('GET');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects invalid input with 400', async () => {
    const { req, res } = makeReqRes('POST', { ...validBody, email: 'bad' });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects when Turnstile fails with 400', async () => {
    verifyTurnstileMock.mockResolvedValueOnce(false);
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('sends both emails on success', async () => {
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);
    const calls = sendMock.mock.calls.map((c) => c[0]);
    expect(calls.find((c) => c.to === 'pat@yvis.co.th')).toBeTruthy();
    expect(calls.find((c) => c.to === 'leads@bigtre.business')).toBeTruthy();
  });

  it('writes a row to the sheet on success', async () => {
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(appendLeadMock).toHaveBeenCalledOnce();
    const row = appendLeadMock.mock.calls[0][0];
    expect(row.name).toBe('Pat');
    expect(row.email).toBe('pat@yvis.co.th');
    expect(row.band).toBe('Foundation');
  });

  it('still returns 200 even if Sheet append fails', async () => {
    appendLeadMock.mockRejectedValueOnce(new Error('quota exceeded'));
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('returns 500 if email sending fails', async () => {
    sendMock.mockRejectedValueOnce(new Error('resend down'));
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });
});
