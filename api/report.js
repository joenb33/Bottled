const { supabase } = require('../lib/supabase');

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
    const id = body.id;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ success: false, error: 'Missing message id' });
      return;
    }
    const { error } = await supabase
      .from('messages')
      .update({ is_flagged: true })
      .eq('id', id);
    if (error) {
      console.error('Report error:', error);
      res.status(500).json({ success: false, error: 'Failed to report' });
      return;
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
