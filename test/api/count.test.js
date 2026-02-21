const { createMockRes } = require('../helpers/mockRes');

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(function () {
      return {
        select: jest.fn(function () {
          return {
            eq: jest.fn(() => Promise.resolve({ count: 42, error: null })),
          };
        }),
      };
    }),
  },
}));

const countHandler = require('../../api/count');

describe('GET /api/count', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
  });

  it('returns 405 for POST', async () => {
    await countHandler({ method: 'POST' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 204 for OPTIONS', async () => {
    await countHandler({ method: 'OPTIONS' }, res);
    expect(res.statusCode).toBe(204);
  });

  it('returns 200 with count', async () => {
    await countHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(42);
  });

  it('returns 500 with count 0 on db error', async () => {
    const { supabase } = require('../../lib/supabase');
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ count: null, error: { message: 'db error' } })),
      })),
    });
    await countHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.count).toBe(0);
  });
});
