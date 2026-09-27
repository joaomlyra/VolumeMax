// Per-tab state is kept only for the current browser session.
const frames = new Map();
const values = new Map();
const ready = browser.storage.session.get(null).then(saved => {
  for (const [key, value] of Object.entries(saved)) if (key.startsWith('vol_')) values.set(Number(key.slice(4)), value);
});
function getState(id) {
  const reports = [...(frames.get(id)?.values() || [])];
  return {percent: values.get(id) ?? 100, frames: reports.length,
    media: reports.reduce((n, s) => n + (s.media || 0), 0),
    failed: reports.reduce((n, s) => n + (s.failed || 0), 0),
    suspended: reports.some(s => s.suspended)};
}
browser.runtime.onConnect.addListener(port => {
  if (port.name !== 'volumemax-media' || !port.sender.tab) return;
  const id = port.sender.tab.id;
  if (!frames.has(id)) frames.set(id, new Map());
  const group = frames.get(id);
  group.set(port, {});
  port.onMessage.addListener(report => group.set(port, report));
  port.onDisconnect.addListener(() => { group.delete(port); if (!group.size && frames.get(id) === group) frames.delete(id); });
  ready.then(() => { if (group.has(port)) port.postMessage({volume: (values.get(id) ?? 100) / 100}); }).catch(console.error);
});
browser.runtime.onMessage.addListener((msg, sender) => {
  if (sender.tab || !['VM_SET', 'VM_GET'].includes(msg.type) || !Number.isInteger(msg.tabId)) return;
  return ready.then(async () => {
    if (msg.type === 'VM_SET') {
      if (!Number.isFinite(msg.percent)) throw new Error('Volume inválido');
      const percent = Math.round(Math.max(0, Math.min(600, msg.percent)));
      values.set(msg.tabId, percent);
      for (const port of frames.get(msg.tabId)?.keys() || []) {
        try { port.postMessage({volume: percent / 100}); } catch (_) { frames.get(msg.tabId)?.delete(port); }
      }
      await browser.storage.session.set({['vol_' + msg.tabId]: percent});
    }
    return getState(msg.tabId);
  });
});
browser.tabs.onRemoved.addListener(id => {
  frames.delete(id);
  ready.then(() => { values.delete(id); return browser.storage.session.remove('vol_' + id); }).catch(console.error);
});
