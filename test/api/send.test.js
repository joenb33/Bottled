const { createMockRes } = require('../helpers/mockRes');

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: { id: 'test-uuid-123' }, error: null })
          ),
        })),
      })),
    })),
  },
}));

jest.mock('../../lib/moderation', () => ({
  moderate: jest.fn(() => Promise.resolve({ allowed: true })),
}));

jest.mock('../../lib/rate-limit', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
  checkAndRecordSend: jest.fn(() => Promise.resolve({ allowed: true })),
}));

const sendHandler = require('../../api/send');

describe('POST /api/send', () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    require('../../lib/moderation').moderate.mockResolvedValue({ allowed: true });
    require('../../lib/rate-limit').checkAndRecordSend.mockResolvedValue({ allowed: true });
  });

  it('returns 405 for GET', async () => {
    await sendHandler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ success: false, error: 'Method not allowed' });
  });

  it('returns 204 for OPTIONS', async () => {
    await sendHandler({ method: 'OPTIONS' }, res);
    expect(res.statusCode).toBe(204);
  });

  it('returns 400 when text is missing', async () => {
    await sendHandler(
      { method: 'POST', body: {} },
      res
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing|empty/i);
  });

  it('returns 400 when text is too long', async () => {
    await sendHandler(
      { method: 'POST', body: { text: 'x'.repeat(1001) } },
      res
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/long/i);
  });

  it('returns 400 when content is not allowed (moderation)', async () => {
    require('../../lib/moderation').moderate.mockResolvedValueOnce({ allowed: false });
    await sendHandler(
      { method: 'POST', body: { text: 'hello world' } },
      res
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/not allowed/i);
  });

  it('returns 429 when rate limited', async () => {
    require('../../lib/rate-limit').checkAndRecordSend.mockResolvedValueOnce({ allowed: false });
    await sendHandler(
      { method: 'POST', body: { text: 'hello' } },
      res
    );
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBeDefined();
  });

  it('returns 200 and id on success', async () => {
    await sendHandler(
      { method: 'POST', body: { text: 'A message to the sea' } },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe('test-uuid-123');
  });

  it('accepts optional mood, seal_days, one_time', async () => {
    await sendHandler(
      {
        method: 'POST',
        body: {
          text: 'Sealed message',
          mood: 'hopeful',
          seal_days: 30,
          one_time: true,
        },
      },
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
