const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAdmin(req) {
  if (!ADMIN_SECRET || ADMIN_SECRET.length < 8) return false;
  const key = req.headers['x-admin-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  return key === ADMIN_SECRET;
}

function requireAdmin(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

module.exports = { isAdmin, requireAdmin };
