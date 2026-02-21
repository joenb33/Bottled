const { createMockRes } = require('../helpers/mockRes');

const mockChainable = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockChainable),
  },
}));

jest.mock('../../lib/adminAuth', () => ({
  requireAdmin: jest.fn(() => true),
}));

const flaggedHandler = require('../../api/admin/flagged');
const { requireAdmin } = require('../../lib/adminAuth');

describe('Admin flagged endpoint', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
    requireAdmin.mockReturnValue(true);

    mockChainable.select.mockReturnThis();
    mockChainable.eq.mockReturnThis();
    mockChainable.or.mockReturnThis();
    mockChainable.order.mockReturnThis();
    mockChainable.update.mockReturnThis();
    mockChainable.delete.mockReturnThis();
  });

  it('returns 401 when not admin', async () => {
    requireAdmin.mockImplementation((req, res) => {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    });
    await flaggedHandler({ method: 'GET', headers: {} }, res);
    expect(res.statusCode).toBe(401);
  });

  it('returns 204 for OPTIONS', async () => {
    await flaggedHandler({ method: 'OPTIONS', headers: {} }, res);
    expect(res.statusCode).toBe(204);
  });

  it('returns 405 for unsupported methods', async () => {
    await flaggedHandler({ method: 'PUT', headers: {} }, res);
    expect(res.statusCode).toBe(405);
  });

  it('PATCH returns 400 when id is missing', async () => {
    await flaggedHandler({ method: 'PATCH', headers: {}, body: {} }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing id/i);
  });

  it('PATCH returns 400 for invalid action', async () => {
    await flaggedHandler(
      { method: 'PATCH', headers: {}, body: { id: 'abc', action: 'invalid' } },
      res
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid action/i);
  });

  it('PATCH unflag returns 200 on success', async () => {
    mockChainable.eq.mockResolvedValueOnce({ error: null });
    await flaggedHandler(
      { method: 'PATCH', headers: {}, body: { id: 'abc', action: 'unflag' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PATCH delete returns 200 on success', async () => {
    mockChainable.eq.mockResolvedValueOnce({ error: null });
    await flaggedHandler(
      { method: 'PATCH', headers: {}, body: { id: 'abc', action: 'delete' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
