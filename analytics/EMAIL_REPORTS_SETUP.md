# MNEMORİSK — Haftalık ve aylık e-posta raporlarının kurulumu

**Durum:** Kod GitHub'da hazır; Cloudflare hesabında Worker/D1, Email Service ve izinler henüz kurulmadı. `REPORTS_ENABLED = "false"` olduğu sürece gönderim yapılmaz. Mevcut GitHub Pages tasarımı ve sayfa kodu etkilenmez.

## Rapor planı

- **Alıcı:** `akin.bakioglu@erzincan.edu.tr` (Cloudflare'da doğrulanmalıdır).
- **Gönderici:** `reports@mnemorisk.org` (gönderici alan adı Cloudflare Email Service'de etkinleştirilmeli; adresin posta kutusu olması zorunlu olmayabilir).
- **Haftalık özet:** Pazartesi 07:15 UTC / Türkiye saati 10:15; tamamlanan önceki pazartesi–pazar günleri.
- **Aylık ayrıntı:** Her ayın 1'i 07:15 UTC / Türkiye saati 10:15; önceki takvim ayı.
- Saatler Cloudflare cron'un çalışmaya başladığı yaklaşık saatlerdir; gecikme olabilir. Gönderim günlüğü aynı dönem için yinelenen planlı gönderimleri engeller. İletim hataları `report_deliveries` tablosuna kaydedilir. Başarısız raporlar otomatik yeniden gönderilmez; hata incelemesi gerektirir.
- Raporlarda sayfa görüntüleme, 30 dakikalık oturum, günlük tekil **ziyaretçi-gün toplamı** (dönem boyunca gerçek tekil kişi değil), tahmini etkin süre, sayfalar, ülkeler, yönlendiren alan adları; aylık raporda ayrıca bölgeler, cihazlar, içerik dili, kampanya kaynakları, kaydırma bantları ve bağlantı olayları bulunur.
- E-postalar **yalnızca toplulaştırılmış veriler** taşır. Günlük HMAC, ham olay satırı, IP, sayfa görüntüleme kimliği veya tam URL gönderilmez. Bir kırılımda 5'ten az görüntüleme/olay varsa o satır e-postada gösterilmez.
- Tam günler için özet yoksa rapor boş günü sıfır ziyaret gibi göstermez; eksik tarihleri belirtir.

## Cloudflare etkinleştirme adımları

1. KVKK kapsamında işleme şartı ve yurt dışına aktarım değerlendirmesini netleştirin; analitik veri toplama ayrı olarak etkinleştirilmeden raporlama da veri üretemez.
2. Cloudflare hesabında **Workers & Pages → D1 SQL Database** üzerinden `mnemorisk-analytics` veritabanı oluşturun. `analytics/wrangler.toml` dosyasındaki `database_id` yer tutucusunu oluşturulan ID ile değiştirin.
3. Cloudflare Workers için `npx wrangler login` ardından `cd analytics` konumunda `npx wrangler d1 migrations apply mnemorisk-analytics --remote` çalıştırın. 0001, 0002, **0003_email_reports.sql** uygulanmalıdır.
4. `npx wrangler secret put HMAC_SECRET` ile en az 32 karakterlik kriptografik açıdan rastgele gizli anahtarı yalnızca Cloudflare'a kaydedin; GitHub'a yazmayın.
5. Cloudflare **Email → Email Service / Email Sending** bölümünde `mnemorisk.org` gönderici alan adını tanıtın; panelin gösterdiği DNS doğrulama/kimlik doğrulama adımlarını tamamlayın. **Mevcut GitHub Pages A/CNAME kayıtlarını değiştirmeyin.** Email Service'in istediği kayıtları ayrı ekleyin.
6. Cloudflare hesabında `akin.bakioglu@erzincan.edu.tr` adresini alıcı olarak doğrulayın; doğrulama e-postasının erişilebilir olduğundan emin olun. Ücretsiz Workers planında doğrulanmış alıcıyla gönderim desteklenir.
7. Wrangler'daki `[[send_email]]` bağının adı `EMAIL` ve `destination_address` alanının belirtilen kurumsal adres olduğundan emin olun. Gönderici `reports@mnemorisk.org` Email Service üzerinde yetkili olmalıdır.
8. Cloudflare Worker kodunu `npx wrangler deploy` ile yayımlayın; `[triggers]` tanımları bakım için günlük 00:20 UTC ve raporlar için günlük 07:15 UTC'yi çalıştıracaktır. Worker'ın kamuya açık `/collect` erişimi ancak veri işleme uygunluğu ve testler sonrasında etkinleşmelidir.
9. Gerçek alıcı ve gönderici doğrulaması ile gözetimli testler bittikten sonra `[vars] REPORTS_ENABLED = "true"` olarak değiştirip yeniden yayımlayın. Uygulamayı rapor döneminin sonunda en az bir günlük tam özet oluşturulmuşken doğrulayın.
10. Cloudflare Worker günlüklerinde hata kontrolü, D1'de `report_deliveries` tablosunda `sent` durumu ve kurumsal posta kutusunda teslimat doğrulamasını yapın. `sent` yalnızca Email Service'in gönderiyi kabul ettiğini gösterir, alıcıya teslimatı tek başına kanıtlamaz.

## İşletim ve önemli sınırlar

- Bu bir **ücretsiz plan üzerinde doğrulanmış alıcıya gönderim** tasarımıdır. Cloudflare'ın güncel kuralları değişebilir; ücretli abonelik gerekip gerekmediğini hizmet panelinden tekrar doğrulayın.
- E-posta gönderimi öncesinde D1 erişimi, Email Service bağının varlığı ve `REPORTS_ENABLED` kontrol edilir.
- Aynı döneme otomatik yinelenen rapor gönderimi engellenir. İlk gönderim `sending` durumunda takılırsa veya `error` durumuna düşerse *bilinçli* bir durum incelemesi gerekir; elle teslim kaydını değiştirmeyin.
- Otomatik arıza uyarıları, kendi kendine yeniden deneme ve aylık CSV arşivi ayrı iş kalemleridir; bu dosya onların kurulduğu anlamına gelmez.
- İşlem, yalnızca GitHub deposuna kod konularak çalışmaz. Cloudflare hesabında kaynakların oluşturulması ve e-posta gönderiminin etkinleştirilmesi gerekir.

## Resmî kaynaklar

- https://developers.cloudflare.com/email-service/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.cloudflare.com/d1/reference/migrations/
