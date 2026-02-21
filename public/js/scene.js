(function () {
  'use strict';

  var starsEl = document.getElementById('scene-stars');
  var moonEl = document.getElementById('scene-moon');
  if (!starsEl) return;

  var count = 85;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) count = 20;

  for (var i = 0; i < count; i++) {
    var s = document.createElement('div');
    s.className = 'scene-star';
    var size = Math.random() * 2.2 + 0.5;
    var d = (Math.random() * 7 + 5).toFixed(1);
    var o = (Math.random() * 0.45 + 0.12).toFixed(2);
    var delay = (Math.random() * 10).toFixed(1);
    s.style.cssText = [
      'width:' + size + 'px',
      'height:' + size + 'px',
      'top:' + (Math.random() * 62) + '%',
      'left:' + (Math.random() * 100) + '%',
      '--star-d:' + d + 's',
      '--star-o:' + o,
      'animation-delay:-' + delay + 's'
    ].join(';');
    starsEl.appendChild(s);
  }

  if (!moonEl) return;
  var tx = 0;
  var ty = 0;
  var cx = 0;
  var cy = 0;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  document.addEventListener('mousemove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 7;
    ty = (e.clientY / window.innerHeight - 0.5) * 5;
  });

  function tick() {
    cx = lerp(cx, tx, 0.04);
    cy = lerp(cy, ty, 0.04);
    starsEl.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    moonEl.style.transform = 'translateX(calc(-50% + ' + (cx * 0.35) + 'px)) translateY(' + (cy * 0.35) + 'px)';
    requestAnimationFrame(tick);
  }
  if (!reduceMotion) tick();
})();
