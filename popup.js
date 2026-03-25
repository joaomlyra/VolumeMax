// popup.js

let currentTabId = null;
let tabVolumes = {};

const slider = document.getElementById('volumeSlider');
const percentDisplay = document.getElementById('percentDisplay');
const tabTitleEl = document.getElementById('tabTitle');
const muteBtn = document.getElementById('muteBtn');
const resetBtn = document.getElementById('resetBtn');
const tabList = document.getElementById('tabList');

// --- Knob Canvas ---
const knob = document.getElementById('knobCanvas');
const ctx = knob.getContext('2d');

function drawKnob(percent) {
  const cx = 36, cy = 36, r = 28;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const valueAngle = startAngle + (percent / 600) * (endAngle - startAngle);

  ctx.clearRect(0, 0, 72, 72);

  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = '#2a2a4a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  const color = percent > 200 ? '#e74c3c' : percent > 100 ? '#f39c12' : '#6c63ff';
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, valueAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  const x2 = cx + Math.cos(valueAngle) * 18;
  const y2 = cy + Math.sin(valueAngle) * 18;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Knob drag
let dragging = false;
let lastY = 0;

knob.addEventListener('mousedown', (e) => { dragging = true; lastY = e.clientY; });
document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const delta = lastY - e.clientY;
  lastY = e.clientY;
  setVolume(Math.min(600, Math.max(0, parseInt(slider.value) + delta * 2)));
});
document.addEventListener('mouseup', () => { dragging = false; });
knob.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 5 : -5;
  setVolume(Math.min(600, Math.max(0, parseInt(slider.value) + delta)));
});

// --- Core volume logic ---
function setVolume(percent, save = true) {
  percent = Math.round(Math.max(0, Math.min(600, percent)));
  slider.value = percent;

  // Safe DOM update instead of innerHTML
  percentDisplay.textContent = '';
  percentDisplay.appendChild(document.createTextNode(String(percent)));
  const spanPct = document.createElement('span');
  spanPct.textContent = '%';
  percentDisplay.appendChild(spanPct);

  drawKnob(percent);
  updateSliderGradient(percent);
  updatePresetHighlight(percent);

  if (percent === 0) {
    muteBtn.textContent = '🔊 Unmute tab';
    muteBtn.classList.add('muted');
  } else {
    muteBtn.textContent = '🔇 Mute tab';
    muteBtn.classList.remove('muted');
  }

  if (currentTabId && save) {
    tabVolumes[currentTabId] = percent;
    saveAndApply(currentTabId, percent);
    updateTabListBadge(currentTabId, percent);
  }
}

function updateSliderGradient(percent) {
  const pct = (percent / 600) * 100;
  const color = percent > 200 ? '#e74c3c' : percent > 100 ? '#f39c12' : '#6c63ff';
  slider.style.background = 'linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + pct + '%, #2a2a4a ' + pct + '%, #2a2a4a 100%)';
}

function saveAndApply(tabId, percent) {
  const key = 'vol_' + tabId;
  const obj = {};
  obj[key] = percent;
  browser.storage.local.set(obj);
  browser.tabs.sendMessage(tabId, { type: 'SET_VOLUME', volume: percent / 100 })
    .catch(() => {
      browser.tabs.executeScript(tabId, { file: 'content.js' }).then(() => {
        setTimeout(() => {
          browser.tabs.sendMessage(tabId, { type: 'SET_VOLUME', volume: percent / 100 }).catch(() => {});
        }, 200);
      }).catch(() => {});
    });
}

slider.addEventListener('input', () => { setVolume(parseInt(slider.value)); });

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => { setVolume(parseInt(btn.dataset.v)); });
});

function updatePresetHighlight(percent) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.v) === percent);
  });
}

muteBtn.addEventListener('click', () => {
  const cur = parseInt(slider.value);
  setVolume(cur === 0 ? (tabVolumes[currentTabId] > 0 ? tabVolumes[currentTabId] : 100) : 0);
});

resetBtn.addEventListener('click', () => { setVolume(100); });

// --- Tab list ---
function buildTabList(tabs) {
  tabList.textContent = '';

  if (!tabs.length) {
    const msg = document.createElement('div');
    msg.style.cssText = 'color:#555;font-size:12px;padding:4px';
    msg.textContent = 'No tabs found';
    tabList.appendChild(msg);
    return;
  }

  tabs.forEach(tab => {
    const vol = tabVolumes[tab.id] ?? 100;
    const item = document.createElement('div');
    item.className = 'tab-item' + (tab.id === currentTabId ? ' active-tab' : '');
    item.dataset.tabId = tab.id;

    // Favicon
    if (tab.favIconUrl) {
      const img = document.createElement('img');
      img.className = 'tab-favicon';
      img.src = tab.favIconUrl;
      img.addEventListener('error', () => { img.style.display = 'none'; });
      item.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'tab-favicon-placeholder';
      placeholder.textContent = '🌐';
      item.appendChild(placeholder);
    }

    // Tab name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'tab-name';
    nameSpan.textContent = tab.title || tab.url || 'No title';
    item.appendChild(nameSpan);

    // Mini slider
    const miniSlider = document.createElement('input');
    miniSlider.type = 'range';
    miniSlider.className = 'tab-mini-slider';
    miniSlider.min = '0';
    miniSlider.max = '600';
    miniSlider.value = String(vol);
    miniSlider.dataset.tabId = String(tab.id);
    miniSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      const v = parseInt(e.target.value);
      tabVolumes[tab.id] = v;
      const b = document.getElementById('badge-' + tab.id);
      if (b) b.textContent = v + '%';
      saveAndApply(tab.id, v);
      if (tab.id === currentTabId) setVolume(v, false);
    });
    item.appendChild(miniSlider);

    // Badge
    const badge = document.createElement('span');
    badge.className = 'tab-vol-badge';
    badge.id = 'badge-' + tab.id;
    badge.textContent = vol + '%';
    item.appendChild(badge);

    item.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      browser.tabs.update(tab.id, { active: true });
      window.close();
    });

    tabList.appendChild(item);
  });
}

function updateTabListBadge(tabId, vol) {
  const badge = document.getElementById('badge-' + tabId);
  if (badge) badge.textContent = vol + '%';
  const mini = tabList.querySelector('[data-tab-id="' + tabId + '"]');
  if (mini) mini.value = vol;
}

// --- Init ---
async function init() {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
  currentTabId = activeTab.id;
  let title = activeTab.title || activeTab.url || '(no title)';
  if (title.length > 32) title = title.slice(0, 32) + '…';
  tabTitleEl.textContent = title;

  const allTabs = await browser.tabs.query({ currentWindow: true });
  const keys = allTabs.map(t => 'vol_' + t.id);
  const stored = await browser.storage.local.get(keys);

  allTabs.forEach(t => {
    tabVolumes[t.id] = stored['vol_' + t.id] ?? 100;
  });

  setVolume(tabVolumes[currentTabId], false);
  buildTabList(allTabs);
}

init();
