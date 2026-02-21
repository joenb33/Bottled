const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_flagged', false);
    if (error) {
      console.error('Count error:', error);
      res.status(500).json({ count: 0 });
      return;
    }
    res.status(200).json({ count: count ?? 0 });
  } catch (err) {
    console.error('Count error:', err);
    res.status(500).json({ count: 0 });
  }
};
