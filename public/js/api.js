(function () {
  'use strict';

  /**
   * Send a message. Returns { success, id } or { success: false, error }.
   * @param {string} text
   * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
   */
  async function sendMessage(text) {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
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
   * Receive a random message. Returns { text, date, id } or { text: null, date: null }.
   * @returns {Promise<{ text: string | null, date: string | null, id?: string }>}
   */
  async function receiveMessage() {
    const res = await fetch('/api/receive');
    const data = await res.json().catch(function () {
      return { text: null, date: null };
    });
    if (!res.ok) {
      return { text: null, date: null };
    }
    return data;
  }

  /**
   * Get status for a message id. Returns { found: boolean, count?: number }.
   * @param {string} id
   * @returns {Promise<{ found: boolean, count?: number }>}
   */
  async function getStatus(id) {
    const res = await fetch('/api/status/' + encodeURIComponent(id));
    const data = await res.json().catch(function () {
      return { found: false };
    });
    return data;
  }

  /**
   * Report a message. Returns { success }.
   * @param {string} id
   * @returns {Promise<{ success: boolean }>}
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
