(function () {
  'use strict';

  var STORAGE_KEY = 'bottled-admin-key';
  var loginEl = document.getElementById('admin-login');
  var panelEl = document.getElementById('admin-panel');
  var keyInput = document.getElementById('admin-key');
  var loginBtn = document.getElementById('admin-login-btn');
  var loginError = document.getElementById('admin-login-error');
  var logoutBtn = document.getElementById('admin-logout-btn');
  var refreshBtn = document.getElementById('admin-refresh-btn');
  var listEl = document.getElementById('admin-list');
  var countEl = document.getElementById('admin-count');
  var emptyEl = document.getElementById('admin-empty');

  function getKey() {
    return keyInput ? keyInput.value.trim() : '';
  }

  function getStoredKey() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setStoredKey(key) {
    try {
      if (key) sessionStorage.setItem(STORAGE_KEY, key);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function headers() {
    var k = getStoredKey();
    var h = { 'Content-Type': 'application/json' };
    if (k) h['X-Admin-Key'] = k;
    return h;
  }

  function showLogin(err) {
    if (panelEl) panelEl.hidden = true;
    if (loginEl) loginEl.hidden = false;
    if (loginError) {
      loginError.hidden = !err;
      loginError.textContent = err || '';
    }
  }

  function showPanel() {
    if (loginEl) loginEl.hidden = true;
    if (loginError) loginError.hidden = true;
    if (panelEl) panelEl.hidden = false;
    loadFlagged();
  }

  function renderMessage(m) {
    var created = m.created_at ? new Date(m.created_at).toLocaleString() : '—';
    var preview = (m.content || '').slice(0, 120);
    if ((m.content || '').length > 120) preview += '…';
    var meta = [created];
    if (m.received_count != null) meta.push('reads: ' + m.received_count);
    if (m.mood) meta.push(m.mood);
    var div = document.createElement('div');
    div.className = 'admin-card message-card';
    div.setAttribute('data-id', m.id);
    div.innerHTML =
      '<p class="message-meta">' + escapeHtml(meta.join(' · ')) + '</p>' +
      '<div class="message-body">' + escapeHtml(preview) + '</div>' +
      '<p class="message-actions">' +
      '<button type="button" class="btn-link admin-unflag" data-id="' + escapeAttr(m.id) + '">Unflag</button> ' +
      '<button type="button" class="btn-link admin-delete" data-id="' + escapeAttr(m.id) + '">Delete</button>' +
      '</p>';
    return div;
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function loadFlagged() {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = true;
    fetch('/api/admin/flagged', { headers: headers() })
      .then(function (r) {
        if (r.status === 401) {
          setStoredKey('');
          showLogin('Invalid or expired secret.');
          return null;
        }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        var messages = data.messages || [];
        if (countEl) countEl.textContent = messages.length + ' flagged message(s).';
        if (messages.length === 0) {
          if (emptyEl) emptyEl.hidden = false;
          return;
        }
        messages.forEach(function (m) {
          listEl.appendChild(renderMessage(m));
        });
        listEl.querySelectorAll('.admin-unflag').forEach(function (btn) {
          btn.addEventListener('click', function () { doAction(btn.getAttribute('data-id'), 'unflag'); });
        });
        listEl.querySelectorAll('.admin-delete').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (confirm('Permanently delete this message?')) doAction(btn.getAttribute('data-id'), 'delete');
          });
        });
      })
      .catch(function () {
        if (countEl) countEl.textContent = 'Failed to load.';
      });
  }

  function doAction(id, action) {
    fetch('/api/admin/flagged', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id: id, action: action })
    })
      .then(function (r) {
        if (r.status === 401) {
          setStoredKey('');
          showLogin('Session expired.');
          return;
        }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        if (data.error) {
          alert(data.error);
          return;
        }
        var card = listEl && listEl.querySelector('[data-id="' + id + '"]');
        if (card) card.remove();
        if (action === 'delete' || action === 'unflag') loadFlagged();
      })
      .catch(function () { alert('Request failed.'); });
  }

  if (loginBtn && keyInput) {
    loginBtn.addEventListener('click', function () {
      var key = getKey();
      if (!key) {
        if (loginError) { loginError.hidden = false; loginError.textContent = 'Enter the admin secret.'; }
        return;
      }
      setStoredKey(key);
      fetch('/api/admin/flagged', { headers: headers() })
        .then(function (r) {
          if (r.status === 401) {
            setStoredKey('');
            showLogin('Invalid secret.');
            return;
          }
          showPanel();
        })
        .catch(function () {
          showLogin('Could not connect.');
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      setStoredKey('');
      keyInput.value = '';
      showLogin();
    });
  }

  if (refreshBtn) refreshBtn.addEventListener('click', loadFlagged);

  if (getStoredKey()) {
    showPanel();
  } else {
    showLogin();
  }
})();
