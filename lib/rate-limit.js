const { supabase } = require('./supabase');

const MAX_SENDS_PER_HOUR = 5;

/**
 * Get client IP from Vercel request.
 * @param {object} req - Vercel request
 * @returns {string}
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Hour bucket in UTC (e.g. "2026-02-21T14").
 */
function getHourBucket() {
  const d = new Date();
  return d.toISOString().slice(0, 13);
}

/**
 * Atomically increment send count for IP in current hour; returns whether under limit.
 * Call this before inserting a message; if allowed, proceed with send.
 * @param {string} ip
 * @returns {Promise<{ allowed: boolean }>}
 */
async function checkAndRecordSend(ip) {
  const hour = getHourBucket();
  const { data: newCount, error } = await supabase.rpc('increment_send_count', {
    p_ip: ip,
    p_hour_bucket: hour,
  });

  if (error) {
    console.error('Rate limit RPC error:', error);
    return { allowed: true };
  }
  return { allowed: Number(newCount) <= MAX_SENDS_PER_HOUR };
}

module.exports = { getClientIp, checkAndRecordSend, MAX_SENDS_PER_HOUR };
