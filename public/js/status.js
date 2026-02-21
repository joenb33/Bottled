(function () {
  'use strict';

  function getSentId() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('id');
    if (q) return q;
    var match = document.cookie.match(/bottled_sent_id=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  var statusMessage = document.getElementById('status-message');
  var id = getSentId();

  if (!id) {
    statusMessage.textContent = 'No bottle to check. Throw one first, then come back here.';
    statusMessage.className = '';
    return;
  }

  window.BottledAPI.getStatus(id).then(function (data) {
    if (data.found) {
      statusMessage.textContent = 'Your bottle was found ' + (data.count || 0) + ' time(s).';
      statusMessage.className = 'success-message';
    } else {
      statusMessage.textContent = 'Your bottle hasn’t been found yet. It’s still drifting.';
      statusMessage.className = '';
    }
  }).catch(function () {
    statusMessage.textContent = 'Couldn’t check. Try again later.';
    statusMessage.className = 'error-message';
  });
})();
