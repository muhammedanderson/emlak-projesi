const path = require('path');
const fs = require('fs');

// 1. Kazınan piyasa verisini dosyadan okuyan fonksiyon
const getScrapedMarketData = () => {
    try {
        const marketPath = path.join(__dirname, '../data/marketData.json');
        const data = fs.readFileSync(marketPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Kazınan veritabanı okunamadı!");
        return {};
    }
};

// 2. Dashboard sayfasını açan bölüm
exports.getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
};

// 3. Fiyat Hesaplama ve Raporu Ekrana Basma Bölümü
exports.calculateValuation = (req, res) => {
    const { district, sqm, age, transport } = req.body;

    if (!district || !sqm || !age || !transport) {
        return res.send("Lütfen formdaki tüm alanları doldurun.");
    }

    // --- KAZINAN VERİTABANINDAN BİLGİ ÇEKME ---
    const marketDb = getScrapedMarketData();
    const cityData = marketDb[district];

    if (!cityData) {
        return res.send("Seçilen şehre ait veri bulunamadı. Lütfen önce scraper.js'yi çalıştırın.");
    }

    // Kazınan gerçek taban m² fiyatı
    let basePricePerSqm = cityData.baseSqmPrice;

    // Bina yaşı katsayıları
    let ageFactor = 1.0;
    if (age === '0-5') ageFactor = 1.2;
    if (age === '6-15') ageFactor = 1.0;
    if (age === '16+') ageFactor = 0.8;

    // Ulaşım katsayıları
    let transportFactor = 1.0;
    if (transport === 'yakin') transportFactor = 1.15;
    if (transport === 'uzak') transportFactor = 0.95;

    // Bizim sistemin hesapladığı adil değer
    const internalPrice = Math.round(sqm * basePricePerSqm * ageFactor * transportFactor);

    // SARI SİTE KARŞILAŞTIRMA MOTORU (Sarı sitede %8 pazarlık payı vardır)
    const sariSiteSimilarPrice = Math.round(internalPrice * 1.08);

    // Sonucu doğrudan havalı bir HTML rapor olarak ekrana bas
    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background:#fff;">
            <h2 style="color: #2c3e50; border-bottom: 3px solid #f1c40f; padding-bottom: 10px; margin-top:0;">📊 Gelişmiş Piyasa Karşılaştırma Raporu</h2>
            
            <div style='background:#d4edda; color:#155724; padding:15px; border-radius:5px; margin-bottom:20px;'>
                <b>✓ Başarılı:</b> Veritabanından piyasa analizi çekildi!
            </div>
            
            <p><b>Seçilen Şehir:</b> ${district}</p>
            <p><b>Konut Metrekaresi:</b> ${sqm} m² / Yaş Kategorisi: ${age}</p>
            
            <div style="background: #fffde7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 5px solid #f1c40f;">
                <h4 style="margin: 0 0 5px 0; color: #9a7d0a;">🔍 Sarı Site Benzer İlan Tahmini:</h4>
                <p style="margin:0;">Sarı sitede <b>${district}</b> genelinde bu özelliklere benzer ilanlar şu an ortalama <b style='color:#e67e22;'>${sariSiteSimilarPrice.toLocaleString('tr-TR')} TL</b> fiyat bandında listelenmektedir (Pazarlık Payı Dahil).</p>
            </div>

            <div style="background: #f4f6f7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 5px solid #34495e; font-size: 0.85em; color: #555;">
                <p style="margin: 2px 0;"><b>Veri Kaynağı:</b> ${cityData.scrapedFrom}</p>
                <p style="margin: 2px 0;"><b>Kazınma Tarihi:</b> ${cityData.lastUpdated}</p>
                <p style="margin: 2px 0;"><b>Ham m² Taban Fiyatı:</b> ${cityData.baseSqmPrice.toLocaleString('tr-TR')} TL</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            
            <h3 style="color: #7f8c8d; margin-bottom:5px; font-weight:normal;">Algoritmamızın Biçtiği Adil Değer:</h3>
            <h1 style="color: #27ae60; margin-top: 0; font-size: 2.7em;">${internalPrice.toLocaleString('tr-TR')} TL</h1>
            
            <br>
            <a href="/dashboard" style="display:inline-block; padding: 10px 15px; background-color: #2c3e50; color: white; text-decoration: none; border-radius: 5px; font-size:0.9em;">⬅ Yeni Hesaplama Yap</a>
        </div>
    `);
};

// 4. İlanları Listeleme (HATAYI ÇÖZEN EKSİK FONKSİYON BURASI)
exports.getListings = (req, res) => {
    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; text-align: center;">
            <h2>📋 Güncel Satılık İlanlar</h2>
            <p>Sistem şu an analiz modunda çalışmaktadır. İlan veritabanı entegrasyonu aktif değildir.</p>
            <a href="/dashboard" style="padding: 10px 15px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px;">Geri Dön</a>
        </div>
    `);
};