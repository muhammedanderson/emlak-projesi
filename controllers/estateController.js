const path = require('path');
const Estate = require('../models/estateModel');

// 1. Dashboard sayfasını açar
exports.getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
};

// 2. Ev Değeri Hesaplar ve Tercihe Göre İlanlara Ekleme Yapar
exports.calculateValuation = (req, res) => {
    const { district, sqm, age, transport, actionType } = req.body;

    if (!district || !sqm || !age || !transport || !actionType) {
        return res.send("Lütfen formdaki tüm alanları doldurun.");
    }

    // --- Akıllı Emlak Algoritması ---
    let basePricePerSqm = 40000; 
    if (district === 'Bakırköy') basePricePerSqm = 55000;

    let ageFactor = 1.0;
    if (age === '6-15') ageFactor = 0.85;
    if (age === '16+') ageFactor = 0.70; 

    let transportFactor = 1.0;
    if (transport === 'yakin') transportFactor = 1.15;
    if (transport === 'uzak') transportFactor = 0.90; 

    const estimatedPrice = Math.round(sqm * basePricePerSqm * ageFactor * transportFactor);
    // ---------------------------------

    // İlana eklenecek mi kontrolü
    const isForSale = (actionType === 'list_for_sale');

    // Veritabanına (JSON) yeni kaydı atıyoruz
    Estate.save({
        district,
        sqm: Number(sqm),
        age,
        transport,
        estimatedPrice,
        isForSale,
        date: new Date().toLocaleString('tr-TR')
    });

    let statusBanner = isForSale 
        ? "<div style='background:#d4edda; color:#155724; padding:15px; border-radius:5px; margin-bottom:20px;'><b>✓ Başarılı!</b> Evinizin değeri hesaplandı ve Satılık İlanları pazaryerine eklendi.</div>"
        : "<div style='background:#e2e3e5; color:#383d41; padding:15px; border-radius:5px; margin-bottom:20px;'><b>ℹ Bilgi:</b> Sadece fiyat tahmini raporu üretildi.</div>";

    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 500px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px; margin-top:0;">İşlem Tamamlandı</h2>
            ${statusBanner}
            <p><b>Bölge:</b> ${district}</p>
            <p><b>Metrekare:</b> ${sqm} m²</p>
            <p><b>Bina Yaşı:</b> ${age} Yıl</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #7f8c8d; margin-bottom:5px;">Sistem Tahmini Değeri:</h3>
            <h1 style="color: #27ae60; margin-top: 0;">${estimatedPrice.toLocaleString('tr-TR')} TL</h1>
            <br>
            <a href="/dashboard" style="display:inline-block; padding: 10px 15px; background-color: #2c3e50; color: white; text-decoration: none; border-radius: 5px; font-size:0.9em; margin-right:10px;">Geri Dön</a>
            <a href="/listings" style="display:inline-block; padding: 10px 15px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-size:0.9em;">İlanları Listele</a>
        </div>
    `);
};

// 3. Pazaryerindeki Satılık İlanları Gösterir
exports.getListings = (req, res) => {
    const allEstates = Estate.getAll();
    const saleListings = allEstates.filter(item => item.isForSale === true);

    let rows = "";
    if (saleListings.length === 0) {
        rows = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#95a5a6;">Şu an yayında satılık ilan bulunmuyor.</td></tr>`;
    } else {
        saleListings.forEach(item => {
            rows += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 12px;"><b>${item.district}</b></td>
                    <td style="padding: 12px;">${item.sqm} m²</td>
                    <td style="padding: 12px;">${item.age} Yıl</td>
                    <td style="padding: 12px; color: #27ae60; font-weight: bold;">${item.estimatedPrice.toLocaleString('tr-TR')} TL</td>
                    <td style="padding: 12px; font-size: 0.85em; color:#7f8c8d;">${item.date}</td>
                </tr>
            `;
        });
    }

    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin:0;">📋 Güncel Satılık İlanlar (Pazaryeri)</h2>
                <a href="/dashboard" style="padding: 8px 15px; background: #2c3e50; color:white; text-decoration:none; border-radius:4px; font-size:0.9em;">+ Yeni İlan / Hesaplama</a>
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #f4f6f9; border-bottom: 2px solid #ddd;">
                        <th style="padding: 12px;">Bölge</th>
                        <th style="padding: 12px;">Metrekare</th>
                        <th style="padding: 12px;">Bina Yaşı</th>
                        <th style="padding: 12px;">Sistem Fiyatı</th>
                        <th style="padding: 12px;">İlan Tarihi</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `);
};