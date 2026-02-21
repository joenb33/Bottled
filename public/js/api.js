(function () {
  'use strict';

  var SEEN_KEY = 'bottled-seen-ids';
  var MAX_SEEN = 200;

  function getSeenIds() {
    try {
      var raw = localStorage.getItem(SEEN_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function addSeenId(id) {
    if (!id) return;
    try {
      var seen = getSeenIds();
      if (seen.indexOf(id) === -1) {
        seen.push(id);
        if (seen.length > MAX_SEEN) {
          seen = seen.slice(seen.length - MAX_SEEN);
        }
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
      }
    } catch (e) {}
  }

  /**
   * Send a message. Returns { success, id } or { success: false, error }.
   */
  async function sendMessage(text, opts) {
    opts = opts || {};
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        mood: opts.mood || undefined,
        seal_days: opts.seal_days || undefined,
        one_time: opts.one_time || false,
      }),
    });
    const data = await res.json().catch(function () {
      return { success: false, error: 'Network error' };
    });
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to send' };
    }
    return data;
  }

  /**
   * Receive a random message, excluding previously seen IDs.
   */
  async function receiveMessage() {
    var seen = getSeenIds();
    const res = await fetch('/api/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exclude: seen }),
    });
    const data = await res.json().catch(function () {
      return { text: null, date: null };
    });
    if (!res.ok) {
      return { text: null, date: null };
    }
    if (data.id) {
      addSeenId(data.id);
    }
    return data;
  }

  /**
   * Get status for a message id.
   */
  async function getStatus(id) {
    const res = await fetch('/api/status/' + encodeURIComponent(id));
    const data = await res.json().catch(function () {
      return { found: false };
    });
    return data;
  }

  /**
   * Report a message.
   */
  async function reportMessage(id) {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id }),
    });
    const data = await res.json().catch(function () {
      return { success: false };
    });
    return data;
  }

  window.BottledAPI = {
    sendMessage: sendMessage,
    receiveMessage: receiveMessage,
    getStatus: getStatus,
    reportMessage: reportMessage,
  };
})();
