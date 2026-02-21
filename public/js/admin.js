(function () {
  'use strict';

  var STORAGE_KEY = 'bottled-admin-key';

  // DOM refs
  var loginEl = document.getElementById('admin-login');
  var panelEl = document.getElementById('admin-panel');
  var keyInput = document.getElementById('admin-key');
  var loginBtn = document.getElementById('admin-login-btn');
  var loginError = document.getElementById('admin-login-error');
  var logoutBtn = document.getElementById('admin-logout-btn');
  var refreshBtn = document.getElementById('admin-refresh-btn');

  // Stats
  var statTotal = document.getElementById('stat-total');
  var statToday = document.getElementById('stat-today');
  var statWeek = document.getElementById('stat-week');
  var statReads = document.getElementById('stat-reads');
  var statUnread = document.getElementById('stat-unread');
  var statFlagged = document.getElementById('stat-flagged');
  var moodChart = document.getElementById('mood-chart');
  var moodExtras = document.getElementById('mood-extras');
  var topReadList = document.getElementById('top-read-list');
  var topReadEmpty = document.getElementById('top-read-empty');
  var recentList = document.getElementById('recent-list');

  // Flagged
  var listEl = document.getElementById('admin-list');
  var countEl = document.getElementById('admin-count');
  var emptyEl = document.getElementById('admin-empty');

  // All messages
  var allList = document.getElementById('all-messages-list');
  var allPagination = document.getElementById('all-messages-pagination');
  var allEmpty = document.getElementById('all-messages-empty');
  var msgSearch = document.getElementById('msg-search');
  var msgFilter = document.getElementById('msg-filter');

  // Tabs
  var tabs = document.querySelectorAll('.admin-tab');
  var tabPanels = {
    flagged: document.getElementById('tab-flagged'),
    all: document.getElementById('tab-all'),
  };

  var SEAL_COLORS = {
    hopeful: '#e8b86d',
    lonely: '#6b7b8c',
    grateful: '#7eb89e',
    curious: '#9b8dc4',
    peaceful: '#87ceeb',
    adventurous: '#c45c5c',
    quiet: '#8fa3b5',
    brave: '#4a9ebf',
  };

  var allMessagesPage = 1;
  var searchTimeout = null;

  function getStoredKey() {
    try { return sessionStorage.getItem(STORAGE_KEY) || ''; }
    catch (e) { return ''; }
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
    loadDashboard();
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatNumber(n) {
    return typeof n === 'number' ? n.toLocaleString() : '—';
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatDateTime(d) {
    if (!d) return '—';
    var date = new Date(d);
    var now = new Date();
    var diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 172800000) return 'Yesterday';
    return formatDate(d);
  }

  // --- Stats ---
  function loadStats() {
    fetch('/api/admin/stats', { headers: headers() })
      .then(function (r) {
        if (r.status === 401) { setStoredKey(''); showLogin('Session expired.'); return null; }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        if (statTotal) statTotal.textContent = formatNumber(data.total);
        if (statToday) statToday.textContent = formatNumber(data.today);
        if (statWeek) statWeek.textContent = formatNumber(data.thisWeek);
        if (statReads) statReads.textContent = formatNumber(data.totalReads);
        if (statUnread) statUnread.textContent = formatNumber(data.unread);
        if (statFlagged) statFlagged.textContent = formatNumber(data.flagged);

        renderMoodChart(data.moodBreakdown || {});
        renderExtras(data);
        renderTopRead(data.topRead || []);
        renderRecent(data.recent || []);
      })
      .catch(function () {});
  }

  function renderMoodChart(moods) {
    if (!moodChart) return;
    moodChart.innerHTML = '';
    var keys = Object.keys(moods);
    if (keys.length === 0) {
      moodChart.innerHTML = '<p class="text-muted">No mood data yet.</p>';
      return;
    }
    var max = Math.max.apply(null, keys.map(function (k) { return moods[k]; }));
    keys.sort(function (a, b) { return moods[b] - moods[a]; });
    keys.forEach(function (mood) {
      var pct = max > 0 ? Math.round((moods[mood] / max) * 100) : 0;
      var color = SEAL_COLORS[mood] || '#4A9EBF';
      var item = document.createElement('div');
      item.className = 'mood-bar-item';
      item.innerHTML =
        '<span class="mood-bar-label">' + escapeHtml(mood) + '</span>' +
        '<div class="mood-bar-track"><div class="mood-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '<span class="mood-bar-count">' + moods[mood] + '</span>';
      moodChart.appendChild(item);
    });
  }

  function renderExtras(data) {
    if (!moodExtras) return;
    var parts = [];
    if (data.sealed > 0) parts.push(data.sealed + ' sealed bottle' + (data.sealed === 1 ? '' : 's'));
    if (data.oneTime > 0) parts.push(data.oneTime + ' rare bottle' + (data.oneTime === 1 ? '' : 's'));
    moodExtras.textContent = parts.length > 0 ? parts.join(' · ') : '';
    moodExtras.hidden = parts.length === 0;
  }

  function renderTopRead(messages) {
    if (!topReadList) return;
    topReadList.innerHTML = '';
    if (messages.length === 0) {
      if (topReadEmpty) topReadEmpty.hidden = false;
      return;
    }
    if (topReadEmpty) topReadEmpty.hidden = true;
    messages.forEach(function (m) { topReadList.appendChild(renderMessageCard(m, 'topread')); });
  }

  function renderRecent(messages) {
    if (!recentList) return;
    recentList.innerHTML = '';
    if (messages.length === 0) {
      recentList.innerHTML = '<p class="text-muted">No recent messages.</p>';
      return;
    }
    messages.forEach(function (m) { recentList.appendChild(renderMessageCard(m, 'recent')); });
  }

  // --- Message Card ---
  function renderMessageCard(m, context) {
    var preview = (m.content || '').slice(0, 160);
    if ((m.content || '').length > 160) preview += '…';

    var badges = '';
    if (m.is_flagged) badges += '<span class="badge badge-flagged">Flagged</span>';
    if (m.mood) badges += '<span class="badge badge-mood">' + escapeHtml(m.mood) + '</span>';
    if (m.one_time_use) badges += '<span class="badge badge-onetime">Rare</span>';
    if (m.sealed_until && new Date(m.sealed_until) > new Date()) badges += '<span class="badge badge-sealed">Sealed</span>';
    if (m.received_count != null) badges += '<span class="badge badge-reads">' + m.received_count + ' read' + (m.received_count === 1 ? '' : 's') + '</span>';

    var timeStr = formatDateTime(m.created_at);

    var actions = '';
    if (context === 'flagged') {
      actions =
        '<p class="message-actions">' +
        '<button type="button" class="btn-link admin-unflag" data-id="' + escapeAttr(m.id) + '">Unflag</button> ' +
        '<button type="button" class="btn-link btn-report admin-delete" data-id="' + escapeAttr(m.id) + '">Delete</button>' +
        '</p>';
    } else if (context === 'all') {
      var flagLabel = m.is_flagged ? 'Unflag' : 'Flag';
      var flagClass = m.is_flagged ? 'admin-unflag' : 'admin-flag';
      actions =
        '<p class="message-actions">' +
        '<button type="button" class="btn-link ' + flagClass + '" data-id="' + escapeAttr(m.id) + '">' + flagLabel + '</button> ' +
        '<button type="button" class="btn-link btn-report admin-delete" data-id="' + escapeAttr(m.id) + '">Delete</button>' +
        '</p>';
    }

    var div = document.createElement('div');
    div.className = 'admin-card';
    div.setAttribute('data-id', m.id);
    div.innerHTML =
      '<div class="message-meta">' + badges + '<span style="margin-left:auto;font-size:0.75rem">' + escapeHtml(timeStr) + '</span></div>' +
      '<div class="message-body">' + escapeHtml(preview) + '</div>' +
      actions;
    return div;
  }

  // --- Flagged ---
  function loadFlagged() {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = true;
    fetch('/api/admin/flagged', { headers: headers() })
      .then(function (r) {
        if (r.status === 401) { setStoredKey(''); showLogin('Invalid or expired secret.'); return null; }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        var messages = data.messages || [];
        var countText = messages.length + ' flagged message' + (messages.length === 1 ? '' : 's') + '.';
        if (data.consumedRareCount > 0) {
          countText += ' (' + data.consumedRareCount + ' consumed rare bottle' + (data.consumedRareCount === 1 ? '' : 's') + ' hidden)';
        }
        if (countEl) countEl.textContent = countText;
        if (messages.length === 0) {
          if (emptyEl) emptyEl.hidden = false;
          return;
        }
        messages.forEach(function (m) {
          listEl.appendChild(renderMessageCard(m, 'flagged'));
        });
        bindCardActions(listEl, 'flagged');
      })
      .catch(function () {
        if (countEl) countEl.textContent = 'Failed to load.';
      });
  }

  // --- All Messages ---
  function loadAllMessages(page) {
    if (!allList) return;
    allMessagesPage = page || 1;
    allList.innerHTML = '<p class="text-muted">Loading...</p>';
    if (allPagination) allPagination.innerHTML = '';
    if (allEmpty) allEmpty.hidden = true;

    var filter = msgFilter ? msgFilter.value : 'all';
    var search = msgSearch ? msgSearch.value.trim() : '';
    var url = '/api/admin/messages?page=' + allMessagesPage + '&limit=15&filter=' + encodeURIComponent(filter);
    if (search) url += '&search=' + encodeURIComponent(search);

    fetch(url, { headers: headers() })
      .then(function (r) {
        if (r.status === 401) { setStoredKey(''); showLogin('Session expired.'); return null; }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        allList.innerHTML = '';
        var messages = data.messages || [];
        if (messages.length === 0) {
          if (allEmpty) allEmpty.hidden = false;
          return;
        }
        messages.forEach(function (m) {
          allList.appendChild(renderMessageCard(m, 'all'));
        });
        bindCardActions(allList, 'all');
        renderPagination(data.page, data.totalPages, data.total);
      })
      .catch(function () {
        allList.innerHTML = '<p class="text-muted">Failed to load messages.</p>';
      });
  }

  function renderPagination(page, totalPages, total) {
    if (!allPagination || totalPages <= 1) return;
    allPagination.innerHTML = '';

    var prev = document.createElement('button');
    prev.textContent = 'Previous';
    prev.disabled = page <= 1;
    prev.addEventListener('click', function () { loadAllMessages(page - 1); });
    allPagination.appendChild(prev);

    var info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = 'Page ' + page + ' of ' + totalPages + ' (' + total + ' total)';
    allPagination.appendChild(info);

    var next = document.createElement('button');
    next.textContent = 'Next';
    next.disabled = page >= totalPages;
    next.addEventListener('click', function () { loadAllMessages(page + 1); });
    allPagination.appendChild(next);
  }

  // --- Actions ---
  function bindCardActions(container, context) {
    container.querySelectorAll('.admin-unflag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        doAction(btn.getAttribute('data-id'), 'unflag', context);
      });
    });
    container.querySelectorAll('.admin-flag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        doAction(btn.getAttribute('data-id'), 'flag', context);
      });
    });
    container.querySelectorAll('.admin-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm('Permanently delete this message?')) {
          doAction(btn.getAttribute('data-id'), 'delete', context);
        }
      });
    });
  }

  function doAction(id, action, context) {
    var apiAction = action === 'flag' ? 'flag' : action;
    if (action === 'flag') {
      fetch('/api/report', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id: id })
      }).then(function (r) { return r.json(); }).then(function () {
        if (context === 'all') loadAllMessages(allMessagesPage);
        loadFlagged();
        loadStats();
      }).catch(function () { alert('Request failed.'); });
      return;
    }
    fetch('/api/admin/flagged', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id: id, action: apiAction })
    })
      .then(function (r) {
        if (r.status === 401) { setStoredKey(''); showLogin('Session expired.'); return null; }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        if (data.error) { alert(data.error); return; }
        if (context === 'flagged') loadFlagged();
        if (context === 'all') loadAllMessages(allMessagesPage);
        loadStats();
      })
      .catch(function () { alert('Request failed.'); });
  }

  // --- Dashboard ---
  function loadDashboard() {
    loadStats();
    loadFlagged();
  }

  // --- Tabs ---
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      Object.keys(tabPanels).forEach(function (key) {
        if (tabPanels[key]) tabPanels[key].hidden = key !== target;
      });
      if (target === 'all') loadAllMessages(1);
    });
  });

  // --- Search & Filter ---
  if (msgSearch) {
    msgSearch.addEventListener('input', function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () { loadAllMessages(1); }, 400);
    });
  }
  if (msgFilter) {
    msgFilter.addEventListener('change', function () { loadAllMessages(1); });
  }

  // --- Login ---
  function handleLogin() {
    var key = keyInput ? keyInput.value.trim() : '';
    if (!key) {
      if (loginError) { loginError.hidden = false; loginError.textContent = 'Enter the admin secret.'; }
      return;
    }
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    setStoredKey(key);
    fetch('/api/admin/flagged', { headers: headers() })
      .then(function (r) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign in';
        if (r.status === 401) {
          setStoredKey('');
          showLogin('Invalid secret.');
          return;
        }
        showPanel();
      })
      .catch(function () {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign in';
        showLogin('Could not connect.');
      });
  }

  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (keyInput) {
    keyInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      setStoredKey('');
      if (keyInput) keyInput.value = '';
      showLogin();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      loadDashboard();
      var activeTab = document.querySelector('.admin-tab.active');
      if (activeTab && activeTab.getAttribute('data-tab') === 'all') loadAllMessages(allMessagesPage);
    });
  }

  // Auto-login if key stored
  if (getStoredKey()) {
    showPanel();
  } else {
    showLogin();
  }
})();
