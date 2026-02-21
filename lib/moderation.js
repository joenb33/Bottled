const MODERATION_URL = 'https://api.openai.com/v1/moderations';

/**
 * Check text with OpenAI Moderation API.
 * @param {string} text - Content to moderate
 * @returns {Promise<{ allowed: boolean, categories?: object }>}
 */
async function moderate(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(MODERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Moderation API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) {
      return { allowed: true };
    }

    return {
      allowed: !result.flagged,
      categories: result.categories,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Moderation request timed out');
    }
    throw err;
  }
}

module.exports = { moderate };
