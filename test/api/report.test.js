const { createMockRes } = require('../helpers/mockRes');

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

const reportHandler = require('../../api/report');

describe('POST /api/report', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
  });

  it('returns 405 for GET', async () => {
    await reportHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 400 when id is missing', async () => {
    await reportHandler({ method: 'POST', body: {} }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 200 and success on valid report', async () => {
    await reportHandler(
      { method: 'POST', body: { id: 'some-uuid' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
