(function () {
  'use strict';

  var MOODS = ['hopeful', 'lonely', 'grateful', 'curious', 'peaceful', 'adventurous', 'quiet', 'brave'];
  var form = document.getElementById('write-form');
  var message = document.getElementById('message');
  var charCount = document.getElementById('char-count');
  var submitBtn = document.getElementById('submit-btn');
  var formFeedback = document.getElementById('form-feedback');
  var successBox = document.getElementById('success-box');
  var sealCheck = document.getElementById('seal-days-check');
  var sealDaysInput = document.getElementById('seal-days');

  var moodChips = document.getElementById('mood-chips');
  if (moodChips) {
    MOODS.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mood-chip';
      btn.textContent = m.charAt(0).toUpperCase() + m.slice(1);
      btn.dataset.mood = m;
      moodChips.appendChild(btn);
    });
    moodChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.mood-chip');
      if (!chip) return;
      moodChips.querySelectorAll('.mood-chip').forEach(function (c) { c.classList.remove('selected'); });
      chip.classList.add('selected');
    });
  }
  if (sealCheck && sealDaysInput) {
    sealCheck.addEventListener('change', function () {
      sealDaysInput.disabled = !sealCheck.checked;
    });
  }

  function getSelectedMood() {
    var sel = moodChips && moodChips.querySelector('.mood-chip.selected');
    return sel ? sel.dataset.mood : null;
  }

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

    var sealDays = (sealCheck && sealCheck.checked && sealDaysInput) ? parseInt(sealDaysInput.value, 10) : 0;
    var oneTime = document.getElementById('one-time') && document.getElementById('one-time').checked;
    var opts = { mood: getSelectedMood(), seal_days: sealDays || undefined, one_time: !!oneTime };

    window.BottledAPI.sendMessage(text, opts).then(function (result) {
      if (result.success) {
        successBox.hidden = false;
        form.hidden = true;
        var quoteEl = document.getElementById('success-quote');
        if (quoteEl && window.BottledQuotes) {
          quoteEl.textContent = window.BottledQuotes.random();
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
