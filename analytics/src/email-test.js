// One-time email transport check. Requires a separate Cloudflare Secret.
// No visitor data, no analytics, and never reflects the secret in responses.
const json = (value, status=200) => new Response(JSON.stringify(value), {
  status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
});
async function sameSecret(submitted, expected) {
  if (typeof submitted!=='string' || typeof expected!=='string' ||
      submitted.length<32 || submitted.length>256 || expected.length<32) return false;
  const enc=new TextEncoder();
  const [a,b]=await Promise.all([
    crypto.subtle.digest('SHA-256',enc.encode(submitted)),
    crypto.subtle.digest('SHA-256',enc.encode(expected))
  ]);
  const x=new Uint8Array(a),y=new Uint8Array(b);
  let diff=0;
  for(let i=0;i<x.length;i++) diff|=x[i]^y[i];
  return diff===0;
}
export async function emailTest(request,env) {
  if (request.method!=='POST') return json({error:'method_not_allowed'},405);
  if(!await sameSecret(request.headers.get('x-mnemorisk-test-key'),env.EMAIL_TEST_TOKEN))
    return json({error:'unauthorized'},401);
  if(!env.EMAIL || !env.DB) return json({error:'missing_binding'},503);
  // The unique record prevents accidental duplicate test mail on repeated clicks.
  const key='email-transport-test-v1';
  const r=await env.DB.prepare(`INSERT OR IGNORE INTO report_deliveries
    (report_key,period_start,period_end,kind,status,created_at)
    VALUES (?,'2026-11-25','2026-11-25','weekly','sending',?)`)
    .bind(key,new Date().toISOString()).run();
  if(r.meta?.changes!==1) return json({status:'already_requested'},409);
  try {
    const result=await env.EMAIL.send({
      to:'akin.bakioglu@erzincan.edu.tr',
      from:'reports@mnemorisk.org',
      subject:'MNEMORİSK — e-posta bağlantısı testi',
      text:'Bu mesaj MNEMORİSK analitik sisteminin e-posta gönderim bağlantısını test etmek için gönderildi. Ziyaretçi verisi içermemektedir. Otomatik raporlar henüz etkin değildir.',
      html:'<h2>MNEMORİSK — E-posta bağlantısı testi</h2><p>E-posta gönderim bağlantısı test edildi. Bu mesajda ziyaretçi verisi bulunmuyor. Haftalık ve aylık otomatik raporlar henüz etkin değildir.</p>'
    });
    await env.DB.prepare(`UPDATE report_deliveries
       SET status='sent',sent_at=?,email_message_id=?
       WHERE report_key=?`)
       .bind(new Date().toISOString(),result.messageId||null,key).run();
    return json({status:'accepted_for_delivery'});
  } catch(error) {
    const code=typeof error?.code==='string' ? error.code.slice(0,60):'send_failed';
    await env.DB.prepare(`UPDATE report_deliveries
      SET status='error',error_code=? WHERE report_key=?`).bind(code,key).run();
    return json({error:'send_failed',code},502);
  }
}
