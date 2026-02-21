const { createMockRes } = require('../helpers/mockRes');

jest.mock('../../lib/supabase', () => {
  const mockFrom = jest.fn(() => ({
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    })),
  }));
  return {
    supabase: {
      rpc: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              id: 'msg-1',
              content: 'Hello from the sea',
              created_at: '2026-02-21T12:00:00Z',
              received_count: 0,
              mood: 'hopeful',
              one_time_use: false,
            },
          ],
          error: null,
        })
      ),
      from: mockFrom,
    },
  };
});

const receiveHandler = require('../../api/receive');

describe('GET /api/receive', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
  });

  it('returns 405 for POST', async () => {
    await receiveHandler({ method: 'POST' }, res);
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
    const { supabase } = require('../../lib/supabase');
    supabase.rpc.mockResolvedValueOnce({ data: [], error: null });
    await receiveHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBeNull();
    expect(res.body.date).toBeNull();
  });
});
