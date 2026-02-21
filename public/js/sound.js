(function () {
  'use strict';
  var KEY = 'bottled-sound';
  var ctx = null;
  var gainNode = null;
  var noise = null;

  function initAudio() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = ctx.createGain();
      gainNode.gain.value = 0.08;
      gainNode.connect(ctx.destination);
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function startNoise() {
    if (!initAudio() || !gainNode) return;
    if (noise) return;
    if (ctx.state === 'suspended') return;
    var bufferSize = 2 * ctx.sampleRate;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    noise.connect(filter);
    filter.connect(gainNode);
    noise.start(0);
  }

  function stopNoise() {
    if (noise) {
      try {
        noise.stop();
      } catch (e) {}
      noise = null;
    }
  }

  function setEnabled(enabled) {
    if (enabled) {
      initAudio();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(function () {
          startNoise();
        });
      } else {
        startNoise();
      }
      localStorage.setItem(KEY, '1');
    } else {
      stopNoise();
      localStorage.setItem(KEY, '0');
    }
  }

  function isEnabled() {
    return localStorage.getItem(KEY) === '1';
  }

  window.BottledSound = {
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    startNoise: startNoise,
    stopNoise: stopNoise,
  };
})();
