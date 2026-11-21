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
    {heading:'Araştırmanın amacı',text:'Bu projenin amacı, afet zarar görebilirliğini yalnızca fiziksel risk parametreleri ve sosyoekonomik göstergeler üzerinden değil; aynı zamanda toplumsal hafıza, bireylerin deprem deneyimleri ve mekânsal aidiyet gibi toplumsal ve bireysel etkenler çerçevesinde ele almaktır. Bu doğrultuda araştırma, Erzincan kent merkezi örneğinde mühendislik verileri ile toplumun geçmiş afet deneyimleri ve kolektif hafızası üzerinden şekillenen algılanan risk verilerini Coğrafi Bilgi Sistemleri (CBS) ortamında bütünleştirerek çok katmanlı bir analiz gerçekleştirmeyi amaçlamaktadır. Bu bütünleşik yaklaşım aracılığıyla fiziksel tehlike göstergeleri ile toplumsal risk algısının mekânsal dağılımı karşılaştırılacak ve bu iki boyut arasındaki olası uyumsuzluklar somut veriler üzerinden ortaya konulacaktır. Araştırmadan elde edilecek bulguların, afet zarar görebilirliğinin bilişsel ve kültürel boyutlarının anlaşılmasına katkı sağlaması ve risk değerlendirme literatüründeki çok boyutlu çalışmalara yeni bir perspektif sunması hedeflenmektedir.'},
    {heading:'Proje künyesi',text:'Hafıza Temelli Sosyal Zarar Görebilirlik: Erzincan’da Toplumsal Hafızanın Afet Risk Yönetimine Entegrasyonu ve Mekânsal Modellemesi. Erzincan Binali Yıldırım Üniversitesi bünyesinde yürütülmektedir. TÜBİTAK 1001 kapsamında, 226K193 proje numarasıyla desteklenmeye hak kazanmıştır.'}
  ]},
  arastirma:{eyebrow:'02 / ARAŞTIRMA',title:'Bir kentin hafızasını çok yöntemli araştırmak.',intro:'Anket, derinlemesine görüşme ve coğrafi bilgi sistemleri analizini bir araya getiren üç aşamalı araştırma tasarımı.',blocks:[
    {heading:'01 — Hane araştırması',text:'Erzincan kent merkezindeki 85 mahallede rastgele seçilecek 1.093 haneye yüz yüze anket uygulanması planlanmaktadır. Sorular deprem deneyimini, kuşaklararası anlatıları, risk algısını, yere bağlılığı ve hazırlığı kapsar.'},
    {heading:'02 — Derinlemesine görüşmeler',text:'Anketin işaret ettiği mahallelerde deprem tanıkları, aile hafızasını taşıyanlar ve yerel yöneticilerle nitel görüşmeler gerçekleştirilecektir.'},
    {heading:'03 — Mekânsal modelleme',text:'Toplanan verilerin zemin, fay ve yapı stoku bilgileriyle coğrafi bilgi sistemleri ortamında birleştirilmesi ve mahalle ölçeğinde yorumlanması hedeflenmektedir.'},
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
    image:'/muzeyyen-aytul-kasapoglu.png',
    bio:[]
  },blocks:[]},
  iletisim:{eyebrow:'06 / İLETİŞİM',title:'MNEMORİSK ile iletişim.',intro:'Araştırmaya ilişkin sorular, akademik iş birlikleri ve kurumsal talepler için iletişim bilgileri burada yayımlanacak.',blocks:[
    {heading:'İletişim bilgileri hazırlanıyor',text:'Resmî proje e-posta adresi ve uygun iletişim kanalları netleştiğinde bu alan güncellenecek.'},
    {heading:'Kurumsal bağlam',text:'Proje Erzincan Binali Yıldırım Üniversitesi bünyesinde yürütülmektedir.'}
  ]}
};