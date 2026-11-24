# MNEMORİSK Ziyaretçi İstatistikleri Aydınlatma Metni — TASLAK (v2)

> **Yayımlanmayacak çalışma taslağı.** Analitik sistem henüz etkin değildir. Bu taslak canlı sitedeki `/kvkk/` sayfası değildir. İşleme şartı, yurt dışına aktarım mekanizması ve teknik saklama kontrolleri doğrulanmadan geleceğe dönük açıklamalar yayına alınmayacaktır.

## Veri sorumlusu ve iletişim

MNEMORİSK web sitesinin bağımsız yönetimi ve ziyaretçi istatistiklerine ilişkin amaç ve araçlar konusunda karar alan kişi **Doç. Dr. Akın Bakioğlu**'dur. Analitik faaliyetinin veri sorumlusu olarak bu ad esas alınmıştır.

İletişim: **mnemorisk@gmail.com**.

Bu tespit, üniversite bünyesinde yürütülen araştırmanın saha verileri veya kurumsal veri işleme faaliyetleri bakımından veri sorumlusunun da aynı kişi olduğu anlamına gelmez. Üniversiteyle ilişkinin ve aktarım düzeninin hukuken değerlendirilmesi gerekebilir.

## Veri kategorileri

Ölçüm etkinleştirildiğinde şu bilgiler işlenir:

- Açılan sayfanın **yolu**, ilk/son bildirim zamanı, sayfada geçirilen **tahmini etkin süre** ve ulaşılan en yüksek kaydırma yüzdesi.
- Ziyaretin **ülke ve bölge/il kodu** (IP tabanlı yaklaşık konum; kesin fiziksel yer değil).
- Yönlendiren sitenin **alan adı** ve varsa sınırlı **UTM kaynak, kanal ve kampanya** etiketleri. Tam yönlendiren URL, sorgu dizgesi ve bağlantı parçacığı saklanmaz.
- **Cihaz sınıfı** (telefon, tablet, masaüstü), **tarayıcının genel dil kodu** ve **sayfanın içerik dili**.
- Site içi bağlantı tıklamaları, **indirilen dosya bağlantıları** ve **dış bağlantı tıklamaları**; tam dış URL yerine hedef alan adı, site içi bağlantılarda sorgu parametresiz sayfa/dosya yolu kaydedilir.
- Aynı gün içinde görüntülemeleri tahmini olarak ilişkilendirmek için IP adresi ve sınırlı tarayıcı bilgisinden sunucuda üretilen **günlük HMAC özeti**.
- Tek bir sayfa açılışına ait süre, kaydırma ve tıklama bildirimlerini ilişkilendirmek için tarayıcının geçici çalışma belleğinde rastgele üretilen **sayfa görüntüleme kimliği**. Bu değer kalıcı tarayıcı depolamasına yazılmaz.

Bu bilgiler tekil kişiyi kesin olarak tanımlamak için değil ziyaret örüntülerini incelemek için kullanılır; aynı ağdaki kişiler yanlışlıkla birleştirilebilir.

## Kaydedilmeyen bilgiler ve teknik ayrım

MNEMORİSK'in analitik D1 veritabanında **ham IP adresi**, tam tarayıcı kullanıcı aracısı metni (User-Agent), açık adres, kesin koordinat, kişinin adı veya e-posta adresi tutulmaz. Analitik için çerez, `localStorage` ve `sessionStorage` kullanılmaz. Rastgele sayfa kimliği yalnızca açık sayfanın JavaScript belleğinde bulunur; aynı gün içindeki gezinme ve oturum gruplaması sunucuda geçici HMAC ve zaman damgalarıyla oluşturulur.

Buna karşılık, IP adresi ve tarayıcı bilgisi, günlük HMAC'in oluşturulması sırasında **geçici olarak işlenir**. GitHub Pages, Cloudflare ve diğer kullanılan hizmet sağlayıcıların ağ, güvenlik veya operasyon günlükleri ayrıca veri işleme içerebilir; bu metin sağlayıcıların tüm kayıt sistemlerinin veri tutmadığını ileri sürmez.

## İşleme yöntemi

Veriler ziyaretçinin sayfasında çalışan hafif JavaScript ölçüm kodundan ve Cloudflare Worker'ın isteğe ilişkin teknik bilgileri işlemesinden elde edilir. Sayfanın görüntülenmesi, etkin süre ve tıklama bilgileri, sayfa açıkken geçici bellekte tutulup Worker'a bildirilir. Tarayıcıya kalıcı analitik tanımlayıcı yazılmaz.

