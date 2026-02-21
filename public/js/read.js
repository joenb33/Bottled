(function () {
  'use strict';

  var beforeFind = document.getElementById('before-find');
  var findBtn = document.getElementById('find-btn');
  var messageBox = document.getElementById('message-box');
  var messageText = document.getElementById('message-text');
  var messageDate = document.getElementById('message-date');
  var noMessages = document.getElementById('no-messages');
  var reportBtn = document.getElementById('report-btn');
  var currentMessageId = null;

  findBtn.addEventListener('click', function () {
    findBtn.disabled = true;
    findBtn.textContent = 'Finding…';
    noMessages.hidden = true;
    if (reportBtn) {
      reportBtn.hidden = true;
      reportBtn.textContent = 'Report';
      reportBtn.disabled = false;
    }

    window.BottledAPI.receiveMessage().then(function (data) {
      findBtn.disabled = false;
      findBtn.textContent = 'Find a bottle';
      if (data.text != null && data.text !== '') {
        currentMessageId = data.id || null;
        beforeFind.hidden = true;
        messageText.textContent = data.text;
        messageDate.textContent = data.date ? 'Found on ' + new Date(data.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
        messageBox.hidden = false;
        if (reportBtn && currentMessageId) {
          reportBtn.hidden = false;
        }
        if (window.BottledAnimations && window.BottledAnimations.revealBottle) {
          window.BottledAnimations.revealBottle(messageBox);
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
