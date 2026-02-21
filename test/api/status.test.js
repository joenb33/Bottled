const { createMockRes } = require('../helpers/mockRes');

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(function () {
      return {
        select: jest.fn(function () {
          return {
            eq: jest.fn(function () {
              return {
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { received_count: 3 },
                    error: null,
                  })
                ),
              };
            }),
          };
        }),
      };
    }),
  },
}));

// Vercel dynamic route: api/status/[id].js exposes handler; req.query.id
const statusHandler = require('../../api/status/[id]');

describe('GET /api/status/:id', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
  });

  it('returns 405 for POST', async () => {
    await statusHandler({ method: 'POST', query: {} }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 400 when id is missing', async () => {
    await statusHandler({ method: 'GET', query: {} }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing|id/i);
  });

  it('returns 200 with found and count when message exists', async () => {
    await statusHandler(
      { method: 'GET', query: { id: 'some-uuid' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.found).toBe(true);
    expect(res.body.count).toBe(3);
  });

  it('returns 200 found false when message not found', async () => {
    const { supabase } = require('../../lib/supabase');
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: null, error: { message: 'not found' } })
          ),
        })),
      })),
    });
    await statusHandler(
      { method: 'GET', query: { id: 'missing-uuid' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.found).toBe(false);
  });
});
