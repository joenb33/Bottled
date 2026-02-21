const { createMockRes } = require('../helpers/mockRes');

const mockChainable = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockResolvedValue({ data: [], count: 0, error: null }),
};

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockChainable),
  },
}));

jest.mock('../../lib/adminAuth', () => ({
  requireAdmin: jest.fn(() => true),
}));

const messagesHandler = require('../../api/admin/messages');
const { requireAdmin } = require('../../lib/adminAuth');

describe('GET /api/admin/messages', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
    requireAdmin.mockReturnValue(true);

    mockChainable.select.mockReturnThis();
    mockChainable.eq.mockReturnThis();
    mockChainable.not.mockReturnThis();
    mockChainable.gt.mockReturnThis();
    mockChainable.ilike.mockReturnThis();
    mockChainable.order.mockReturnThis();
    mockChainable.range.mockResolvedValue({ data: [], count: 0, error: null });
  });

  it('returns 401 when not admin', async () => {
    requireAdmin.mockImplementation((req, res) => {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    });
    await messagesHandler({ method: 'GET', headers: {}, query: {} }, res);
    expect(res.statusCode).toBe(401);
  });

  it('returns 204 for OPTIONS', async () => {
    await messagesHandler({ method: 'OPTIONS', headers: {} }, res);
    expect(res.statusCode).toBe(204);
  });

  it('returns 405 for POST', async () => {
    await messagesHandler({ method: 'POST', headers: {} }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns paginated messages', async () => {
    mockChainable.range.mockResolvedValueOnce({
      data: [{ id: '1', content: 'hello' }],
      count: 1,
      error: null,
    });
    await messagesHandler(
      { method: 'GET', headers: {}, query: { page: '1', limit: '10' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.messages).toHaveLength(1);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(1);
  });

  it('returns empty results when no messages', async () => {
    await messagesHandler(
      { method: 'GET', headers: {}, query: {} },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.messages).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('applies search filter', async () => {
    mockChainable.range.mockResolvedValueOnce({
      data: [{ id: '2', content: 'searchterm' }],
      count: 1,
      error: null,
    });
    await messagesHandler(
      { method: 'GET', headers: {}, query: { search: 'searchterm' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(mockChainable.ilike).toHaveBeenCalledWith('content', '%searchterm%');
  });
});
