import { describe, it, expect, vi, beforeEach } from 'vitest';

const { appendMock } = vi.hoisted(() => ({ appendMock: vi.fn() }));
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn().mockImplementation(() => ({
        getClient: vi.fn().mockResolvedValue({}),
      })),
    },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        values: { append: appendMock },
      },
    }),
  },
}));

import { appendLead } from './sheets.js';

beforeEach(() => {
  appendMock.mockClear();
  process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 = Buffer.from(
    JSON.stringify({ client_email: 'svc@test.iam', private_key: 'key' })
  ).toString('base64');
});

describe('appendLead', () => {
  it('appends a row in the expected column order', async () => {
    appendMock.mockResolvedValueOnce({ data: {} });
    await appendLead({
      submission_id: 'abc',
      created_at: '2026-05-25T10:00:00Z',
      name: 'Pat',
      email: 'pat@x.co',
      company: 'YVIS',
      notes: 'urgent',
      answers: { q1: '0', q2: '1', q3: '2', q4: '2', q5: '2', q6: '2', q7: 'interested', q8: 'brand', q9: '30-80', q10: '4-6' },
      score: 9,
      band: 'AI-Ready',
      tier: 'Urgent',
      utm: { source: 'linkedin', medium: 'organic', campaign: '' },
      user_agent: 'Mozilla/5.0',
      ip_country: 'TH',
    });
    expect(appendMock).toHaveBeenCalledOnce();
    const call = appendMock.mock.calls[0][0];
    expect(call.spreadsheetId).toBe('test-sheet-id');
    expect(call.range).toMatch(/A:.+/);
    const row = call.requestBody.values[0];
    expect(row[0]).toBe('abc');
    expect(row[2]).toBe('Pat');
    expect(row[3]).toBe('pat@x.co');
    expect(row[6]).toBe('0'); // q1
    expect(row[16]).toBe(9); // score
    expect(row[17]).toBe('AI-Ready');
    expect(row[18]).toBe('Urgent');
  });

  it('throws if the sheet ID is not configured', async () => {
    delete process.env.GOOGLE_SHEET_ID;
    await expect(appendLead({ submission_id: 'x' })).rejects.toThrow(/GOOGLE_SHEET_ID/);
  });
});
