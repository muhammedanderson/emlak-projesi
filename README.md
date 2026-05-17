# 🏢 EmlakPazar: Akıllı Gayrimenkul Pazaryeri ve Değerleme Motoru

EmlakPazar, modern web mimarisi (MVC) kullanılarak geliştirilmiş, veri kazıma (web scraping) tabanlı çalışan akıllı bir gayrimenkul ekspertiz ve ilan yönetim platformudur. Sistem, sadece bir ilan havuzu olmakla kalmayıp, arka planda çalışan matematiksel endeks motoru sayesinde gayrimenkullerin adil piyasa değerini hesaplar ve yatırım analizi sunar.

---

## 🚀 Öne Çıkan Gelişmiş Özellikler (Mühendislik Zekası)

* **Yapay Zeka Destekli Değerleme Motoru:** Konutun konumu, ilçesi, bina yaşı ve ulaşım imkanlarına göre lokasyon bazlı adil piyasa fiyatı hesaplar.
* **Piyasa Karşılaştırma Analitiği:** Algoritmik olarak hesaplanan adil değer ile popüler platformlardaki (Sarı Site vb.) tahmini piyasa fiyatlarını karşılaştırarak jüriye sunum raporu hazırlar.
* **Akıllı Yatırım Analiz Rozetleri:** Kullanıcıların ilana koyduğu fiyat ile sistemin biçtiği adil değeri kıyaslayarak ilan kartlarına otomatik olarak **🔴 Yüksek Fiyat**, **🟡 Dengeli Piyasa** veya **🟢 Kelepir / Fırsat** rozetleri mühürler.
* **Anlık Canlı Filtreleme (Live Search):** Pazaryeri sayfasında sayfa yenilenmeden, saf JavaScript algoritmalarıyla şehir ve ilçe bazlı anlık canlı arama/filtreleme yapar.
* **🖨 Kurumsal PDF / Çıktı Desteği:** Üretilen gelişmiş ekspertiz raporu tek tıkla fiziksel çıktıya veya PDF rapor belgesine dönüştürülebilir.
* **Gelişmiş İlan ve Not Yönetimi:** Kullanıcılar kendi ilanlarına özel açıklamalar/notlar ekleyebilir, kendi panellerinden ilanlarını anlık olarak silebilirler.

---

## 💼 Rol Bazlı Ticari İş Modeli (Business Logic)

Sistem, ticari bir start-up vizyonuyla iki farklı kullanıcı rolüne göre kısıtlamalar ve öncelikler içerir:

1.  **Bireysel Kullanıcı (Sahibinden):** Suistimalleri engellemek amacıyla **maksimum 3 ilan** yayınlama sınırı vardır. 4. ilanda sistem otomatik bariyer uygular.
2.  **Emlak Ofisi / Danışman (Kurumsal):** Kayıt esnasında bağlı olduğu kurumsal firma ismi sorulur. Kurumsal hesaplar **sınırsız ilan** hakkına sahiptir.
3.  **Öne Çıkarma Algoritması (Top-Priority Doping):** Pazaryeri ilan havuzunda kurumsal emlakçı ilanları, veri sıralama (sort) algoritmaları sayesinde **her zaman en üst sırada** yeşil şeritli ve şirket logolu olarak listelenir.

---

## 🛠 Proje Klasör Yapısı (MVC Mimarisi)

```text
emlak-projesi/
├── controllers/
│   ├── authController.js     # Giriş/Kayıt beyni ve session simülasyonu
│   └── estateController.js   # Değerleme motoru, limitler ve ilan yönetim merkezi
├── data/                     # [.gitignore listesindedir, lokalde üretilir]
│   ├── marketData.json       # Kazınan şehir/ilçe endeks verileri
│   ├── users.json            # Şifrelenmiş kullanıcı veritabanı
│   └── estates.json          # Canlı ilan pazaryeri havuzu
├── routes/
│   ├── authRoutes.js         # Yetkilendirme rotaları
│   └── estateRoutes.js       # Dashboard, raporlama ve ilan rotaları
├── views/
│   ├── login.html            # Kullanıcı giriş ekranı
│   ├── register.html         # Dinamik firma sorgulu kayıt ekranı
│   └── dashboard.html        # Değerleme formu ve navigasyon merkezi
├── app.js                    # Ana sunucu yapılandırması ve URL encoding katmanı
├── scraper.js                # Veri toplama motoru (Data Scraper)
└── package.json              # Proje bağımlılıkları ve kütüphaneler