İçerik dili, cihaz türü, kaydırma derinliği ve geçişler dahil bu ölçümler uzun dönemli **ziyaretler arası kalıcı bir kişi profili** oluşturmak, kişiye özel reklam göstermek veya ziyaretçileri pazarlama için izlemek amacıyla kullanılmaz.

## Amaç

İçeriklerin erişimini ve kullanım örüntülerini (ülkeler, bölgeler, sayfalar, kaynaklar, cihaz türleri ve etkileşimler) değerlendirmek; akademik projenin dijital bilim iletişimini geliştirmek ve gerektiğinde kişiye bağlanmayan toplu istatistikleri araştırma/raporlama amaçlarıyla analiz etmek.

## Hukuki işleme şartı — yayımdan önce tamamlanacak

**[KVKK m. 5 bakımından ilgili işleme şartının ve gereklilik/menfaat dengesinin hukuki değerlendirmesi bekleniyor.]**

Meşru menfaat (m. 5/2-f) otomatik olarak geçerli varsayılmamalıdır. Amaç ve veri kapsamı büyüdükçe değerlendirme yeniden yapılmalıdır. Açık rıza gerekiyorsa sadece aydınlatma bağlantısı yeterli olmayacak, ölçüm öncesi işleyen bir tercih mekanizması kurulacaktır.

## Alıcılar ve yurt dışına aktarım — yayımdan önce tamamlanacak

Web sitesi GitHub Pages'te barındırılmaktadır. Alan adı Cloudflare üzerinden yönetilmektedir. Analitik etkinleştirilirse Cloudflare Workers ve D1 kullanılacaktır. İlgili hizmet sağlayıcılarının altyapısı nedeniyle yurt dışına veri aktarımı gündeme gelebilir. **KVKK m. 9 kapsamında uygulanabilir aktarım mekanizması, alıcı grupları ve teknik/hukuki şartlar doğrulanmadan analitik sistem canlıya alınmayacaktır.** Yalnızca bu metnin yayımlanması aktarımı hukuka uygun hâle getirmez.

## Saklama süreleri — etkinleştirmeden önce doğrulanacak kural

- **Günlük HMAC tanımlayıcısı:** Günlük özet doğrulandıktan sonra, **en geç 14 gün içinde silinmesi gereken** geçici alan.
- **Kimlik sütunu temizlenmiş ayrıntılı sayfa ve tıklama olayları:** **En çok 180 gün**.
- **Günlük toplu istatistikler:** Raporlama amacı ve saklama politikası kapsamında ayrıca belirlenecek süre.

**Önemli teknik not:** Mevcut zamanlanmış görev, başarısızlık hâlinde silmeyi geciktirebilir; kod şu an kesin 14 günlük üst sınırın uygulanacağını garanti etmez. Bu taahhüt ancak sağlık denetimi, arıza uyarıları ve kurtarma mekanizmaları tamamlandıktan sonra canlı metne alınabilir. Arıza olasılığı bir ziyaretçi metninde süresiz saklama istisnasına dönüştürülemez.

## İlgili kişinin hakları ve başvuru

6698 sayılı KVKK m. 11 kapsamında kişisel veri işlenip işlenmediğini öğrenme, işleme hakkında bilgi isteme ve koşulları oluştuğunda düzeltme/silme gibi haklar söz konusudur. Başvuru için ön iletişim adresi: **mnemorisk@gmail.com**. Resmî başvurulara uygun kimlik doğrulama ve başvuru kanalları, yayına geçmeden önce tamamlanacaktır.

## Canlıya alma kontrolü

- [ ] Veri sorumlusu sıfatı ve üniversiteyle veri işleme ayrımı değerlendirildi.
- [ ] İşleme şartı ve gerekiyorsa açık rıza / tercih paneli doğrulandı.
- [ ] KVKK m. 9 aktarım düzeni ve Cloudflare hizmet şartları değerlendirildi.
- [ ] Geçici HMAC alanında 14 günlük üst sınır teknik olarak güvenceye alındı.
- [ ] Hizmet sağlayıcıları ve iletişim formu için ayrı aydınlatma kapsamı tamamlandı.
- [ ] Aylık arşivleme sadece toplulaştırılmış, düşük hücre sayıları kontrol edilmiş veriyi içeriyor.
- [ ] Bütün şimdiki zaman/yükümlülük ifadeleri gerçek çalışan sistemle eşleştirildi.

## Birincil kaynaklar

- KVKK, Veri Sorumlusu Kimdir?: https://www.kvkk.gov.tr/Icerik/2032/Veri-Sorumlusu-Kimdir
- KVKK, Veri sorumlusunun tespiti, 2020/71 sayılı karar: https://www.kvkk.gov.tr/Icerik/6874/2020-71
- KVKK, Yurt Dışına Aktarım: https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
