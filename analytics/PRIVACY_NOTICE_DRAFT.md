# MNEMORİSK — Ziyaretçi İstatistikleri Aydınlatma Metni (TASLAK)

> **Yayıma hazır değildir.** Analitik altyapısı canlı sitede henüz etkin değildir. Veri sorumlusu, hukuki işleme şartları ve KVKK m. 9 kapsamındaki yurt dışına aktarım şartları doğrulanmadan bu taslak canlı sitede yayımlanmamalıdır.

## Veri sorumlusu ve iletişim
Veri sorumlusu: **[Hukuken doğrulanacak kişi veya kurum]**.
İletişim: **mnemorisk@gmail.com**.
Sitenin teknik ve içerik yönetimi proje yürütücüsü tarafından gerçekleştirilmektedir. Bu durum tek başına KVKK kapsamında veri sorumlusunun kim olduğunu belirlemez.

## İşlenecek veriler
Analitik sistem etkinleştirildiğinde şu kategorilerde veriler işlenmesi planlanmaktadır:

- Ziyaret edilen sayfanın yolu, ilk ve son ölçüm zamanı, tahmini etkin görüntüleme süresi.
- Ülke ve bölge kodu (açık adres, GPS/koordinat veya şehir adı kaydedilmez).
- Yönlendiren sitenin alan adı (tam yönlendiren URL ve sorgu dizgesi saklanmaz).
- Cihaz sınıfı (mobil/tablet/masaüstü), tarayıcının genel dil kodu, ziyaret edilen içeriğin dili.
- Kampanya kaynağı, kanalı ve adı için sınırlı UTM etiketleri.
- Sayfa kaydırma derinliği; site içi gezinme, dosya indirme ve dış bağlantı tıklama olayları. Dış bağlantılarda hedef alan adı, dahili bağlantılarda sayfa/dosya yolu kaydedilir; sorgu dizgesi ve URL parçacığı kaydedilmez.
- Aynı gün içindeki görüntülemeleri tahmini olarak ilişkilendirmek amacıyla IP adresi ve sınırlı tarayıcı bilgisinden gizli anahtarla oluşturulan günlük HMAC özeti. Tek bir sayfa görüntülemesini ilişkilendirmek için tarayıcı belleğinde geçici olarak oluşturulan rastgele kimlik.

## Kaydedilmeyen bilgiler
Analitik veritabanında ham IP adresi, tam User-Agent, çerez, cihazda kalıcı analitik kimliği, isim ve e-posta adresi saklanmaz. Tarayıcıda analitik amaçlı çerez, localStorage veya sessionStorage kullanılmaz. Ancak IP adresi, ölçüm isteğinin işlenmesi ve günlük HMAC özetinin üretilmesi sırasında geçici olarak işlenir. Hizmet sağlayıcıların ağ/güvenlik günlükleri bu açıklamadan ayrı değerlendirilmelidir.

## Amaçlar
Sitenin erişim ve kullanım örüntülerini değerlendirmek; proje içeriklerini geliştirmek; bilimsel iletişim ve araştırma kapsamında uygun şekilde toplulaştırılmış istatistikler üretmek. Reklam hedeflemesi ve ziyaretçi profillemesi amaçlanmaz.

## Hukuki sebep ve yurt dışına aktarım
**[Hukuki değerlendirme sonrasında tamamlanacak.]** Kişisel verilerin işlenmesi için KVKK m. 5 kapsamındaki uygun işleme şartı; yurt dışına aktarım için KVKK m. 9'daki uygun mekanizma ayrıca tespit edilmelidir. 'Meşru menfaat' yalnızca alternatiflerden biridir ve otomatik olarak uygun kabul edilmemelidir.

Sitenin yayımlanmasında GitHub Pages, analitik hizmetinde Cloudflare altyapısının kullanılması planlanmaktadır. Bu hizmetler aracılığıyla gerçekleşebilecek yurt dışına veri aktarımı ve ilgili aktarılan veri kategorileri ayrıca açıklanacaktır.

## Saklama süreleri
Günlük HMAC özeti, ilgili günlük özet üretildikten sonra ve başlangıç yapılandırmasında en geç 14 günlük bakım döngüsünde silinmek üzere tasarlanmıştır; zamanlanmış işlemlerde aksama olursa gecikme mümkündür. Kimlik sütunu temizlenmiş ayrıntılı olay kayıtlarının en çok 180 gün saklanması, ardından yalnızca açıklanan toplu istatistiklerin korunması planlanmaktadır. Bu süreler yayına geçmeden önce gözden geçirilecektir.

## Haklar ve başvuru
KVKK m. 11 kapsamındaki haklarınızı kullanmak için **mnemorisk@gmail.com** adresi üzerinden iletişime geçebilirsiniz. Başvuru usulü ve veri sorumlusunun kesin kimlik/iletişim bilgileri yayına geçmeden önce tamamlanacaktır.

## Ölçüm durumu
Bu belgenin hazırlandığı tarihte MNEMORİSK web sitesinde tasarlanan analitik sistemi **henüz etkin değildir**; bu metin ileride kullanılacak aydınlatmanın çalışma taslağıdır.
