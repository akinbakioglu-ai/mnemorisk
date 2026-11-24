/* MNEMORISK engagement_v1 — dormant until explicitly enabled.
 * Browser-memory-only analytics: no cookies, sessionStorage or localStorage.
 * Do not capture IPs, query strings, URL fragments, identifiers or free-form searches.
 */
(() => {
  if (navigator.globalPrivacyControl === true || navigator.webdriver === true) return;
  const endpoint = 'https://analytics.mnemorisk.org/collect';
  const viewId = crypto.randomUUID();
  const pagePath = location.pathname;
  const allowedPath = (path) => typeof path === 'string'
    && path.length <= 180 && /^\/[a-zA-Z0-9_~.%/-]*$/.test(path)
    && !path.includes('//') && !path.includes('..');
  if (!allowedPath(pagePath)) return;

  function internalEntry() {
    if (!document.referrer) return 'direct';
    try {
      const url = new URL(document.referrer);
      const currentHost = location.hostname.replace(/^www\./, '').toLowerCase();
      const sourceHost = url.hostname.replace(/^www\./, '').toLowerCase();
      return sourceHost === currentHost && allowedPath(url.pathname) ? url.pathname : 'direct';
    } catch { return 'direct'; }
  }
  const params = new URLSearchParams(location.search);
  const tag = (name) => {
    const val = params.get(name);
    return val && /^[a-zA-Z0-9_-]{1,48}$/.test(val) ? val.toLowerCase() : 'none';
  };
  const agent = navigator.userAgent || '';
  const deviceType = /ipad|tablet|playbook|silk/i.test(agent)
    || (/android/i.test(agent) && !/mobile/i.test(agent)) ? 'tablet'
    : /mobi|iphone|ipod|android/i.test(agent) ? 'mobile' : 'desktop';
  const base = {
    view_id: viewId,
    page_path: pagePath,
    referrer: document.referrer,
    device_type: deviceType,
    browser_language: (navigator.language || '').toLowerCase().split('-')[0],
    content_language: document.documentElement.lang?.toLowerCase().split('-')[0] || 'und',
    campaign_source: tag('utm_source'),
    campaign_medium: tag('utm_medium'),
    campaign_name: tag('utm_campaign'),
    entry_page_path: internalEntry()
  };
  let lastTick = performance.now();
  let lastInteraction = lastTick;
  let accumulatedMs = 0;
  let maxDepth = 0;
  let lastSentSeconds = -1;
  let lastMouse = 0;
  let isCounting = document.visibilityState === 'visible' && document.hasFocus();

  const transmit = (message) => {
    const body = JSON.stringify({ ...base, ...message });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint,
        new Blob([body], { type: 'text/plain' }))) return;
      fetch(endpoint, {
        method: 'POST', body, headers: { 'content-type': 'text/plain' },
        mode: 'cors', keepalive: true
      }).catch(() => {});
    } catch { /* Analytics errors never block the website. */ }
  };
  const currentSeconds = () => Math.min(1800, Math.floor(accumulatedMs / 1000));
  function scrollDepth() {
    const scrollable = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const percent = scrollable > 0 ? Math.round(100 * Math.max(0, scrollY) / scrollable) : 100;
    maxDepth = Math.max(maxDepth, Math.max(0, Math.min(100, percent)));
  }
  function tick() {
    const now = performance.now();
    if (isCounting && accumulatedMs < 1800000) {
      accumulatedMs += Math.max(0, Math.min(now, lastInteraction + 180000) - lastTick);
      accumulatedMs = Math.min(accumulatedMs, 1800000);
    }
    lastTick = now;
    const seconds = currentSeconds();
    if (seconds >= lastSentSeconds + 15) {
      lastSentSeconds = seconds;
      transmit({ type: 'progress', active_seconds: seconds, scroll_depth: maxDepth });
    }
  }
  const interacted = () => { tick(); lastInteraction = performance.now(); };
  for (const name of ['pointerdown', 'keydown', 'touchstart']) {
    addEventListener(name, interacted, { passive: true });
  }
  addEventListener('scroll', () => { interacted(); scrollDepth(); }, { passive: true });
  addEventListener('pointermove', () => {
    const now = performance.now();
    if (now - lastMouse > 3000) { lastMouse = now; interacted(); }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    tick();
    isCounting = document.visibilityState === 'visible' && document.hasFocus();
    lastTick = performance.now();
    if (!isCounting) transmit({ type: 'progress', active_seconds: currentSeconds(), scroll_depth: maxDepth });
  });
  addEventListener('focus', () => { tick(); isCounting = document.visibilityState === 'visible'; lastTick = performance.now(); });
  addEventListener('blur', () => {
    tick(); isCounting = false; lastTick = performance.now();
    transmit({ type: 'progress', active_seconds: currentSeconds(), scroll_depth: maxDepth });
  });
  document.addEventListener('click', (event) => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    let target;
    try { target = new URL(anchor.href, location.href); } catch { return; }
    if (!['http:', 'https:'].includes(target.protocol)) return;
    const currentHost = location.hostname.replace(/^www\./, '').toLowerCase();
    const sourceHost = target.hostname.replace(/^www\./, '').toLowerCase();
    const inside = sourceHost === currentHost;
    const downloading = anchor.hasAttribute('download')
      || /\.(?:pdf|docx?|xlsx?|csv|zip|pptx?|txt|md)$/i.test(target.pathname);
    const type = downloading ? 'download' : inside ? 'navigation' : 'external';
    const destination = inside ? (allowedPath(target.pathname) ? target.pathname : null)
      : downloading ? 'external-file' : /^[a-z0-9.-]{1,180}$/i.test(target.hostname) ? target.hostname.toLowerCase() : null;
    if (!destination) return;
    transmit({ type: 'event', event_id: crypto.randomUUID(), event_type: type, target: destination });
  }, { capture: true, passive: true });
  scrollDepth();
  transmit({ type: 'view', scroll_depth: maxDepth });
  setInterval(tick, 15000);
  addEventListener('pagehide', () => {
    tick();
    scrollDepth();
    transmit({ type: 'progress', active_seconds: currentSeconds(), scroll_depth: maxDepth });
  });
})();
