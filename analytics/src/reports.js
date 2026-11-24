// MNEMORİSK scheduled email reports — aggregate rows only, no event-level data.
const RECIPIENT = 'akin.bakioglu@erzincan.edu.tr';
const pad = (n) => String(n).padStart(2, '0');
const utcDay = (date) => date.toISOString().slice(0, 10);
const plusDays = (day, offset) => {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + offset);
  return utcDay(d);
};
function lastMonday(day) {
  const weekDay = new Date(day + 'T00:00:00Z').getUTCDay();
  return plusDays(day, -(weekDay + 6) % 7);
}
function lastMonth(day) {
  const [year, month] = day.split('-').map(Number);
  const end = new Date(Date.UTC(year, month - 1, 0));
  return { start: `${end.getUTCFullYear()}-${pad(end.getUTCMonth()+1)}-01`, end: utcDay(end) };
}
export function periodsFor(today) {
  const monday = lastMonday(today);
  const month = lastMonth(today);
  return [
    { kind:'weekly', start:plusDays(monday,-7), end:plusDays(monday,-1) },
    { kind:'monthly', ...month }
  ];
}
const numeric = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const fmt = (v) => new Intl.NumberFormat('tr-TR').format(numeric(v));
const secs = (v) => {
  const n = Math.round(numeric(v));
  return `${Math.floor(n/60)} dk ${n%60} sn`;
};
const escaped = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const display = (s, max=85) => escaped(String(s).slice(0,max));
async function readAll(db, sql, params) {
  const r = await db.prepare(sql).bind(...params).all();
  return r.results || [];
}
async function stats(db, period) {
  const params = [period.start,period.end];
  const days = await readAll(db,
    'SELECT day_utc,pageviews,visits,daily_unique_visitors,total_active_seconds,timed_pageviews FROM daily_site WHERE day_utc BETWEEN ? AND ? ORDER BY day_utc',params);
  const totals = days.reduce((acc,row) => {
    for (const field of ['pageviews','visits','daily_unique_visitors','total_active_seconds','timed_pageviews']) acc[field]+=numeric(row[field]);
    return acc;
  },{pageviews:0,visits:0,daily_unique_visitors:0,total_active_seconds:0,timed_pageviews:0});
  const breakdown = async (dimension,limit) =>
    readAll(db, `SELECT dimension_value AS label,SUM(pageviews) AS hits,SUM(total_active_seconds) AS seconds
    FROM ${['daily_breakdown','daily_extra_breakdown'].includes(dimension.table)?dimension.table:'daily_breakdown'}
    WHERE day_utc BETWEEN ? AND ? AND dimension = ?
    GROUP BY dimension_value HAVING SUM(pageviews) >= 5 ORDER BY hits DESC LIMIT ${limit}`,[...params,dimension.name]);
  const events = await readAll(db, `SELECT event_type,target,SUM(event_count) AS hits FROM daily_events
    WHERE day_utc BETWEEN ? AND ? GROUP BY event_type,target HAVING SUM(event_count) >= 5 ORDER BY hits DESC LIMIT 15`,params);
  const dates = new Set(days.map(x=>x.day_utc));
  const missing = [];
  for (let date=period.start;date<=period.end;date=plusDays(date,1)) if(!dates.has(date))missing.push(date);
  return {totals,days,missing,
    pages:await breakdown({table:'daily_breakdown',name:'page'},10),
    countries:await breakdown({table:'daily_breakdown',name:'country'},10),
    sources:await breakdown({table:'daily_breakdown',name:'referrer'},10),
    regions:await breakdown({table:'daily_extra_breakdown',name:'region'},10),
    devices:await breakdown({table:'daily_extra_breakdown',name:'device'},10),
    languages:await breakdown({table:'daily_extra_breakdown',name:'content_language'},10),
    campaigns:await breakdown({table:'daily_extra_breakdown',name:'campaign_source'},10),
    scroll:await breakdown({table:'daily_extra_breakdown',name:'scroll_band'},10),
    events};
}
const tableText = (heading,items) => '\n'+heading+'\n'+
  (items.length ? items.map(x=>`• ${String(x.label||x.target).slice(0,85)}: ${fmt(x.hits)}`).join('\n') : 'Ölçüm bulunmuyor')+'\n';
const tableHtml = (heading,items) =>
  `<h3>${escaped(heading)}</h3><table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:7px">Kategori</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:7px">Görüntüleme / olay</th></tr></thead><tbody>${
    items.length ? items.map(x=>`<tr><td style="padding:7px;border-bottom:1px solid #eee">${display(x.label||x.target)}</td><td style="text-align:right;padding:7px;border-bottom:1px solid #eee">${fmt(x.hits)}</td></tr>`).join('')
    : '<tr><td colspan="2">Ölçüm bulunmuyor</td></tr>'
  }</tbody></table>`;
