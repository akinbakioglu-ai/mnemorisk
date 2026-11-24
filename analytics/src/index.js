// MNEMORISK analytics collector. Intentionally not deployed by the site workflow.
// No cookies, sessionStorage, localStorage or raw IP persistence.
const ALLOWED_ORIGINS = new Set(['https://mnemorisk.org', 'https://www.mnemorisk.org']);
const BOT_UA = /bot|crawler|spider|headless|lighthouse|pagespeed|curl|wget|python-requests|go-http-client|facebookexternalhit|preview|slurp/i;
const json = (data, status = 200, origin = '') => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...(ALLOWED_ORIGINS.has(origin) ? { 'access-control-allow-origin': origin, 'vary': 'Origin' } : {})
  }
});

function safeReferrer(value) {
  if (!value || typeof value !== 'string' || value.length > 2048) return 'direct';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return 'direct';
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'mnemorisk.org' || hostname === 'www.mnemorisk.org') return 'internal';
    return /^[a-z0-9.-]{1,253}$/.test(hostname) ? hostname : 'other';
  } catch { return 'direct'; }
}
function safePath(path) {
  if (typeof path !== 'string' || path.length > 180 || !/^\/(?:[a-zA-Z0-9_~.%/-]*)$/.test(path) || path.includes('//') || path.includes('..')) return null;
  return path;
}
async function visitorKey(secret, day, ip, ua) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new TextEncoder().encode(day + '\n' + ip + '\n' + ua.slice(0, 180));
  const signature = await crypto.subtle.sign('HMAC', key, bytes);
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}
async function collect(request, env) {
  const origin = request.headers.get('origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'origin_not_allowed' }, 403);
  if (request.headers.get('sec-gpc') === '1') return json({ accepted: false }, 200, origin);
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT_UA.test(ua)) return json({ accepted: false }, 200, origin);
  if (!env.DB || !env.HMAC_SECRET || env.HMAC_SECRET.length < 32) return json({ error: 'not_configured' }, 503, origin);
  if (Number(request.headers.get('content-length') || 0) > 4096) return json({ error: 'payload_too_large' }, 413, origin);
  let data;
  try { data = await request.json(); } catch { return json({ error: 'invalid_json' }, 400, origin); }
  const viewId = data?.view_id;
  const path = safePath(data?.page_path);
  if (typeof viewId !== 'string' || !/^[0-9a-f-]{36}$/i.test(viewId) || !path || !['view', 'progress'].includes(data?.type)) return json({ error: 'invalid_event' }, 400, origin);
  const active = data.type === 'progress' ? data.active_seconds : 0;
  if (!Number.isInteger(active) || active < 0 || active > 1800) return json({ error: 'invalid_seconds' }, 400, origin);
  const now = new Date().toISOString();
  const day = now.slice(0, 10);
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!ip) return json({ error: 'missing_ip' }, 400, origin);
  const digest = await visitorKey(env.HMAC_SECRET, day, ip, ua);
  const country = typeof request.cf?.country === 'string' && /^[A-Z]{2}$/.test(request.cf.country) ? request.cf.country : 'ZZ';
  // A single browser page view gets an in-memory random ID. Replayed progress
  // is idempotent: store the maximum cumulative active time, not a sum.
  await env.DB.prepare(`
    INSERT INTO page_views (view_id,day_utc,first_seen_at,last_seen_at,visitor_key,page_path,country_code,referrer_domain,active_seconds)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(view_id) DO UPDATE SET
      last_seen_at = excluded.last_seen_at,
      active_seconds = MAX(page_views.active_seconds, excluded.active_seconds)
    WHERE page_views.day_utc = excluded.day_utc
      AND page_views.page_path = excluded.page_path
  `).bind(viewId, day, now, now, digest, path, country, safeReferrer(data.referrer), active).run();
  return json({ accepted: true }, 202, origin);
}
async function aggregateDay(db, day, computedAt) {
  const batch = [
    db.prepare(`INSERT OR REPLACE INTO daily_site
      (day_utc,pageviews,daily_unique_visitors,visits,total_active_seconds,timed_pageviews,computed_at,measurement_version)
      SELECT ?,COUNT(*),COUNT(DISTINCT visitor_key),
             (SELECT COUNT(*) FROM
               (SELECT visitor_key,first_seen_at,
                 LAG(first_seen_at) OVER (PARTITION BY visitor_key ORDER BY first_seen_at) AS prior
                FROM page_views WHERE day_utc = ? AND visitor_key IS NOT NULL)
              WHERE prior IS NULL OR (julianday(first_seen_at)-julianday(prior))*86400 > 1800),
             COALESCE(SUM(active_seconds),0),
             SUM(CASE WHEN active_seconds > 0 THEN 1 ELSE 0 END),?,'engagement_v1'
      FROM page_views WHERE day_utc = ?`).bind(day, day, computedAt, day),
    db.prepare('DELETE FROM daily_breakdown WHERE day_utc = ?').bind(day),
  ];
  for (const [dimension, column] of [['page', 'page_path'], ['country', 'country_code'], ['referrer', 'referrer_domain']]) {
    batch.push(db.prepare(`INSERT INTO daily_breakdown
      (day_utc,dimension,dimension_value,pageviews,daily_unique_visitors,total_active_seconds,timed_pageviews)
      SELECT ?, ?, ${column}, COUNT(*), COUNT(DISTINCT visitor_key),
             COALESCE(SUM(active_seconds),0), SUM(CASE WHEN active_seconds > 0 THEN 1 ELSE 0 END)
      FROM page_views WHERE day_utc = ? GROUP BY ${column}`).bind(day, dimension, day));
  }
  await db.batch(batch);
}
async function maintain(db) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const isoDayOffset = (n) => new Date(now.getTime() - n * 86400000).toISOString().slice(0, 10);
  // Rebuild all finished days that still have identifiers, including older
  // days after a scheduler outage. The limit bounds work per cron invocation.
  const days = await db.prepare('SELECT DISTINCT day_utc FROM page_views WHERE day_utc < ? AND visitor_key IS NOT NULL ORDER BY day_utc LIMIT 31')
    .bind(today).all();
  for (const row of days.results || []) await aggregateDay(db, row.day_utc, now.toISOString());
  // Visitor keys are erased only after their daily summary exists.
  await db.prepare(`UPDATE page_views SET visitor_key = NULL
    WHERE visitor_key IS NOT NULL AND day_utc < ?
      AND EXISTS (SELECT 1 FROM daily_site WHERE daily_site.day_utc = page_views.day_utc)`)
    .bind(isoDayOffset(14)).run();
  // Raw event data is kept for 180 days. Daily aggregate tables remain.
  await db.prepare(`DELETE FROM page_views WHERE day_utc < ?
    AND EXISTS (SELECT 1 FROM daily_site WHERE daily_site.day_utc = page_views.day_utc)`)
    .bind(isoDayOffset(180)).run();
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      try { await env.DB.prepare('SELECT 1 AS ok').first(); return json({ ok: true }); }
      catch { return json({ ok: false }, 503); }
    }
    if (url.pathname !== '/collect') return json({ error: 'not_found' }, 404);
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin') || '';
      return new Response(null, { status: 204, headers: {
        ...(ALLOWED_ORIGINS.has(origin) ? { 'access-control-allow-origin': origin } : {}),
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
        'vary': 'Origin'
      }});
    }
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    try { return await collect(request, env); }
    catch { return json({ error: 'write_failed' }, 503, request.headers.get('origin') || ''); }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(maintain(env.DB));
  }
};
