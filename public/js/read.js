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
      var lines = text.split(/\n/);
      var lineHeight = 22;
      var padding = 24;
      var width = 320;
      var maxWidth = width - padding * 2;
      var scale = 2;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      ctx.font = '14px Georgia, serif';
      var drawnLines = [];
      lines.forEach(function (line) {
        if (!line.length) {
          drawnLines.push('');
          return;
        }
        var words = line.split(/\s+/);
        var run = '';
        for (var i = 0; i < words.length; i++) {
          var test = run + (run ? ' ' : '') + words[i];
          if (ctx.measureText(test).width > maxWidth && run) {
            drawnLines.push(run);
            run = words[i];
          } else {
            run = test;
          }
        }
        if (run) drawnLines.push(run);
      });
      var bodyHeight = drawnLines.length * lineHeight;
      var height = Math.max(200, 80 + bodyHeight + 40);
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.fillStyle = '#F5EDD6';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#1A3A5C';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);
      ctx.fillStyle = '#1A3A5C';
      ctx.font = '14px Georgia, serif';
      var y = 36;
      drawnLines.forEach(function (line) {
        ctx.fillText(line || ' ', padding, y);
        y += lineHeight;
      });
      ctx.fillStyle = '#5a7a94';
      ctx.font = '11px sans-serif';
      ctx.fillText(dateStr ? dateStr + ' — Bottled' : 'Bottled', padding, height - 20);
      var dataUrl = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'bottle.png';
      a.click();
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
