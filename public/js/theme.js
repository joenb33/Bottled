(function () {
  'use strict';
  var KEY = 'bottled-theme';
  var DARK = 'dark';

  function apply(isDark) {
    document.body.classList.toggle('theme-dark', !!isDark);
    document.body.classList.toggle('scene-night', !!isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.textContent = isDark ? '☀' : '☾';
    }
  }

  function init() {
    var stored = localStorage.getItem(KEY);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === DARK || (stored !== 'light' && prefersDark);
    apply(isDark);

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var nowDark = !document.body.classList.contains('theme-dark');
        localStorage.setItem(KEY, nowDark ? DARK : 'light');
        apply(nowDark);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
