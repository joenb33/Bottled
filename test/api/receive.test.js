const { createMockRes } = require('../helpers/mockRes');

const mockMessage = {
  id: 'msg-1',
  content: 'Hello from the sea',
  created_at: '2026-02-21T12:00:00Z',
  received_count: 0,
  mood: 'hopeful',
  one_time_use: false,
};

const mockChainable = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockResolvedValue({ data: [mockMessage], error: null }),
  update: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ error: null })),
  })),
};

jest.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(() =>
      Promise.resolve({
        data: [mockMessage],
        error: null,
      })
    ),
    from: jest.fn(() => mockChainable),
  },
}));

const receiveHandler = require('../../api/receive');
const { supabase } = require('../../lib/supabase');

describe('GET /api/receive', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
    supabase.rpc.mockResolvedValue({ data: [mockMessage], error: null });
    mockChainable.select.mockReturnThis();
    mockChainable.eq.mockReturnThis();
    mockChainable.not.mockReturnThis();
    mockChainable.or.mockReturnThis();
    mockChainable.order.mockReturnThis();
    mockChainable.limit.mockReturnThis();
    mockChainable.range.mockResolvedValue({ data: [mockMessage], error: null });
    mockChainable.update.mockReturnValue({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    });
    supabase.from.mockReturnValue(mockChainable);
  });

  it('returns 405 for PUT', async () => {
    await receiveHandler({ method: 'PUT' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 204 for OPTIONS', async () => {
    await receiveHandler({ method: 'OPTIONS' }, res);
    expect(res.statusCode).toBe(204);
  });

  it('returns 200 with text, date, id, mood when message exists', async () => {
    await receiveHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe('Hello from the sea');
    expect(res.body.date).toBe('2026-02-21T12:00:00Z');
    expect(res.body.id).toBe('msg-1');
    expect(res.body.mood).toBe('hopeful');
  });

  it('returns 200 with null text/date when no messages', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: [], error: null });
    await receiveHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBeNull();
    expect(res.body.date).toBeNull();
  });

  it('returns 200 for POST with exclude list (fresh message)', async () => {
    await receiveHandler({ method: 'POST', body: { exclude: ['old-id-1'] } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe('Hello from the sea');
    expect(res.body.id).toBe('msg-1');
  });

  it('falls back to RPC when exclude filters everything', async () => {
    mockChainable.range.mockResolvedValueOnce({ data: [], error: null });
    supabase.from.mockReturnValueOnce(mockChainable);
    await receiveHandler({ method: 'POST', body: { exclude: ['msg-1'] } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe('Hello from the sea');
  });
});
