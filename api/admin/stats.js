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
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, flaggedRes, todayRes, weekRes, moodRes, topReadRes, recentRes] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('messages').select('mood').not('mood', 'is', null),
      supabase.from('messages').select('id, content, received_count, mood, created_at')
        .eq('is_flagged', false)
        .order('received_count', { ascending: false })
        .limit(5),
      supabase.from('messages').select('id, content, created_at, received_count, mood, is_flagged, one_time_use')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const totalReads = await supabase
      .from('messages')
      .select('received_count');

    let totalReadCount = 0;
    if (totalReads.data) {
      totalReadCount = totalReads.data.reduce((sum, m) => sum + (m.received_count || 0), 0);
    }

    const moodCounts = {};
    if (moodRes.data) {
      moodRes.data.forEach(row => {
        const m = row.mood;
        if (m) moodCounts[m] = (moodCounts[m] || 0) + 1;
      });
    }

    const sealedRes = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .not('sealed_until', 'is', null)
      .gt('sealed_until', now.toISOString());

    const oneTimeRes = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('one_time_use', true);

    const unreadRes = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('received_count', 0)
      .eq('is_flagged', false);

    res.status(200).json({
      total: totalRes.count ?? 0,
      flagged: flaggedRes.count ?? 0,
      today: todayRes.count ?? 0,
      thisWeek: weekRes.count ?? 0,
      totalReads: totalReadCount,
      sealed: sealedRes.count ?? 0,
      oneTime: oneTimeRes.count ?? 0,
      unread: unreadRes.count ?? 0,
      moodBreakdown: moodCounts,
      topRead: topReadRes.data || [],
      recent: recentRes.data || [],
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
