(function () {
  'use strict';
  var el = document.getElementById('live-count');
  if (!el) return;
  fetch('/api/count')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var n = typeof data.count === 'number' ? data.count : 0;
      el.textContent = n.toLocaleString() + ' bottle' + (n === 1 ? '' : 's') + ' drifting in the sea right now.';
    })
    .catch(function () {
      el.textContent = 'Bottles drifting in the sea.';
    });
})();
