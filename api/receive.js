const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let exclude = [];
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      if (Array.isArray(body.exclude)) {
        exclude = body.exclude
          .filter(id => typeof id === 'string' && id.length > 0)
          .slice(0, 200);
      }
    }

    let row = null;

    if (exclude.length > 0) {
      const now = new Date().toISOString();
      let query = supabase
        .from('messages')
        .select('id, content, created_at, received_count, mood, one_time_use')
        .eq('is_flagged', false)
        .not('id', 'in', '(' + exclude.join(',') + ')');

      query = query.or('sealed_until.is.null,sealed_until.lte.' + now);
      query = query.limit(1);
      query = query.order('created_at', { ascending: false });

      const randomOffset = Math.floor(Math.random() * 1000);
      query = query.range(randomOffset, randomOffset);

      const { data: firstTry } = await query;

      if (firstTry && firstTry.length > 0) {
        row = firstTry[0];
      } else {
        const { data: fallback } = await supabase
          .from('messages')
          .select('id, content, created_at, received_count, mood, one_time_use')
          .eq('is_flagged', false)
          .not('id', 'in', '(' + exclude.join(',') + ')')
          .or('sealed_until.is.null,sealed_until.lte.' + now)
          .order('random()')
          .limit(1);

        if (fallback && fallback.length > 0) {
          row = fallback[0];
        }
      }

      if (!row) {
        const { data: anyMsg } = await supabase.rpc('get_random_message');
        const rpcRow = Array.isArray(anyMsg) ? anyMsg[0] : anyMsg;
        if (rpcRow) row = rpcRow;
      }
    } else {
      const { data: rows, error: rpcError } = await supabase.rpc('get_random_message');
      if (rpcError) {
        console.error('get_random_message error:', rpcError);
        res.status(500).json({ error: 'Failed to get message' });
        return;
      }
      row = Array.isArray(rows) ? rows[0] : rows;
    }

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
