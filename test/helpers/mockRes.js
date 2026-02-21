/**
 * Creates a mock Express-style res that captures status and body for assertions.
 */
function createMockRes() {
  const out = { statusCode: null, body: null, ended: false };
  const res = {
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res.body = data;
      res.ended = true;
      return res;
    },
    end() {
      res.ended = true;
      return res;
    },
    setHeader() {
      return res;
    },
  };
  res.statusCode = null;
  res.body = null;
  res.ended = false;
  return Object.assign(res, out);
}

module.exports = { createMockRes };
