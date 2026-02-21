(function () {
  'use strict';

  var path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('nav a').forEach(function (a) {
    var href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (path === href || (path.startsWith(href) && href !== '/')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  var toggle = document.querySelector('.nav-toggle');
  var linksInner = document.querySelector('.nav-links-inner');
  if (toggle && linksInner) {
    toggle.addEventListener('click', function () {
      var isOpen = linksInner.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '\u2715' : '\u2630';
    });
  }
})();
