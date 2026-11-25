// Monthly privacy-reduced CSV snapshots to a separate PRIVATE GitHub repository.
// GitHub token is a Cloudflare Secret and must be scoped to that repo only.
const dateStr=d=>d.toISOString().slice(0,10);
const escapeCSV=v=>'"'+String(v??'').replaceAll('"','""').replace(/[\r\n]+/g,' ')+'"';
function csv(headers,rows) {
  return [headers.map(escapeCSV).join(','),...rows.map(row=>headers.map(k=>escapeCSV(row[k])).join(','))].join('\n')+'\n';
}
const TARGET_REPO = 'akinbakioglu-ai/mnemorisk-analytics-archive';
const API = 'https://api.github.com';
function encodeBase64(text) {
  const bytes=new TextEncoder().encode(text);
  let result='';
  for(let i=0;i<bytes.length;i+=8192) {
    result+=String.fromCharCode(...bytes.subarray(i,i+8192));
  }
  return btoa(result);
}
async function github(env,method,path,body) {
  const response=await fetch(API+path,{
    method,
    headers:{
      'Authorization':'Bearer '+env.GITHUB_ARCHIVE_TOKEN,
      'Accept':'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28',
      'User-Agent':'MNEMORISK-private-monthly-archiver',
      ...(body?{'Content-Type':'application/json'}:{})
    },
    ...(body?{body:JSON.stringify(body)}:{})
  });
  if(!response.ok) {
    // Do not log tokens, request bodies, or private repository contents.
    const err=new Error('GitHub archive request failed: '+method+' HTTP '+response.status);
    err.status=response.status;
    throw err;
  }
  return response.json();
}
const repoPath=()=>'/repos/'+TARGET_REPO;
async function getExisting(env,path) {
  try {return await github(env,'GET',repoPath()+'/contents/'+path);}
  catch(error){if(error.status===404)return null;throw error;}
}
async function uploadOnce(env,path,content) {
  if(await getExisting(env,path))return;
  await github(env,'PUT',repoPath()+'/contents/'+path,{
    message:'Archive MNEMORISK monthly aggregate: '+path,
    content:encodeBase64(content),
    branch:'main'
  });
}
function priorMonth(day) {
  const [y,m]=day.split('-').map(Number),d=new Date(Date.UTC(y,m-1,0));
  const prefix=d.toISOString().slice(0,7);
  return {start:prefix+'-01',end:dateStr(d),prefix};
}
export async function archiveMonthly(env,date=new Date()) {
  if(env.ARCHIVE_ENABLED!=='true')return;
  if(!env.DB || typeof env.GITHUB_ARCHIVE_TOKEN!=='string' || env.GITHUB_ARCHIVE_TOKEN.length<20)
    throw new Error('Archive DB/GitHub secret missing');
  const today=dateStr(date);
  if(!today.endsWith('-05'))return; // Snapshot after previous month fully closed.
  const period=priorMonth(today);
  const root='monthly/'+period.prefix+'/';
  // Never write into a public repository even if configured incorrectly.
  const info=await github(env,'GET',repoPath());
  if(info.private!==true || info.full_name!==TARGET_REPO || info.default_branch!=='main')
    throw new Error('Archive target must be the intended private repository with main branch');
  if(await getExisting(env,root+'manifest.json'))return; // Idempotent archive.
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
  if(!daily.length) return; // Do not create fictitious empty reports before collection.
  // Upload manifest last. If any CSV upload fails, rerun can safely replace incomplete CSVs.
  await uploadOnce(env,root+'daily_site.csv',csv(['day_utc','pageviews','visits','daily_unique_visitors','total_active_seconds','timed_pageviews','measurement_version','computed_at'],daily));
  await uploadOnce(env,root+'monthly_breakdowns.csv',csv(['dimension','label','pageviews','active_seconds'],[...monthly,...extra]));
  await uploadOnce(env,root+'monthly_events.csv',csv(['dimension','label','event_count'],events));
  const meta={
    project:'MNEMORISK',period_start:period.start,period_end:period.end,
    generated_at:new Date().toISOString(),daily_summary_days:daily.length,
    expected_days:expected.length,missing_days:missing,
    k_min:5,privacy:'Breakdowns with fewer than 5 views/events excluded; no raw event, IP, HMAC, or view IDs.',
    visitors_note:'Sum of daily_unique_visitors is visitor-days, not unique people over a month.',
    measurement_versions:[...new Set(daily.map(d=>d.measurement_version))],
    data_source:'Cloudflare D1 daily summaries; private GitHub repository'
  };
  await uploadOnce(env,root+'manifest.json',JSON.stringify(meta,null,2)+'\\n');
  console.log('Monthly private GitHub CSV archive created',period.prefix,'missing_days',missing.length);
}
