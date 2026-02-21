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

  if (!form || !message) return;

  var moodChips = document.getElementById('mood-chips');
  if (moodChips) {
    MOODS.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mood-chip';
      btn.textContent = m.charAt(0).toUpperCase() + m.slice(1);
      btn.dataset.mood = m;
      btn.setAttribute('aria-pressed', 'false');
      moodChips.appendChild(btn);
    });
    moodChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.mood-chip');
      if (!chip) return;
      var wasSelected = chip.classList.contains('selected');
      moodChips.querySelectorAll('.mood-chip').forEach(function (c) {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      if (!wasSelected) {
        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');
      }
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
    var len = (message.value || '').length;
    charCount.textContent = len.toLocaleString();
    if (len > 950) {
      charCount.parentElement.style.color = len >= 1000 ? 'var(--color-error)' : '#c49a5a';
    } else {
      charCount.parentElement.style.color = '';
    }
  }

  message.addEventListener('input', updateCount);
  updateCount();

  message.addEventListener('focus', function () {
    if (formFeedback && !formFeedback.hidden) {
      formFeedback.hidden = true;
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = message.value.trim();
    if (!text) {
      formFeedback.textContent = 'Please write a message before sending.';
      formFeedback.className = 'error-message';
      formFeedback.hidden = false;
      message.focus();
      return;
    }
    formFeedback.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        formFeedback.textContent = result.error || 'Something went wrong. Please try again.';
        formFeedback.className = 'error-message';
        formFeedback.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send the bottle';
      }
    }).catch(function () {
      formFeedback.textContent = 'Network error. Please check your connection and try again.';
      formFeedback.className = 'error-message';
      formFeedback.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send the bottle';
    });
  });
})();
