const { supabase } = require('../../lib/supabase');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const id = req.query.id;
  if (!id) {
    res.status(400).json({ error: 'Missing message id' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('received_count')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(200).json({ found: false });
      return;
    }

    const count = data.received_count || 0;
    res.status(200).json({ found: true, count });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