function render(period,data) {
  const t = data.totals;
  const avg = t.timed_pageviews ? Math.round(t.total_active_seconds/t.timed_pageviews) : 0;
  const title = period.kind === 'weekly' ? 'Haftalık özet' : 'Aylık ayrıntılı rapor';
  const quality = data.missing.length
    ? `Veri kontrolü: ${data.missing.length} gün için kesinleştirilmiş günlük özet yok (${data.missing.join(', ')}). Bunlar sıfır ziyaret olarak yorumlanmamalıdır.`
    : 'Veri kontrolü: Her gün için günlük özet mevcut.';
  const base = [
    `MNEMORİSK — ${title}`,`Dönem (UTC): ${period.start} – ${period.end}`,
    `Sayfa görüntülemeleri: ${fmt(t.pageviews)}`,
    `Ziyaretler (30 dk oturum): ${fmt(t.visits)}`,
    `Günlük tekil ziyaretçi-gün toplamı: ${fmt(t.daily_unique_visitors)} (aylık/haftalık tekil kişi değildir)`,
    `Ortalama ölçülebilen etkin süre: ${secs(avg)}`,quality,
    tableText('En çok görüntülenen sayfalar',data.pages),
    tableText('Ülkeler',data.countries),
    tableText('Yönlendiren alan adları',data.sources),
  ];
  const sections = [
    ['Bölgeler',data.regions],['Cihaz türleri',data.devices],
    ['İçerik dilleri',data.languages],['Kampanya kaynakları',data.campaigns],
    ['Kaydırma derinliği bantları',data.scroll],
    ['Dosya indirme, harici tıklama ve dahili bağlantı olayları',data.events]
  ];
  if(period.kind==='monthly') for(const [label,rows] of sections) base.push(tableText(label,rows));
  const text=base.join('\n')+'\nNot: Botlar tümüyle ayıklanamaz. Etkin süre tahmindir. Düşük sayılı kırılımlar (5'ten az) e-postada gösterilmez. Veriler yalnızca toplulaştırılmıştır.\n';
  const html=`<div style="font:15px/1.55 Arial,sans-serif;color:#213e53;max-width:700px">
  <h2>MNEMORİSK — ${escaped(title)}</h2>
  <p><b>Dönem (UTC):</b> ${period.start} – ${period.end}</p>
  <p><b>Sayfa görüntülemeleri:</b> ${fmt(t.pageviews)}<br><b>Ziyaretler:</b> ${fmt(t.visits)}<br>
  <b>Günlük tekil ziyaretçi-gün toplamı:</b> ${fmt(t.daily_unique_visitors)}
  <br><b>Ortalama etkin süre:</b> ${secs(avg)}</p>
  <p><small>Günlük tekillerin toplamı, dönem boyunca tekil kişi sayısı değildir.</small></p>
  <p style="background:#f2f5f7;padding:12px">${escaped(quality)}</p>
  ${tableHtml('Sayfalar',data.pages)}
  ${tableHtml('Ülkeler',data.countries)}
  ${tableHtml('Yönlendiren kaynaklar',data.sources)}
  ${period.kind==='monthly' ? sections.map(([name,rows])=>tableHtml(name,rows)).join('') : ''}
  <p><small>Düşük sayılı kırılımlar (5'ten az) gösterilmez. Veriler toplulaştırılmıştır. Bot filtrelemesi ve süre ölçümü yaklaşık sonuçlar üretir.</small></p></div>`;
  return {subject:`MNEMORİSK | ${title} | ${period.start} – ${period.end}`,text,html};
}
async function claim(db,key,period) {
  const r=await db.prepare(`INSERT OR IGNORE INTO report_deliveries
   (report_key,period_start,period_end,kind,status,created_at)
   VALUES (?,?,?,?, 'sending', ?)`)
   .bind(key,period.start,period.end,period.kind,new Date().toISOString()).run();
  return r.meta?.changes === 1;
}
async function sendOne(env,period) {
  const key=`${period.kind}:${period.start}:${period.end}`;
  const sent=await env.DB.prepare('SELECT status FROM report_deliveries WHERE report_key = ?').bind(key).first();
  if(sent) return; // At most one automatic attempt per report; failed attempts require reviewed retry.
  const data=await stats(env.DB,period);
  const rendered=render(period,data);
  if(!await claim(env.DB,key,period)) return;
  try {
    const result=await env.EMAIL.send({
      to:RECIPIENT,
      from:'reports@mnemorisk.org',
      subject:rendered.subject,text:rendered.text,html:rendered.html
    });
    await env.DB.prepare(`UPDATE report_deliveries SET status='sent',sent_at=?,email_message_id=? WHERE report_key=?`)
      .bind(new Date().toISOString(),result.messageId,key).run();
  } catch(e) {
    console.error('MNEMORISK report dispatch failed',period.kind,String(e?.code||'unknown'));
    await env.DB.prepare(`UPDATE report_deliveries SET status='error',error_code=? WHERE report_key=?`)
      .bind(String(e?.code||'unknown').slice(0,60),key).run();
    throw e;
  }
}
export async function sendScheduledReports(env, date = new Date()) {
  if(env.REPORTS_ENABLED!=='true') return;
  if(!env.DB || !env.EMAIL) throw new Error('Reporting bindings missing');
  const today=utcDay(date);
  // Daily cron runs at 07:15 UTC. Weekly reports only Mondays; monthly on day 1.
  const periods=periodsFor(today);
  if(new Date(today+'T00:00:00Z').getUTCDay()===1) await sendOne(env,periods[0]);
  if(today.endsWith('-01')) await sendOne(env,periods[1]);
}
export const reportTesting = {periodsFor, render};
