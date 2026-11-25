// Private, aggregate-only dashboard. Does not use a browser cookie or localStorage.
// Two independent gates: explicit enabled flag and a secret Basic auth password.
const enc = new TextEncoder();
const htmlEscape = v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
async function equalSecret(a,b) {
  if(typeof a!=='string'||typeof b!=='string'||a.length<32||b.length<32||a.length>512) return false;
  const [ha,hb]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);
  let diff=0;const x=new Uint8Array(ha),y=new Uint8Array(hb);
  for(let i=0;i<x.length;i++)diff|=x[i]^y[i];
  return diff===0;
}
const renderTable=(title,rows)=>`<section><h2>${htmlEscape(title)}</h2><table><thead><tr><th>Değer</th><th>Sayı</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${htmlEscape(r.label)}</td><td class="number">${Number(r.hits||0).toLocaleString('tr-TR')}</td></tr>`).join(''):'<tr><td colspan="2">Henüz veri yok</td></tr>'}</tbody></table></section>`;
export async function dashboard(request,env) {
  if(env.DASHBOARD_ENABLED!=='true')return new Response('Dashboard not enabled',{status:503});
  const host=new URL(request.url).hostname;
  if(host!=='stats.mnemorisk.org')return new Response('Not found',{status:404});
  const auth=request.headers.get('authorization')||'';
  let password='';
  if(auth.startsWith('Basic ')) {
    try {
      const decoded=atob(auth.slice(6));
      if(decoded.startsWith('mnemorisk:'))password=decoded.slice('mnemorisk:'.length);
    } catch {}
  }
  if(!await equalSecret(password,env.DASHBOARD_SECRET)) return new Response('Yetkilendirme gerekli.',{status:401,headers:{'www-authenticate':'Basic realm="MNEMORISK private statistics", charset="UTF-8"','cache-control':'no-store'}});
  if(!env.DB)return new Response('Missing database binding',{status:503});
  const now=new Date();
  const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)).toISOString().slice(0,10);
  const items=await env.DB.prepare(`SELECT day_utc, pageviews, visits, daily_unique_visitors, total_active_seconds, timed_pageviews
     FROM daily_site WHERE day_utc >= ? ORDER BY day_utc DESC LIMIT 65`).bind(start).all();
  const days=items.results||[];
  const sum=(field)=>days.reduce((n,row)=>n+Number(row[field]||0),0);
  const pageviews=sum('pageviews'),visits=sum('visits'),dailyUnique=sum('daily_unique_visitors');
  const avg=sum('timed_pageviews')?Math.round(sum('total_active_seconds')/sum('timed_pageviews')):0;
  const dimension=async(table,name)=> {
    const allowed=['daily_breakdown','daily_extra_breakdown'];
    if(!allowed.includes(table))return [];
    const result=await env.DB.prepare(`SELECT dimension_value AS label,SUM(pageviews) AS hits
      FROM ${table} WHERE day_utc >= ? AND dimension=? GROUP BY dimension_value
      HAVING SUM(pageviews)>=5 ORDER BY hits DESC LIMIT 12`).bind(start,name).all();
    return result.results||[];
  };
  const [pages,countries,referrers,regions,devices,contentLanguages,sources,scroll]=await Promise.all([
    dimension('daily_breakdown','page'),dimension('daily_breakdown','country'),
    dimension('daily_breakdown','referrer'),dimension('daily_extra_breakdown','region'),
    dimension('daily_extra_breakdown','device'),dimension('daily_extra_breakdown','content_language'),
    dimension('daily_extra_breakdown','campaign_source'),dimension('daily_extra_breakdown','scroll_band')
  ]);
  const eventResult=await env.DB.prepare(`SELECT event_type||': '||target AS label,SUM(event_count) AS hits FROM daily_events
      WHERE day_utc >= ? GROUP BY event_type,target HAVING SUM(event_count)>=5
      ORDER BY hits DESC LIMIT 15`).bind(start).all();
  const fmt=n=>Number(n||0).toLocaleString('tr-TR');
  const page=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive"><title>MNEMORİSK | Özel istatistik paneli</title>
  <style>body{background:#f4f7f9;color:#183a4c;font:15px/1.55 system-ui,sans-serif;margin:0}main{max-width:1120px;margin:38px auto;padding:0 20px}header{border-bottom:1px solid #d4e0e5;margin-bottom:25px}small{color:#5b6e79}.cards,.tables{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:15px}.cards>div,section{background:white;border:1px solid #d9e4ea;border-radius:10px;padding:17px}.cards strong{display:block;font-size:28px;margin-top:5px}table{border-collapse:collapse;width:100%}th,td{padding:8px 4px;border-bottom:1px solid #ebeff2;text-align:left;overflow-wrap:anywhere}th{font-size:12px;color:#617580}td.number,th:last-child{text-align:right}h2{font-size:17px}footer{margin:30px 0;color:#60717b;font-size:12px}</style></head><body><main>
  <header><h1>MNEMORİSK · Ziyaretçi istatistikleri</h1><p>Özel yönetici görünümü · ${htmlEscape(start)} tarihinden itibaren kesinleştirilmiş günlük özetler</p></header>
  <div class="cards"><div>Görüntüleme<strong>${fmt(pageviews)}</strong></div><div>Ziyaret<strong>${fmt(visits)}</strong></div>
  <div>Günlük tekil ziyaretçi-gün<strong>${fmt(dailyUnique)}</strong></div><div>Ortalama ölçülen etkin süre<strong>${fmt(avg)} sn</strong></div></div>
  <p><small>Günlük tekillerin toplamı dönem boyunca tekil kişi sayısı değildir. Eksik günler sıfır olarak yorumlanmamalıdır. Veriler yalnızca günlük kesinleştirme sonrasında görünür.</small></p>
  <div class="tables">${renderTable('En çok ziyaret edilen sayfalar',pages)}${renderTable('Ülkeler',countries)}
  ${renderTable('Yönlendirenler',referrers)}${renderTable('Bölgeler',regions)}
  ${renderTable('Cihaz türleri',devices)}${renderTable('İçerik dilleri',contentLanguages)}
  ${renderTable('Kampanya kaynakları',sources)}${renderTable('Kaydırma düzeyi',scroll)}
  ${renderTable('İndirmeler ve tıklamalar',eventResult.results||[])}</div>
  <footer>Yalnızca toplamlar gösterilir; beşten az görüntüleme/olay içeren kategoriler gizlenir. Çerez veya kalıcı ziyaretçi kimliği kullanılmaz.</footer></main></body></html>`;
  return new Response(page,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'private, no-store, max-age=0','x-robots-tag':'noindex, nofollow, noarchive','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}});
}
