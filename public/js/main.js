(function () {
  'use strict';
  // Shared behavior: nav highlight, etc.
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('nav a').forEach(function (a) {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (path === href || (path.startsWith(href) && href !== '/')) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();
