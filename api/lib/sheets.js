import { google } from 'googleapis';

const COLUMNS = [
  'submission_id', 'created_at', 'name', 'email', 'company', 'notes',
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
  'score', 'band', 'tier',
  'utm_source', 'utm_medium', 'utm_campaign',
  'user_agent', 'ip_country',
];

export async function appendLead(submission) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64;
  if (!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_B64 not configured');
  const credentials = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const row = rowFromSubmission(submission);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'A:Z',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

function rowFromSubmission(s) {
  const a = s.answers || {};
  const u = s.utm || {};
  return [
    s.submission_id,
    s.created_at,
    s.name,
    s.email,
    s.company,
    s.notes || '',
    a.q1, a.q2, a.q3, a.q4, a.q5, a.q6, a.q7, a.q8, a.q9, a.q10,
    s.score,
    s.band,
    s.tier,
    u.source || '',
    u.medium || '',
    u.campaign || '',
    s.user_agent || '',
    s.ip_country || '',
  ];
}
