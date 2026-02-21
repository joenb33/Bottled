const { supabase } = require('../../lib/supabase');
const { requireAdmin } = require('../../lib/adminAuth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const [flaggedRes, consumedRes] = await Promise.all([
      supabase
        .from('messages')
        .select('id, content, created_at, received_count, mood, sealed_until, one_time_use')
        .eq('is_flagged', true)
        .or('one_time_use.eq.false,one_time_use.is.null')
        .order('created_at', { ascending: false }),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_flagged', true)
        .eq('one_time_use', true),
    ]);

    if (flaggedRes.error) {
      console.error('Admin flagged list error:', flaggedRes.error);
      res.status(500).json({ error: 'Failed to fetch' });
      return;
    }

    res.status(200).json({
      messages: flaggedRes.data || [],
      consumedRareCount: consumedRes.count ?? 0,
    });
    return;
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const id = body.id;
    const action = body.action;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    if (action === 'unflag') {
      const { error } = await supabase.from('messages').update({ is_flagged: false }).eq('id', id);
      if (error) {
        console.error('Admin unflag error:', error);
        res.status(500).json({ error: 'Failed to unflag' });
        return;
      }
      res.status(200).json({ success: true });
      return;
    }
    if (action === 'delete') {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) {
        console.error('Admin delete error:', error);
        res.status(500).json({ error: 'Failed to delete' });
        return;
      }
      res.status(200).json({ success: true });
      return;
    }
    res.status(400).json({ error: 'Invalid action' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
