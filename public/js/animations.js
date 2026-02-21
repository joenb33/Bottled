(function () {
  'use strict';

  function initOcean() {
    const container = document.querySelector('.ocean-container');
    if (!container || container.childElementCount > 0) return;
    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.className = 'ocean-wave';
      container.appendChild(wave);
    }
  }

  function revealBottle(el) {
    if (!el) return;
    el.classList.add('bottle-reveal');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-visible');
      });
    });
  }

  window.BottledAnimations = {
    initOcean: initOcean,
    revealBottle: revealBottle,
  };

  if (document.querySelector('.ocean-container')) {
    initOcean();
  }
})();
