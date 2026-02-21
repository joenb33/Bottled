const { createMockRes } = require('../helpers/mockRes');

const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));
const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    rpc: (...args) => mockRpc(...args),
  },
}));

jest.mock('../../lib/adminAuth', () => ({
  requireAdmin: jest.fn(() => true),
}));

const statsHandler = require('../../api/admin/stats');
const { requireAdmin } = require('../../lib/adminAuth');

describe('GET /api/admin/stats', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
    requireAdmin.mockReturnValue(true);

    const chainable = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    chainable.select.mockReturnValue(chainable);
    chainable.eq.mockImplementation(() => chainable);
    chainable.not.mockImplementation(() => chainable);
    chainable.gt.mockImplementation(() => chainable);
    chainable.gte.mockImplementation(() => chainable);
    chainable.order.mockImplementation(() => chainable);
    chainable.limit.mockImplementation(() => chainable);

    chainable.then = function (cb) {
      return Promise.resolve({ count: 10, data: [], error: null }).then(cb);
    };

    mockFrom.mockReturnValue(chainable);
  });

  it('returns 405 for POST', async () => {
    await statsHandler({ method: 'POST', headers: {} }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 204 for OPTIONS', async () => {
    requireAdmin.mockImplementation((req, res) => {
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return false;
      }
      return true;
    });
    await statsHandler({ method: 'OPTIONS', headers: {} }, res);
    expect(res.statusCode).toBe(204);
  });

  it('returns 401 when admin check fails', async () => {
    requireAdmin.mockImplementation((req, res) => {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    });
    await statsHandler({ method: 'GET', headers: {} }, res);
    expect(res.statusCode).toBe(401);
  });
});
