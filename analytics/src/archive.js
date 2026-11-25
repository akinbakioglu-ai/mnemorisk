// Monthly, privacy-reduced CSV snapshots to a private Cloudflare R2 bucket.
// R2 objects must never be made public or served by this Worker.
const dateStr=d=>d.toISOString().slice(0,10);
const escapeCSV=v=>'"'+String(v??'').replaceAll('"','""').replace(/[\r\n]+/g,' ')+'"';
function csv(headers,rows) {
  return [headers.map(escapeCSV).join(','),...rows.map(row=>headers.map(k=>escapeCSV(row[k])).join(','))].join('\n')+'\n';
}
function priorMonth(day) {
  const [y,m]=day.split('-').map(Number),d=new Date(Date.UTC(y,m-1,0));
  const prefix=d.toISOString().slice(0,7);
  return {start:prefix+'-01',end:dateStr(d),prefix};
}
export async function archiveMonthly(env,date=new Date()) {
  if(env.ARCHIVE_ENABLED!=='true')return;
  if(!env.DB||!env.ARCHIVE)throw new Error('Archive D1/R2 binding missing');
  const today=dateStr(date);
  if(!today.endsWith('-05'))return; // Snapshot after previous month fully closed.
  const period=priorMonth(today);
  const root='monthly/'+period.prefix+'/';
  if(await env.ARCHIVE.head(root+'manifest.json'))return; // Idempotent archive.
  const params=[period.start,period.end];
  const daily=(await env.DB.prepare(`SELECT day_utc, pageviews, visits, daily_unique_visitors,
      total_active_seconds,timed_pageviews,measurement_version,computed_at
    FROM daily_site WHERE day_utc BETWEEN ? AND ? ORDER BY day_utc`).bind(...params).all()).results||[];
  const monthly=(await env.DB.prepare(`SELECT dimension,dimension_value AS label,SUM(pageviews) AS pageviews,
       SUM(total_active_seconds) AS active_seconds FROM daily_breakdown
    WHERE day_utc BETWEEN ? AND ? GROUP BY dimension,dimension_value
    HAVING SUM(pageviews) >= 5 ORDER BY dimension,pageviews DESC`).bind(...params).all()).results||[];
  const extra=(await env.DB.prepare(`SELECT dimension,dimension_value AS label,SUM(pageviews) AS pageviews,
       SUM(total_active_seconds) AS active_seconds FROM daily_extra_breakdown
    WHERE day_utc BETWEEN ? AND ? GROUP BY dimension,dimension_value
    HAVING SUM(pageviews) >= 5 ORDER BY dimension,pageviews DESC`).bind(...params).all()).results||[];
  const events=(await env.DB.prepare(`SELECT event_type AS dimension,target AS label,SUM(event_count) AS event_count FROM daily_events
    WHERE day_utc BETWEEN ? AND ? GROUP BY event_type,target
    HAVING SUM(event_count)>=5 ORDER BY dimension,event_count DESC`).bind(...params).all()).results||[];
  const expected=[];
  for(let d=period.start;d<=period.end;d=dateStr(new Date(Date.parse(d+'T00:00:00Z')+86400000)))expected.push(d);
  const present=new Set(daily.map(r=>r.day_utc));
  const missing=expected.filter(d=>!present.has(d));
  const opts={httpMetadata:{contentType:'text/csv; charset=utf-8'}};
  // Upload manifest last. If any CSV upload fails, rerun can safely replace incomplete CSVs.
  await env.ARCHIVE.put(root+'daily_site.csv',csv(['day_utc','pageviews','visits','daily_unique_visitors','total_active_seconds','timed_pageviews','measurement_version','computed_at'],daily),opts);
  await env.ARCHIVE.put(root+'monthly_breakdowns.csv',csv(['dimension','label','pageviews','active_seconds'],[...monthly,...extra]),opts);
  await env.ARCHIVE.put(root+'monthly_events.csv',csv(['dimension','label','event_count'],events),opts);
  const meta={
    project:'MNEMORISK',period_start:period.start,period_end:period.end,
    generated_at:new Date().toISOString(),daily_summary_days:daily.length,
    expected_days:expected.length,missing_days:missing,
    k_min:5,privacy:'Breakdowns with fewer than 5 views/events excluded; no raw event, IP, HMAC, or view IDs.',
    visitors_note:'Sum of daily_unique_visitors is visitor-days, not unique people over a month.',
    measurement_versions:[...new Set(daily.map(d=>d.measurement_version))],
    data_source:'Cloudflare D1 daily summaries; R2 private bucket'
  };
  await env.ARCHIVE.put(root+'manifest.json',JSON.stringify(meta,null,2),{httpMetadata:{contentType:'application/json; charset=utf-8'}});
  console.log('Monthly R2 CSV archive created',period.prefix,'missing_days',missing.length);
}
