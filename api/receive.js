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
    const { data: rows, error: rpcError } = await supabase.rpc('get_random_message');

    if (rpcError) {
      console.error('get_random_message error:', rpcError);
      res.status(500).json({ error: 'Failed to get message' });
      return;
    }

    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) {
      res.status(200).json({ text: null, date: null });
      return;
    }

    const { id, content, created_at, received_count, mood, one_time_use } = row;

    const updates = { received_count: (received_count || 0) + 1 };
    if (one_time_use) {
      updates.is_flagged = true;
    }
    const { error: updateError } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    res.status(200).json({
      text: content,
      date: created_at,
      id,
      mood: mood || null,
    });
  } catch (err) {
    console.error('Receive error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
