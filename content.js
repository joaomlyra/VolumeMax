(() => {
  if (window.__volumeMaxInitialized) return;
  window.__volumeMaxInitialized = true;
  let audioCtx, gainNode, currentVolume = 1;
  const states = new WeakMap();
  const media = new Set();
  const roots = new WeakSet();
  const port = browser.runtime.connect({name: 'volumemax-media'});
  function report() {
    const active = [...media].filter(el => el.isConnected);
    try {
      port.postMessage({media: active.length,
        failed: active.filter(el => states.get(el).error).length,
        suspended: Boolean(active.length && audioCtx?.state === 'suspended')});
    } catch (_) { /* Reload the page after updating the extension. */ }
  }
  function resume() {
    if (audioCtx?.state === 'suspended') audioCtx.resume().then(report).catch(report);
  }
  function connect(el) {
    media.add(el);
    let state = states.get(el);
    if (!state) {
      state = {source: null, error: false, attempts: 0};
      states.set(el, state);
      for (const event of ['loadedmetadata', 'canplay', 'play']) {
        el.addEventListener(event, () => { connect(el); resume(); report(); });
      }
    }
    if (state.source || state.attempts >= 3) return;
    state.attempts++;
    try {
      if (!audioCtx) {
        audioCtx = new window.AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = currentVolume;
        gainNode.connect(audioCtx.destination);
        audioCtx.onstatechange = report;
      }
      // Preserve the original method, including Netflix: no domain/DRM ban.
      const source = audioCtx.createMediaElementSource(el);
      source.connect(gainNode);
      state.source = source;
      state.error = false;
    } catch (error) {
      state.error = true;
      console.warn('VolumeMax: não foi possível conectar o player.', error.name);
    }
  }
  function scan(root) {
    if (root.matches?.('audio,video')) connect(root);
    root.querySelectorAll?.('audio,video').forEach(connect);
    if (root.shadowRoot) observe(root.shadowRoot);
    root.querySelectorAll?.('*').forEach(el => { if (el.shadowRoot) observe(el.shadowRoot); });
  }
  function observe(root) {
    if (roots.has(root)) return;
    roots.add(root);
    scan(root);
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) scan(node);
      report();
    }).observe(root, {childList: true, subtree: true});
  }
  port.onMessage.addListener(msg => {
    if (!Number.isFinite(msg.volume)) return;
    currentVolume = Math.max(0, Math.min(6, msg.volume));
    if (gainNode) gainNode.gain.setTargetAtTime(currentVolume, audioCtx.currentTime, .01);
    scan(document);
    resume();
    report();
  });
  for (const event of ['pointerdown', 'keydown']) document.addEventListener(event, resume, true);
  observe(document);
  setInterval(() => {
    for (const el of media) if (!el.isConnected) media.delete(el);
    scan(document);
    report();
  }, 2000);
  report();
})();
