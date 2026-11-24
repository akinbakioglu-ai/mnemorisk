/* MNEMORISK engagement_v1: browser-memory only; not included in live layout.
 * Deploy only after the privacy notice, controller and transfer review.
 * No cookies, localStorage, sessionStorage, persistent IDs or full referrer URLs.
 */
(() => {
  if (navigator.globalPrivacyControl === true || navigator.webdriver === true) return;
  const endpoint = 'https://analytics.mnemorisk.org/collect';
  const viewId = crypto.randomUUID();
  const started = performance.now();
  let lastTick = started;
  let lastInteraction = started;
  let cumulativeMs = 0;
  let lastSentSeconds = -1;
  let lastMouse = 0;
  const eligible = () => document.visibilityState === 'visible' && document.hasFocus();
  const payload = (type) => JSON.stringify({
    type, view_id: viewId, page_path: location.pathname,
    referrer: document.referrer, active_seconds: Math.min(1800, Math.floor(cumulativeMs / 1000))
  });
  const send = (type) => {
    const body = payload(type);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }))) return;
      fetch(endpoint, { method: 'POST', body, headers: { 'content-type': 'text/plain' }, mode: 'cors', keepalive: true }).catch(() => {});
    } catch { /* Analytics must never block the public site. */ }
  };
  function tick() {
    const now = performance.now();
    if (eligible() && cumulativeMs < 1800000) {
      // Stop after 180 seconds without interaction, including reading without scrolling.
      const upper = Math.min(now, lastInteraction + 180000);
      cumulativeMs += Math.max(0, upper - lastTick);
      cumulativeMs = Math.min(cumulativeMs, 1800000);
    }
    lastTick = now;
    const seconds = Math.floor(cumulativeMs / 1000);
    if (seconds >= lastSentSeconds + 15) {
      lastSentSeconds = seconds;
      send('progress');
    }
  }
  function interacted() {
    tick();
    lastInteraction = performance.now();
  }
  for (const name of ['scroll', 'pointerdown', 'keydown', 'touchstart']) {
    addEventListener(name, interacted, { passive: true });
  }
  addEventListener('pointermove', () => {
    const now = performance.now();
    if (now - lastMouse > 3000) { lastMouse = now; interacted(); }
  }, { passive: true });
  addEventListener('visibilitychange', tick);
  addEventListener('focus', tick);
  addEventListener('blur', tick);
  addEventListener('pagehide', () => { tick(); send('progress'); });
  send('view');
  setInterval(tick, 15000);
})();
