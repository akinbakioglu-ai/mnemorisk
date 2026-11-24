# MNEMORİSK — analitik altyapısı (henüz etkin değil)

Bu klasör mevcut GitHub Pages sitesinden bağımsızdır. Canlı sitede ölçüm kodu **yüklenmiyor**. Worker, D1, güvenli panel ve arşiv için Cloudflare hesabına erişim ve veri aktarımı değerlendirmesi gerekir.

## Başlangıç

1. Önce proje adına verileri kimin işleyeceğini (veri sorumlusu), Cloudflare hesap sahipliğini ve KVKK kapsamında yurt dışına aktarımın dayanağını netleştirin. Bu bilgi olmadan analitiği etkinleştirmeyin.
2. Cloudflare hesabında D1 veritabanını oluşturun: `npx wrangler d1 create mnemorisk-analytics`.
3. Dönen `database_id` değerini `wrangler.toml` içindeki yer tutucuyla değiştirin.
4. `npx wrangler secret put HMAC_SECRET` komutuyla **en az 32 karakterlik, rastgele** bir gizli anahtar ekleyin. Anahtarı asla GitHub deposuna yazmayın.
5. `npx wrangler d1 migrations apply mnemorisk-analytics --remote` ile tabloları oluşturun.
6. Cloudflare Access, hesap yetkileri ve arşiv hedefi yapılandırıldıktan sonra ayrı `analytics.mnemorisk.org` Worker Custom Domain bağlantısını açıp `npx wrangler deploy` yapın.
7. Sunucu hazır, hukuki bilgilendirme yayımlanmış ve testler geçmişse `analytics/client.js` dosyasını sitenin public asset alanına taşıyıp **yalnızca bir kez** ortak Astro şablonuna yükleyin.

`analytics/client.js` şu anda **bilerek** `public/` içinde değildir ve hiçbir sayfadan çağrılmamaktadır.

## Seçilmiş ek veri alanları (v2)

İlk sürümün temel alanlarına şu ölçümler eklendi:

- Cihaz sınıfı: mobil / tablet / masaüstü (cihaz modeli veya tam User-Agent kaydedilmez).
- Tarayıcı dili: yalnızca genel dil kodu (ör. `tr`, `en`).
- İçerik dili: sayfanın `html lang` kodu (`tr` / `en`).
- Kampanya: yalnızca `utm_source`, `utm_medium`, `utm_campaign` için kısa, güvenli karakterlerden oluşan etiketler. Diğer sorgu parametreleri saklanmaz.
- Kaydırma: sayfa görüntülemesi için en yüksek yüzde (0–100); kalıcı özetlerde 0/25/50/75/100 grupları.
- Coğrafya: ülke ve Cloudflare'ın bölge kodu; **şehir, GPS, koordinat ve açık adres saklanmaz**. Kod ülke önekiyle ayrıştırılır.
- İndirme ve dış bağlantı: indirme için aynı sitede sorgusuz dosya yolu veya `external-file`; dış bağlantı için yalnızca hedef alan adı.
- Navigasyon: dahili bağlantı tıklaması için hedef sayfa yolu ve kaynak sayfa için `entry_page_path`, tümü sorgu/fragment olmadan.

`page_events` olayları aynı sayfa görüntüleme kimliğiyle ilişkilidir, 180 gün sonra silinir. `daily_events` özetleri bunlardan hesaplanır. `daily_extra_breakdown` diğer seçilmiş boyutların **ayrı ayrı** günlük toplamlarını saklar; düşük trafikli sayfalarda kullanıcıya benzeyen birleşik kırılımlar kalıcı arşive aktarılmamalıdır. CSV arşivleyicisi henüz uygulanmadı; aktarım öncesinde küçük hücre eşikleri gereklidir.

## Ölçüm tanımları

- Kalıcı tarayıcı tanımlayıcısı/çerez/yerel depolama yok.
- `view_id` yalnızca o sayfa açılışının RAM belleğinde üretilir.
- IP ve User-Agent veritabanına **yazılmaz**; Worker bunlarla gizli HMAC anahtarından günlük özet üretir.
- Ziyaret: aynı günlük özet için eş HMAC'e ait ardışık sayfa açılışlarının 30 dakikadan fazla ayrılmaması. Gece yarısı UTC sınırında yeni günlük sayım başlar.
- Etkin süre v1: görünür ve odaktaki sekmede ölçülür; 180 sn hareketsizlikte durur, görüntüleme başına en fazla 1800 sn. Kümülatif süre yazıldığı için tekrar gönderimler süreyi şişirmez.
- GPC açık tarayıcılar istemci tarafında ölçülmez; sunucu `Sec-GPC: 1` isteklerini de dışlar.
- İlk 14 gün kimlik alanı tutulabilir; tamamlanan UTC günleri her gün 00:20'de özetlenir. Özetlenmiş günlere ait 14 günden eski kimlikler silinir. Ayrıştırılmış olay satırları 180 günde, özet varsa silinir.
- `daily_site`: site geneli görüntüleme, sunucuda oluşturulan ziyaret, günlük tekil HMAC sayısı, toplam etkin saniye.
- `daily_breakdown`: gün + tek boyut (sayfa **veya** ülke **veya** yönlendiren). Çapraz kırılımlar kalıcı özetlere taşınmaz.

Günlük tekillerin toplamına aylık tekil kişi denmez. Aynı ağdaki kişiler birleşebilir, aynı kişi günler arasında ayrı sayılır. Bot filtrelemesi kusursuz değildir. Tarayıcı etkinlik sinyali gerçek okuma süresi değildir.

## Canlıya alma öncesi denetim

- [ ] Veri sorumlusu ve Cloudflare hesap yetkilileri belirlendi
- [ ] KVKK yurt dışına aktarım ve bilgilendirme incelendi
- [ ] D1 oluşturuldu, iki migration başarılı, HMAC_SECRET tanımlandı
- [ ] Worker alan adı ve güvenli raporlama erişimi açıldı
- [ ] D1 arşivi için **ayrı Private depo** ve erişim anahtarları hazır
- [ ] Otomatik yedekleme, sağlık denetimi ve hata bildirimi test edildi
- [ ] Normal/geçersiz/bot/GPC olayları test edildi
- [ ] Ortak Astro şablonunda istemci ölçümü bilinçli olarak etkinleştirildi

Cloudflare API anahtarı, HMAC_SECRET, kişisel veriler, ham D1 dışa aktarımları veya şifreler Public `mnemorisk` deposuna konulmaz.

Resmî teknik belgeler:
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
