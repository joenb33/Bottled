const { supabase } = require('../lib/supabase');
const { moderate } = require('../lib/moderation');

const MAX_LENGTH = 1000;

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const text = typeof body.text === 'string' ? body.text.trim() : '';

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

    const { data, error } = await supabase
      .from('messages')
      .insert({ content: text })
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
