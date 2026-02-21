const { supabase } = require('../../lib/supabase');
const { requireAdmin } = require('../../lib/adminAuth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const filter = req.query.filter || 'all';
    const search = req.query.search || '';

    let query = supabase
      .from('messages')
      .select('id, content, created_at, received_count, mood, is_flagged, sealed_until, one_time_use', { count: 'exact' });

    if (filter === 'flagged') {
      query = query.eq('is_flagged', true);
    } else if (filter === 'active') {
      query = query.eq('is_flagged', false);
    } else if (filter === 'unread') {
      query = query.eq('received_count', 0).eq('is_flagged', false);
    } else if (filter === 'sealed') {
      query = query.not('sealed_until', 'is', null).gt('sealed_until', new Date().toISOString());
    }

    if (search) {
      query = query.ilike('content', '%' + search + '%');
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Admin messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
      return;
    }

    res.status(200).json({
      messages: data || [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err) {
    console.error('Admin messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
