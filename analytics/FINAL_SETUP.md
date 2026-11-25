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

## 3. Aylık CSV arşivi (ücretsiz, ayrı ve özel GitHub deposu)
**R2 aboneliği kullanılmıyor, R2'yi etkinleştirmeyin.**

1. GitHub'da yeni repository oluştur: `akinbakioglu-ai/mnemorisk-analytics-archive`. **Private** seç; Add README açık olsun (ana dal `main`).
2. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Repository access: **Only select repositories** → `mnemorisk-analytics-archive`; Repository permissions → **Contents: Read and write**, Metadata read-only; kısa/uygun son kullanma tarihi. Token'ı sohbet, Github dosyası veya ekran görüntüsünde paylaşma.
3. Cloudflare → Workers & Pages → mnemorisk-analytics → Settings → Variables and Secrets → Add variable → Production, **Secret**. Key: `GITHUB_ARCHIVE_TOKEN`; Value: özel repo için oluşturulan fine-grained token.
4. `ARCHIVE_ENABLED` şu an `false` kalır. Gerçek veri toplama ve günlük özetler doğrulanınca GitHub `analytics/wrangler.toml` içinde `ARCHIVE_ENABLED="true"` yapılarak dağıtılır.
5. Worker her ayın **5'inde 07:15 UTC** önceki ayın kapanmış D1 özetlerini GitHub API aracılığıyla private depodaki `monthly/YYYY-MM/` klasörüne yazar. Arşivde:
   - `daily_site.csv`: Günlük sayfa görüntüleme, ziyaret, ziyaretçi-gün, süre, ölçüm sürümü
   - `monthly_breakdowns.csv`: Aylık en az 5 görüntülemeli bağımsız kırılımlar
   - `monthly_events.csv`: Aylık en az 5 olaylı hedefler
   - `manifest.json`: Eksik günler, sürüm, ay, gizlilik eşiği
6. İşlem hedef GitHub deposunun gerçekten **private** olduğunu API üzerinden doğrular. Depo kamuya açıksa **hiçbir şey yüklemez**. Manifest en son yazılır; bir sonraki çalışmada manifest varsa tekrar yüklemez. Token süresi dolarsa cron hata verir; düzenli kontrol edilir.

**Not:** GitHub Actions üzerinden Cloudflare D1'e ek erişim anahtarı vermek yerine, zaten D1'e bağlı Worker mevcut Cron ile özel depoya dosyaları yükler. Böylece ayrı Cloudflare API tokenı ve yeni bir Actions izin zinciri gerekmez.

## 4. Haftalık/aylık raporlar
`REPORTS_ENABLED="true"` yalnız canlı analitik ve günlük özetler çalışıp doğrulandıktan sonra yapılır. Worker Cron:
- günlük 00:20 UTC bakım ve kesinleştirme
- günlük 07:15 UTC rapor kontrolü, her pazartesi önceki hafta; her ayın 1'i önceki ay

Alıcı: `akin.bakioglu@erzincan.edu.tr`, gönderici: `reports@mnemorisk.org`. Doğrulanmış e-posta gönderim testi başarıyla yapıldı. `report_deliveries` tek-sefer gönderimi kaydeder. Yanlışlıkla toplu tekrar gönderim yapılmamalı. Başarısız durumlar otomatik yeniden denenmez; işleyiş gözlenmelidir.

## 5. KVKK değerlendirmesinden sonraki tek açılış prosedürü
1. `analytics.mnemorisk.org/health` testi ve `stats.mnemorisk.org/dashboard` Access + Basic auth koruması, D1 şeması, GitHub private arşiv ve e-posta gönderimi doğrulanır.
2. Güncellenmiş KVKK aydınlatması yayımlanır; işleme şartı ve yurtdışı aktarım mekanizması netleştirilir.
3. İşleme şartına göre gerekliyse çalışan tercih/izin mekanizması eklenir.
4. Worker `COLLECTION_ENABLED=true`, `REPORTS_ENABLED=true`, uygun durumda `ARCHIVE_ENABLED=true`, `DASHBOARD_ENABLED=true` olarak dağıtılır.
5. GitHub repository variable `PUBLIC_ANALYTICS_ENABLED=true` kaydedilir ve Astro site iş akışı yeniden çalıştırılır. Bu son adım tarayıcıdaki takip kodunu **gerçekten açar**.
6. Gerçek/sentetik deneme görüntülemeleri, cron, GitHub özel depo arşivi ve e-posta raporları doğrulanır. Yanlış hesaplamaları gizlemeyin ve ölçüm sürümünü değiştirmeden yeniden hesaplamayın.

## Kaynaklar
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
