// content.js — injected into every page to control audio via Web Audio API

(function () {
  if (window.__volumeMaxInitialized) return;
  window.__volumeMaxInitialized = true;

  let audioCtx = null;
  let gainNode = null;
  let currentVolume = 1.0;
  const processedNodes = new WeakSet();

  function getAudioContext() {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = currentVolume;
      gainNode.connect(audioCtx.destination);
    }
    return { audioCtx, gainNode };
  }

  function connectMediaElement(el) {
    if (processedNodes.has(el)) return;
    processedNodes.add(el);
    try {
      const { audioCtx, gainNode } = getAudioContext();
      const source = audioCtx.createMediaElementSource(el);
      source.connect(gainNode);
    } catch (e) {
      // Element may already be connected elsewhere — ignore
    }
  }

  function processAllMedia() {
    document.querySelectorAll('audio, video').forEach(connectMediaElement);
  }

  function setVolume(volume) {
    currentVolume = volume;
    if (gainNode) {
      gainNode.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01);
    }
    processAllMedia();
  }

  // Watch for new media elements added dynamically
  const observer = new MutationObserver(() => processAllMedia());
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  processAllMedia();

  // Listen for messages from popup
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SET_VOLUME') {
      setVolume(msg.volume);
      return Promise.resolve({ ok: true });
    }
    if (msg.type === 'GET_VOLUME') {
      return Promise.resolve({ volume: currentVolume });
    }
  });
})();
