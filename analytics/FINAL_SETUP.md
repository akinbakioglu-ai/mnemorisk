# MNEMORİSK — Son teknik kurulum (KVKK tamamlanana kadar kapalı)

## Şimdiki durum
- Worker, D1, Email Service ve HMAC Secret bağlandı.
- GitHub Pages sitede analitik kod yalnızca **GitHub Actions repository variable** `PUBLIC_ANALYTICS_ENABLED=true` olduğunda yüklenir; varsayılan `false`.
- Worker `COLLECTION_ENABLED=false` ile ziyaret olaylarını reddeder.
- E-posta raporları `REPORTS_ENABLED=false`, panel `DASHBOARD_ENABLED=false`, arşiv `ARCHIVE_ENABLED=false`.
- Hiçbiri KVKK / yurt dışına aktarım değerlendirmesi tamamlanmadan açılmamalıdır.

## 1. Worker alan adı (koleksiyon henüz kapalı)
Cloudflare: Workers & Pages → mnemorisk-analytics → Domains → Add custom domain:
`analytics.mnemorisk.org` → Worker `mnemorisk-analytics`.
Bu, GitHub Pages apex alan adını değiştirmez. Cloudflare alan adını ve DNS kaydını oluşturur. Test: `https://analytics.mnemorisk.org/health` yanıtında `{"ok":true}`. `/collect` ise KVKK öncesinde `collection_disabled` vermelidir. Mevcut GitHub Pages A/CNAME kayıtlarını silmeyin.

## 2. Özel istatistik paneli
Aynı Worker için ikinci custom domain `stats.mnemorisk.org` ekleyin.
**Cloudflare Access** → Applications → Add application → Self-hosted → `stats.mnemorisk.org`, allowed email: `akin.bakioglu@erzincan.edu.tr`. Sadece bu adres Allow policy içinde bulunsun. Giriş yöntemini bu adres üzerinden tek kullanımlık PIN veya uygun IdP ile doğrulayın. **Access etkin olmadan paneli açmayın.**
Worker → Settings → Variables and Secrets → Secret:
`DASHBOARD_SECRET` (rastgele en az 32 karakter; `HMAC_SECRET` veya `EMAIL_TEST_TOKEN` ile aynı olmamalı).
Cloudflare Access korumasına **ek olarak** panel HTTPS Basic auth ister: kullanıcı `mnemorisk`, parola `DASHBOARD_SECRET` değeri.
Worker'ın `wrangler.toml` yapılandırmasında `DASHBOARD_ENABLED="true"` yapılıp dağıtıldığında panel `https://stats.mnemorisk.org/dashboard` adresinde görülür. Worker, farklı hostname üzerinden gelen /dashboard isteklerini 404 ile reddeder. Panel yalnızca günlük kesinleştirilmiş özetleri görüntüler; küçük kırılımları (5'ten az) gizler.

## 3. Aylık CSV arşivi (private R2)
Cloudflare → R2 Object Storage → Create bucket: `mnemorisk-private-archive`.
**Public access = disabled** (r2.dev ve Custom Domain yok). Kullanılabilir EU bölgesi/jurisdiction seçeneği görünürse, aktarım incelemesine uygun olanı kullanın.
Worker → Settings → Bindings → Add binding → R2 bucket → variable `ARCHIVE`, bucket `mnemorisk-private-archive`.
Github `analytics/wrangler.toml` dosyasındaki `[[r2_buckets]]` bloğu etkinleştirilmelidir; yalnız panelde eklenen binding sonraki Wrangler deploy ile kaldırılabilir.
`ARCHIVE_ENABLED="true"` olduktan sonra her ayın 5'inde 07:15 UTC çalışan zamanlanmış görev, geçen ayın CSV'lerini `monthly/YYYY-MM/` altında özel kovaya koyar:
- `daily_site.csv` — günlük sayfa görüntüleme, ziyaret, ziyaretçi-gün, süre, ölçüm sürümü
- `monthly_breakdowns.csv` — yalnız ay içinde >=5 görüntüleme içeren kırılımlar
- `monthly_events.csv` — yalnız ay içinde >=5 olay içeren hedefler
- `manifest.json` — tarih aralığı, ölçüm sürümleri, eksik günler, eşik ve açıklamalar

Arşivde ham olay satırı, IP, günlük HMAC veya tekil görüntüleme kimliği yer almaz. `manifest.json` en son yazılır; mevcutsa ayın yeniden arşivlenmesini engeller. Önceden hazırlanmış günler olmadan açmayın. Bu, **ikinci bir özel depolama alanıdır**, kamuya açık GitHub deposu değildir.

## 4. Haftalık/aylık raporlar
`REPORTS_ENABLED="true"` yalnız canlı analitik ve günlük özetler çalışıp doğrulandıktan sonra yapılır. Worker Cron:
- günlük 00:20 UTC bakım ve kesinleştirme
- günlük 07:15 UTC rapor kontrolü, her pazartesi önceki hafta; her ayın 1'i önceki ay

Alıcı: `akin.bakioglu@erzincan.edu.tr`, gönderici: `reports@mnemorisk.org`. Doğrulanmış e-posta gönderim testi başarıyla yapıldı. `report_deliveries` tek-sefer gönderimi kaydeder. Yanlışlıkla toplu tekrar gönderim yapılmamalı. Başarısız durumlar otomatik yeniden denenmez; işleyiş gözlenmelidir.

## 5. KVKK değerlendirmesinden sonraki tek açılış prosedürü
1. `analytics.mnemorisk.org/health` testi ve `stats.mnemorisk.org/dashboard` Access + Basic auth koruması, D1 şeması, R2 private arşiv ve e-posta gönderimi doğrulanır.
2. Güncellenmiş KVKK aydınlatması yayımlanır; işleme şartı ve yurtdışı aktarım mekanizması netleştirilir.
3. İşleme şartına göre gerekliyse çalışan tercih/izin mekanizması eklenir.
4. Worker `COLLECTION_ENABLED=true`, `REPORTS_ENABLED=true`, uygun durumda `ARCHIVE_ENABLED=true`, `DASHBOARD_ENABLED=true` olarak dağıtılır.
5. GitHub repository variable `PUBLIC_ANALYTICS_ENABLED=true` kaydedilir ve Astro site iş akışı yeniden çalıştırılır. Bu son adım tarayıcıdaki takip kodunu **gerçekten açar**.
6. Gerçek/sentetik deneme görüntülemeleri, cron, R2 export ve e-posta raporları doğrulanır. Yanlış hesaplamaları gizlemeyin ve ölçüm sürümünü değiştirmeden yeniden hesaplamayın.

## Kaynaklar
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
