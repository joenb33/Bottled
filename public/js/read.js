(function () {
  'use strict';
  var OPENED_KEY = 'bottled-has-opened';

  var beforeFind = document.getElementById('before-find');
  var findBtn = document.getElementById('find-btn');
  var openStep = document.getElementById('open-step');
  var openBtn = document.getElementById('open-btn');
  var messageBox = document.getElementById('message-box');
  var messageText = document.getElementById('message-text');
  var messageDate = document.getElementById('message-date');
  var messageSeal = document.getElementById('message-seal');
  var noMessages = document.getElementById('no-messages');
  var reportBtn = document.getElementById('report-btn');
  var keepBtn = document.getElementById('keep-btn');
  var currentMessageId = null;
  var lastReceivedData = null;

  function showMessage(data) {
    lastReceivedData = data;
    currentMessageId = data.id || null;
    messageText.textContent = data.text || '';
    messageDate.textContent = data.date ? 'Found on ' + new Date(data.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    if (messageSeal) {
      if (data.mood) {
        messageSeal.hidden = false;
        messageSeal.innerHTML = '<span class="wax-seal seal-' + data.mood + '" aria-hidden="true"></span><span>' + (data.mood.charAt(0).toUpperCase() + data.mood.slice(1)) + '</span>';
      } else {
        messageSeal.hidden = true;
      }
    }
    messageBox.hidden = false;
    if (reportBtn && currentMessageId) reportBtn.hidden = false;
    var quoteEl = document.getElementById('message-quote');
    if (quoteEl && window.BottledQuotes) {
      quoteEl.textContent = window.BottledQuotes.random();
    }
    if (window.BottledAnimations && window.BottledAnimations.revealBottle) {
      window.BottledAnimations.revealBottle(messageBox);
    }
  }

  findBtn.addEventListener('click', function () {
    findBtn.disabled = true;
    findBtn.textContent = 'Finding…';
    noMessages.hidden = true;
    openStep.hidden = true;
    messageBox.hidden = true;
    if (reportBtn) {
      reportBtn.hidden = true;
      reportBtn.textContent = 'Report';
      reportBtn.disabled = false;
    }

    window.BottledAPI.receiveMessage().then(function (data) {
      findBtn.disabled = false;
      findBtn.textContent = 'Find a bottle';
      if (data.text != null && data.text !== '') {
        beforeFind.hidden = true;
        var firstTime = !localStorage.getItem(OPENED_KEY);
        if (firstTime && openStep && openBtn) {
          lastReceivedData = data;
          openStep.hidden = false;
          openBtn.onclick = function () {
            localStorage.setItem(OPENED_KEY, '1');
            openStep.hidden = true;
            showMessage(lastReceivedData);
          };
        } else {
          showMessage(data);
        }
      } else {
        noMessages.hidden = false;
      }
    }).catch(function () {
      findBtn.disabled = false;
      findBtn.textContent = 'Find a bottle';
      noMessages.textContent = 'Something went wrong. Try again.';
      noMessages.hidden = false;
    });
  });

  if (keepBtn) {
    keepBtn.addEventListener('click', function () {
      if (!lastReceivedData || !lastReceivedData.text) return;
      var text = lastReceivedData.text;
      var dateStr = lastReceivedData.date ? new Date(lastReceivedData.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
      var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var lines = escaped.split(/\n/);
      var tspan = lines.map(function (line, i) {
        return '<tspan x="24" dy="' + (i === 0 ? 0 : 1.2) + 'em">' + line + '</tspan>';
      }).join('');
      var height = Math.max(200, 90 + lines.length * 26);
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="' + height + '" viewBox="0 0 320 ' + height + '">' +
        '<rect width="320" height="' + height + '" fill="#F5EDD6" stroke="#1A3A5C" stroke-width="1"/>' +
        '<text x="24" y="36" font-family="Georgia, serif" font-size="14" fill="#1A3A5C" xml:space="preserve">' + tspan + '</text>' +
        (dateStr ? '<text x="24" y="' + (height - 24) + '" font-family="sans-serif" font-size="11" fill="#5a7a94">' + dateStr + ' — Bottled</text>' : '<text x="24" y="' + (height - 24) + '" font-family="sans-serif" font-size="11" fill="#5a7a94">Bottled</text>') +
        '</svg>';
      var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'bottle.svg';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (reportBtn) {
    reportBtn.addEventListener('click', function () {
      if (!currentMessageId || reportBtn.disabled) return;
      reportBtn.disabled = true;
      reportBtn.textContent = 'Reporting…';
      window.BottledAPI.reportMessage(currentMessageId).then(function (result) {
        reportBtn.textContent = result.success ? 'Reported' : 'Failed';
        if (result.success) reportBtn.hidden = true;
      }).catch(function () {
        reportBtn.disabled = false;
        reportBtn.textContent = 'Report';
      });
    });
  }
})();
