(function () {
  'use strict';

  var form = document.getElementById('write-form');
  var message = document.getElementById('message');
  var charCount = document.getElementById('char-count');
  var submitBtn = document.getElementById('submit-btn');
  var formFeedback = document.getElementById('form-feedback');
  var successBox = document.getElementById('success-box');
  var statusLink = document.getElementById('status-link');

  function updateCount() {
    charCount.textContent = (message.value || '').length;
  }
  message.addEventListener('input', updateCount);
  updateCount();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = message.value.trim();
    if (!text) {
      formFeedback.textContent = 'Please write a message.';
      formFeedback.className = 'error-message';
      formFeedback.hidden = false;
      return;
    }
    formFeedback.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    window.BottledAPI.sendMessage(text).then(function (result) {
      if (result.success) {
        successBox.hidden = false;
        form.hidden = true;
        if (result.id) {
          if (statusLink) statusLink.href = '/status.html?id=' + encodeURIComponent(result.id);
          document.cookie = 'bottled_sent_id=' + encodeURIComponent(result.id) + '; path=/; max-age=' + (24 * 60 * 60) + '; SameSite=Lax';
        }
      } else {
        formFeedback.textContent = result.error || 'Something went wrong.';
        formFeedback.className = 'error-message';
        formFeedback.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send the bottle';
      }
    }).catch(function () {
      formFeedback.textContent = 'Network error. Try again.';
      formFeedback.className = 'error-message';
      formFeedback.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send the bottle';
    });
  });
})();
