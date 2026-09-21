// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATE · Newsletter subscribe endpoint
// Runs as a Vercel Serverless Function at POST /api/subscribe
//
// REQUIRED VERCEL ENVIRONMENT VARIABLES
// (Project → Settings → Environment Variables, then redeploy):
//
//   MAILCHIMP_API_KEY        your Mailchimp API key, e.g. xxxxxxxxxxxx-us14
//   MAILCHIMP_AUDIENCE_ID    the audience / list ID, e.g. 9318507adb
//   MAILCHIMP_SERVER_PREFIX  optional; derived from the API key if unset
//
// The key is only ever read server-side and is never sent to the browser.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const email = ((body && body.email) || '').trim().toLowerCase();
  const yokai = ((body && body.yokai) || '').trim().toLowerCase();
  const agent = ((body && body.agent) || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || process.env.MAILCHIMP_LIST_ID;
  if (!API_KEY || !AUDIENCE_ID) {
    console.error('[subscribe] missing env vars — key:', !!API_KEY, 'audience:', !!AUDIENCE_ID);
    return res.status(500).json({ ok: false, error: 'Signup is not configured yet.' });
  }

  const dc = process.env.MAILCHIMP_SERVER_PREFIX || API_KEY.split('-')[1];
  if (!dc) {
    console.error('[subscribe] API key has no datacenter suffix');
    return res.status(500).json({ ok: false, error: 'Signup is not configured correctly.' });
  }

  // Tags let the audience be segmented by result — eight y\u014dkai, eight agents.
  const tags = ['source:translate'];
  if (yokai) tags.push('yokai:' + yokai);
  if (agent) tags.push('agent:' + agent);

  const payload = {
    email_address: email,
    status: 'pending',            // double opt-in; 'subscribed' for single opt-in
    tags,
    merge_fields: {
      ...(yokai ? { YOKAI: yokai.toUpperCase() } : {}),
      ...(agent ? { AGENT: agent.toUpperCase() } : {}),
    },
  };

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;
  const auth = 'Basic ' + Buffer.from('anystring:' + API_KEY).toString('base64');

  try {
    const mc = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(payload),
    });
    const data = await mc.json().catch(() => ({}));

    if (mc.ok) {
      return res.status(200).json({ ok: true, message: 'Check your inbox to confirm.' });
    }

    if (data.title === 'Member Exists' ||
        (data.detail && String(data.detail).includes('already a list member'))) {
      return res.status(200).json({ ok: true, message: "You're already on the list." });
    }

    console.error('[subscribe] mailchimp error:', mc.status, data);
    return res.status(400).json({
      ok: false,
      error: data.detail || data.title || 'Something went wrong. Please try again.',
    });
  } catch (err) {
    console.error('[subscribe] network error:', err);
    return res.status(500).json({ ok: false, error: 'Network error. Please try again.' });
  }
};
