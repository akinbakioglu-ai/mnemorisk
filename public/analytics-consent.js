/* MNEMORISK optional, first-party analytics preference. No analytics request
 * is made unless the visitor actively chooses Accept. Only this preference
 * (not an identity or activity history) is stored in localStorage.
 */
(() => {
  const host = document.currentScript;
  if (!host || host.dataset.analyticsEnabled !== 'true') return;
  const isEnglish = document.documentElement.lang === 'en';
  const KEY = 'mnemorisk_analytics_choice_v1';
  const policy = isEnglish ? '/en/kvkk/' : '/kvkk/';
  const strings = isEnglish ? {
    title:'Optional site statistics',
    body:'May we measure site usage (pages, countries, reading time and clicks) to improve MNEMORISK? No ads or analytics cookies. You may decline.',
    accept:'Accept analytics',reject:'Reject analytics',change:'Analytics preferences',saved:'Your analytics preference has been saved.'
  } : {
    title:'İsteğe bağlı site istatistikleri',
    body:'MNEMORİSK\'i geliştirmek için sayfa ziyaretleri, ülkeler, okuma süreleri ve tıklamaları ölçmemize izin verir misiniz? Reklam takibi ve analitik çerez yoktur. Reddedebilirsiniz.',
    accept:'İstatistiklere izin ver',reject:'İzin verme',change:'İstatistik tercihleri',saved:'İstatistik tercihiniz kaydedildi.'
  };
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const set = (value) => { try { localStorage.setItem(KEY,value); } catch {} };
  let choice = get();
  if (choice !== 'accepted' && choice !== 'rejected') choice = null;
  let started = false;
  function start() {
    if (started || navigator.globalPrivacyControl === true) return;
    started=true;
    const script=document.createElement('script');
    script.src='/analytics-client.js';
    script.defer=true;
    document.body.appendChild(script);
  }
  const footer=document.querySelector('.footer-legal');
  const manage=document.createElement('button');
  manage.type='button';manage.className='analytics-preferences-link';
  manage.textContent=strings.change;
  manage.style.cssText='background:none;color:inherit;border:0;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:0 0 0 15px;border-left:1px solid #658095;font-size:inherit';
  footer?.appendChild(manage);

  const panel=document.createElement('section');
  panel.id='analytics-consent-panel';
  panel.setAttribute('role','region');
  panel.setAttribute('aria-label',strings.title);
  panel.style.cssText='position:fixed;z-index:100;bottom:12px;left:12px;right:12px;max-width:560px;padding:20px;border:1px solid #cdd9df;background:#fff;color:#172b3e;box-shadow:0 7px 35px #092b4050;font:14px/1.6 Arial,Helvetica,sans-serif;border-radius:8px';
  const h=document.createElement('strong');h.textContent=strings.title;h.style.fontSize='17px';
  const description=document.createElement('p');description.textContent=strings.body;description.style.margin='9px 0 7px';
  const link=document.createElement('a');link.href=policy;link.textContent=isEnglish?'Read privacy notice':'KVKK ve gizlilik metnini oku';
  link.style.cssText='color:#15577c;text-decoration:underline';
  const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin-top:15px';
  function button(label) {const el=document.createElement('button');el.type='button';el.textContent=label;el.style.cssText='padding:10px 14px;border:1px solid #153c54;background:white;color:#153c54;cursor:pointer;font-weight:700;flex:1 1 160px';return el;}
  const reject=button(strings.reject);
  const accept=button(strings.accept);
  accept.style.background='#153c54';accept.style.color='white';
  row.append(reject,accept);panel.append(h,description,link,row);
  function close(){panel.remove();}
  function save(value) {
    choice=value;set(value);close();
    if(value==='accepted')start();
    // Refusing or withdrawing consent takes effect for subsequent requests.
    // An already running client may continue until the page reloads; reload to
    // guarantee that no further tracking takes place.
    if(value==='rejected' && started)location.reload();
  }
  reject.addEventListener('click',()=>save('rejected'));
  accept.addEventListener('click',()=>save('accepted'));
  manage.addEventListener('click',()=>{if(!panel.isConnected)document.body.appendChild(panel);});
  if(!choice)document.body.appendChild(panel);
  if(choice==='accepted')start();
})();