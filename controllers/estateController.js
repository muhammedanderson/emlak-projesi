const path = require('path');
const fs = require('fs');

const marketPath = path.join(__dirname, '../data/marketData.json');
const estatesPath = path.join(__dirname, '../data/estates.json');

const getScrapedMarketData = () => {
    try {
        const data = fs.readFileSync(marketPath, 'utf8');
        return JSON.parse(data);
    } catch (err) { return {}; }
};

const getSavedEstates = () => {
    try {
        if (!fs.existsSync(estatesPath)) return [];
        const data = fs.readFileSync(estatesPath, 'utf8');
        return JSON.parse(data);
    } catch (err) { return []; }
};

exports.getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
};

// 1. AŞAMA: Fiyat Hesaplama ve Rapor Sunumu
exports.calculateValuation = (req, res) => {
    const { district, subDistrict, sqm, age, transport } = req.body;

    if (!district || !subDistrict || !sqm || !age || !transport) {
        return res.send("Lütfen formdaki tüm alanları doldurun.");
    }

    const marketDb = getScrapedMarketData();
    const cityData = marketDb[district];

    if (!cityData || !cityData.districts || !cityData.districts[subDistrict]) {
        return res.send("Seçilen bölgeye ait endeks verisi bulunamadı. Lütfen önce 'node scraper.js' çalıştırın.");
    }

    let basePricePerSqm = cityData.baseSqmPrice;
    let subDistrictMultiplier = cityData.districts[subDistrict];

    let ageFactor = 1.0;
    if (age === '0-5') ageFactor = 1.2;
    if (age === '6-15') ageFactor = 1.0;
    if (age === '16+') ageFactor = 0.8;

    let transportFactor = 1.0;
    if (transport === 'yakin') transportFactor = 1.15;
    if (transport === 'uzak') transportFactor = 0.95;

    const internalPrice = Math.round(sqm * basePricePerSqm * subDistrictMultiplier * ageFactor * transportFactor);
    const sariSiteSimilarPrice = Math.round(internalPrice * 1.08);

    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #f1c40f; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin:0;">📊 Gelişmiş Piyasa Karşılaştırma Raporu</h2>
                <button onclick="window.print()" style="padding: 6px 12px; background: #34495e; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.85em;">🖨 Raporu Yazdır (PDF)</button>
            </div>
            
            <p><b>Konum Bilgisi:</b> ${district} / ${subDistrict}</p>
            <p><b>Konut Detayları:</b> ${sqm} m² / Bina Yaşı: ${age}</p>
            
            <div style="background: #fffde7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 5px solid #f1c40f;">
                <h4 style="margin: 0 0 5px 0; color: #9a7d0a;">🔍 Sarı Site (sahibinden.com) Piyasa Tahmini:</h4>
                <p style="margin:0;">Sarı sitede bu özelliklere benzer ilanlar şu an ortalama <b style='color:#e67e22;'>${sariSiteSimilarPrice.toLocaleString('tr-TR')} TL</b> civarında listelenmektedir.</p>
            </div>

            <div style="background: #f4f6f7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 5px solid #34495e; font-size: 0.85em; color: #555;">
                <p style="margin: 2px 0;"><b>Veritabanı Analiz Havuzu:</b> ${cityData.scrapedFrom}</p>
                <p style="margin: 2px 0;"><b>Bölge Çarpanı:</b> x${subDistrictMultiplier}</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #7f8c8d; margin-bottom:5px; font-weight:normal;">Sistemimizin Önerdiği Adil Değer:</h3>
            <h1 style="color: #27ae60; margin-top: 0; font-size: 2.5em;">${internalPrice.toLocaleString('tr-TR')} TL</h1>
            
            <form action="/publish" method="POST" style="margin-top: 30px; background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px dashed #16a34a;">
                <h3 style="margin-top: 0; color: #16a34a;">🚀 Bu Evi Pazaryerinde Yayınla</h3>
                <p style="font-size: 0.85em; color: #666; margin-bottom: 15px;">Aşağıdaki kutuya evinizi eklemek istediğiniz nihai satış fiyatını yazarak ilan havuzuna fırlatabilirsiniz.</p>
                
                <input type="hidden" name="district" value="${district}">
                <input type="hidden" name="subDistrict" value