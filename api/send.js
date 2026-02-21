const { supabase } = require('../lib/supabase');
const { moderate } = require('../lib/moderation');
const { getClientIp, checkAndRecordSend } = require('../lib/rate-limit');

const MAX_LENGTH = 1000;
const MOODS = ['hopeful', 'lonely', 'grateful', 'curious', 'peaceful', 'adventurous', 'quiet', 'brave'];
const SEAL_DAYS_MIN = 1;
const SEAL_DAYS_MAX = 365;

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

    if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const ip = getClientIp(req);
    const { allowed: rateOk } = await checkAndRecordSend(ip);
    if (!rateOk) {
      res.status(429).json({ success: false, error: 'The sea can only carry so many bottles at once. Try again in an hour.' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    let mood = body.mood != null && MOODS.includes(String(body.mood).toLowerCase()) ? String(body.mood).toLowerCase() : null;
    const sealDays = body.seal_days != null ? Math.min(SEAL_DAYS_MAX, Math.max(SEAL_DAYS_MIN, parseInt(body.seal_days, 10) || 0)) : 0;
    const oneTime = !!body.one_time;

    if (!text) {
      res.status(400).json({ success: false, error: 'Missing or empty text' });
      return;
    }

    if (text.length > MAX_LENGTH) {
      res.status(400).json({ success: false, error: 'Message too long (max 1000 characters)' });
      return;
    }

    const { allowed } = await moderate(text);
    if (!allowed) {
      res.status(400).json({ success: false, error: 'Content not allowed' });
      return;
    }

    const sealedUntil = sealDays > 0
      ? new Date(Date.now() + sealDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('messages')
      .insert({ content: text, mood, sealed_until: sealedUntil, one_time_use: oneTime })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).json({ success: false, error: 'Failed to save message' });
      return;
    }

    res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Send error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
