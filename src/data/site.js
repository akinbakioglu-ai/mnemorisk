export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path = '') => `${base}/${path}`;
export const menu = [
  {label:'Proje',path:'proje/'},
  {label:'Araştırma',path:'arastirma/'},
  {label:'Haritalar',path:'haritalar/'},
  {label:'Yayınlar & Haberler',path:'yayinlar/'},
  {label:'Ekip',path:'ekip/'},
  {label:'İletişim',path:'iletisim/'}
];
export const sections = {
  proje:{eyebrow:'01 / PROJE',title:'Hafızayı afet riskinin bir parçası olarak düşünmek.',intro:'MNEMORİSK, Erzincan’da deprem hafızasının yaşanma ve aktarılma biçimlerini; risk algısı, afete hazırlık ve mekâna bağlılık ile ilişkisi içinde inceliyor.',blocks:[
    {heading:'Neden hafıza?',text:'1939 ve 1992 depremleri Erzincan’ın toplumsal hafızasında derin izler bıraktı. Depremi yaşamış olanlar, ailelerinden dinleyenler ve kente sonradan gelenler aynı yerde farklı hafıza ilişkileri kuruyor. Araştırma, bu farklılıkların risk değerlendirmelerini ve hazırlık davranışlarını nasıl etkilediğini ele alıyor.'},
    {heading:'Araştırmanın amacı',text:'Mnemorisk’in amacı, afet zarar görebilirliğini yalnızca fiziksel risk parametreleri ve sosyoekonomik göstergeler üzerinden değil; aynı zamanda toplumsal hafıza, bireylerin deprem deneyimleri ve mekânsal aidiyet gibi toplumsal ve bireysel etkenler çerçevesinde ele almaktır. Bu doğrultuda araştırma, Erzincan kent merkezi örneğinde mühendislik verileri ile toplumun geçmiş afet deneyimleri ve kolektif hafızası üzerinden şekillenen algılanan risk verilerini Coğrafi Bilgi Sistemleri (CBS) ortamında bütünleştirerek çok katmanlı bir analiz gerçekleştirmeyi amaçlamaktadır. Bu bütünleşik yaklaşım aracılığıyla fiziksel tehlike göstergeleri ile toplumsal risk algısının mekânsal dağılımı karşılaştırılacak ve bu iki boyut arasındaki olası uyumsuzluklar somut veriler üzerinden ortaya konulacaktır. Araştırmadan elde edilecek bulguların, afet zarar görebilirliğinin bilişsel ve kültürel boyutlarının anlaşılmasına katkı sağlaması ve risk değerlendirme literatüründeki çok boyutlu çalışmalara yeni bir perspektif sunması hedeflenmektedir.'},
    {heading:'Proje künyesi',text:'Hafıza Temelli Sosyal Zarar Görebilirlik: Erzincan’da Toplumsal Hafızanın Afet Risk Yönetimine Entegrasyonu ve Mekânsal Modellemesi. Erzincan Binali Yıldırım Üniversitesi bünyesinde yürütülmektedir. TÜBİTAK 1001 kapsamında, 226K193 proje numarasıyla desteklenmeye hak kazanmıştır.'}
  ]},
  arastirma:{eyebrow:'02 / ARAŞTIRMA',title:'Bir kentin hafızasını çok yöntemli araştırmak.',intro:'Anket, derinlemesine görüşme ve coğrafi bilgi sistemleri analizini bir araya getiren üç aşamalı araştırma tasarımı.',blocks:[
    {heading:'Yöntem',text:'Mnemorisk araştırması, afet riski, toplumsal hafıza ve mekânsal aidiyet arasındaki ilişkileri çok katmanlı bir analiz çerçevesinde inceleyen karma yöntemli bir araştırma tasarımına sahiptir. Karma yöntem yaklaşımı, nitel ve nicel verilerin sistematik biçimde bir araya getirilmesi yoluyla karmaşık toplumsal süreçlerin çok boyutlu analizine olanak tanımaktadır (Creswell ve Clark 2017; Greene 2007). Araştırmada Açıklayıcı Sıralı Karma Desen benimsenmiştir. Bu doğrultuda öncelikle hane halklarından elde edilen nicel veriler analiz edilecek; ardından nicel bulguların daha ayrıntılı açıklanması amacıyla nitel saha araştırması gerçekleştirilecektir.'},
    {heading:'01 — Hane araştırması',text:'Araştırmanın ilk aşamasında Erzincan kent merkezindeki 85 mahallede rastgele seçilecek 1.093 haneye yüz yüze anket uygulanması planlanmaktadır. Sorular deprem deneyimini, kuşaklararası anlatıları, risk algısını, yere bağlılığı ve hazırlığı kapsar. Hane araştırmasından elde edilecek nicel veriler istatistiksel analizlere tabi tutulacaktır.'},
    {heading:'02 — Derinlemesine görüşmeler',text:'Açıklayıcı sıralı desen doğrultusunda, nicel analizlerin ardından anket bulgularının daha ayrıntılı açıklanması amacıyla nitel saha araştırmasına geçilecektir. Nicel analizler sonucunda belirlenen mahallelerde deprem tanıkları, aile hafızasını taşıyanlar ve yerel yöneticilerle derinlemesine görüşmeler gerçekleştirilecektir. Görüşmelerde afet hafızası, risk algısı, deprem deneyimleri ve mekânsal aidiyet gibi konular ele alınacaktır. Elde edilen nitel veriler, nicel bulguların nedenlerini ve toplumsal boyutlarını açıklamaya katkı sağlayacaktır.'},
    {heading:'03 — Verilerin analizi ve bütünleştirilmesi',text:'Nicel aşamada Açımlayıcı Faktör Analizi (AFA), Doğrulayıcı Faktör Analizi (DFA) ve regresyon analizleriyle değişkenlerin faktör yapısı, ölçüm modelinin uygunluğu ve değişkenler arasındaki ilişkiler incelenecektir. Araştırmanın son aşamasında nitel ve nicel bulgular birlikte değerlendirilerek bütünleştirilecektir. Bu süreçte analizlerden elde edilen bulgular, Mnemonik Sermaye Endeksi’nin oluşturulması ve göstergelerin ağırlıklandırılmasında yöntemsel ölçütler doğrultusunda değerlendirilecektir.'},
    {heading:'04 — Mekânsal modelleme',text:'Hane araştırması ve derinlemesine görüşmelerden elde edilen bulgular, zemin, fay ve yapı stoku gibi mühendislik verileriyle birlikte Coğrafi Bilgi Sistemleri (CBS) ortamında değerlendirilecektir. Endeks puanları mühendislik verilerine dayalı mekânsal altlıklarla bütünleştirilerek risk ve kırılganlık katmanları oluşturulacak; kırılganlık örüntülerinin mekânsal dağılımı, yoğunlaşma alanları ve olası mekânsal uyuşmazlıklar incelenecektir.'},
    {heading:'Yöntem notu',text:'Bu sayfa araştırma tasarımını özetlemektedir. Örneklem, veri kalitesi ve mekânsal tahminlerin belirsizlikleri sonuçların yayımlanması sırasında ayrıca açıklanacaktır.'}
  ]},
  haritalar:{eyebrow:'03 / HARİTALAR',title:'Hafızanın mekânsal izlerini görmek.',intro:'Araştırma tamamlandıkça mahalle düzeyinde veri görselleştirmeleri ve yöntem açıklamaları bu sayfada yayımlanacak.',blocks:[
    {heading:'Hafıza temelli sosyal zarar görebilirlik',text:'Amaç, fiziksel tehlike göstergeleri ile toplumsal hafıza, risk algısı ve hazırlık düzeyleri arasındaki ilişkiyi mekânsal olarak incelemektir.'},
    {heading:'Henüz sonuç haritası yayımlanmadı',text:'Bu ön tasarımda araştırma sonucu, mahalle skoru veya risk sınıflaması gösterilmiyor. Veri toplama ve analiz süreci ilerledikçe doğrulanmış çıktılar eklenecek.'}
  ]},
  yayinlar:{eyebrow:'04 / YAYINLAR & HABERLER',title:'Araştırmadan notlar ve yayınlar.',intro:'Makaleler, bildiriler, raporlar, saha notları ve proje duyuruları burada bir araya gelecek.',blocks:[
    {heading:'Yayın arşivi',text:'İlk araştırma çıktıları hazırlandığında bibliyografik bilgiler, açık erişim bağlantıları ve indirilebilir belgeler eklenecek.'},
    {heading:'Proje günlüğü',text:'Saha çalışması, toplantılar ve kamuya açık etkinliklerle ilgili güncellemeler yayımlanacak.'}
  ]},
  ekip:{eyebrow:'05 / EKİP',title:'Araştırma ekibi.',intro:'MNEMORİSK araştırma ekibinin yürütücüsü ve proje çalışmalarını koordine eden akademik kadro.',member:{
    name:'Doç. Dr. Akın Bakioğlu',
    role:'Proje Yürütücüsü',
    institution:'Erzincan Binali Yıldırım Üniversitesi · Fen-Edebiyat Fakültesi · Sosyoloji Bölümü',
    image:'/akin-bakioglu.png',
    bio:[
      'Akın Bakioğlu, Erzincan Binali Yıldırım Üniversitesi Fen-Edebiyat Fakültesi Sosyoloji Bölümünde öğretim üyesidir. Lisans ve yüksek lisans eğitimini Süleyman Demirel Üniversitesinde, doktora eğitimini ise 2019 yılında Ankara Üniversitesinde tamamlamıştır. Doktora tezinden hareketle hazırladığı Büyük Madenci Yürüyüşü: Zonguldak\'ın Büyük Grevi (1990-1991) adlı kitabı, 2022 yılında İletişim Yayınları tarafından yayımlanmıştır.',
      'Akademik çalışmaları başta emek ve sınıf sosyolojisi olmak üzere endüstri sosyolojisi, göç, kent sosyolojisi, dijital kapitalizm, platform emeği, toplumsal hafıza ve afet sosyolojisi alanlarında yoğunlaşmaktadır. Araştırmalarında emek süreçlerinin dönüşümü, sınıf ilişkileri, mekânsal eşitsizlikler ve toplumsal değişim arasındaki ilişkileri tarihsel ve eleştirel bir sosyolojik perspektifle ele almaktadır.',
      '2024-2025 yıllarında TÜBİTAK Yurt Dışı Doktora Sonrası Araştırma Burs Programı desteğiyle Almanya\'daki Eberhard Karls Tübingen Üniversitesi Sosyoloji Bölümü\'nde doktora sonrası araştırmalar yürütmüştür. Bu kapsamda Türkiye kökenli göçmen işçilerin çalışma deneyimleri, emek süreçleri, sınıfsal konumları ve örgütlenme pratikleri üzerine saha araştırmaları gerçekleştirmiştir. Ulusal ve uluslararası akademik çalışmalarını sürdürmekte olup Sosyoloji Derneği Yönetim Kurulu üyesidir.'
    ]
  },
  member2:{
    name:'Prof. Dr. Müzeyyen Aytül Kasapoğlu',
    role:'Proje Araştırmacısı',
    institution:'Başkent Üniversitesi · Fen-Edebiyat Fakültesi · Sosyoloji Bölümü',
    image:'/MUZEYYEN%20AYT%C3%9CL%20KASAPO%C4%9ELU.png',
    bio:[]
  },
  member3:{
    name:'Doç. Dr. Ahmet Emrah Siyavuş',
    role:'Proje Araştırmacısı',
    institution:'Marmara Üniversitesi · İnsan ve Toplum Bilimleri Fakültesi · Coğrafya Bölümü',
    image:'/AHMET%20EMRAH%20S%C4%B0YAVU%C5%9E.png',
    bio:[]
  },
  member4:{
    name:'Dr. Öğr. Üyesi İlhan Zeynep Karakılıç',
    role:'Proje Araştırmacısı',
    institution:'Bahçeşehir Üniversitesi · Sosyoloji Bölümü',
    image:'/\u0130LHAN%20ZEYNEP%20KARAKILI%C3%87.png',
    bio:['İlhan Zeynep Karakılıç Bahçeşehir Üniversitesi Sosyoloji Bölümü’nde doktor öğretim üyesi olarak çalışmaktadır. Çalışma konuları arasında kır sosyolojisi, göç sosyolojisi ve hafıza çalışmaları yer almaktadır.']
  },
  member5:{
    name:'Yusuf Bulucu',
    role:'Proje Bursiyeri',
    institution:'Fırat Üniversitesi · Coğrafya Bölümü · Coğrafya Yüksek Lisans Öğrencisi',
    image:'/YUSUF%20BULUCU.png',
    bio:['Yusuf Bulucu, Fırat Üniversitesi Coğrafya Bölümü’nde yüksek lisans öğrencisidir. Başta afet riski olmak üzere fiziki ve beşerî coğrafyanın farklı konularında CBS, uzaktan algılama, mekânsal istatistik ve makine öğrenmesi yöntemleriyle çalışmalar yürütmektedir.']
  },
  member6:{
    name:'Sümeyye Turak',
    role:'Proje Bursiyeri',
    institution:'Erzincan Binali Yıldırım Üniversitesi · Sosyoloji Bölümü · Sosyoloji Yüksek Lisans Öğrencisi',
    image:'/S%C3%9CMEYYE%20TURAK.png',
    bio:['Sümeyye Turak, Erzincan Binali Yıldırım Üniversitesi Sosyoloji Bölümü yüksek lisans öğrencisidir. Çalışmalarını toplumsal hafıza ve afet sosyolojisi alanlarında sürdürmektedir.']
  },blocks:[]},
  iletisim:{eyebrow:'06 / İLETİŞİM',title:'MNEMORİSK ile iletişim.',intro:'Araştırmaya ilişkin sorular, akademik iş birlikleri ve kurumsal talepler için iletişim bilgileri burada yayımlanacak.',blocks:[
    {heading:'İletişim bilgileri hazırlanıyor',text:'Resmî proje e-posta adresi ve uygun iletişim kanalları netleştiğinde bu alan güncellenecek.'},
    {heading:'Kurumsal bağlam',text:'Proje Erzincan Binali Yıldırım Üniversitesi bünyesinde yürütülmektedir.'}
  ]}
};