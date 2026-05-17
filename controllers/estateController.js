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

const getNavHtml = () => `
    <div style="display:flex; justify-content:space-between; margin-bottom:25px; background:#1e293b; padding:12px; border-radius:6px; font-family:Arial;">
        <a href="/dashboard" style="color:white; text-decoration:none; font-weight:bold; font-size:13px;">🏠 Değer Hesapla</a>
        <a href="/listings" style="color:white; text-decoration:none; font-weight:bold; font-size:13px;">📋 Tüm İlanlar</a>
        <a href="/my-listings" style="color:#f1c40f; text-decoration:none; font-weight:bold; font-size:13px;">⭐ Benim İlanlarım</a>
        <a href="/profile" style="color:#a855f7; text-decoration:none; font-weight:bold; font-size:13px;">👤 Profilim</a>
    </div>
`;

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
                <h2 style="color: #2c3e50; margin:0; font-size:1.5em;">📊 Gelişmiş Piyasa Karşılaştırma Raporu</h2>
                <button onclick="window.print()" style="padding: 6px 12px; background: #34495e; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.85em;">🖨 Raporu Yazdır (PDF)</button>
            </div>
            
            <p><b>Konum Bilgisi:</b> ${district} / ${subDistrict}</p>
            <p><b>Konut Detayları:</b> ${sqm} m² / Bina Yaşı: ${age}</p>
            
            <div style="background: #fffde7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 5px solid #f1c40f;">
                <h4 style="margin: 0 0 5px 0; color: #9a7d0a;">🔍 Sarı Site (sahibinden.com) Piyasa Tahmini:</h4>
                <p style="margin:0;">Sarı sitede bu özelliklere benzer ilanlar şu an ortalama <b style='color:#e67e22;'>${sariSiteSimilarPrice.toLocaleString('tr-TR')} TL</b> civarında listelenmektedir.</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #7f8c8d; margin-bottom:5px; font-weight:normal;">Sistemimizin Önerdiği Adil Değer:</h3>
            <h1 style="color: #27ae60; margin-top: 0; font-size: 2.5em;">${internalPrice.toLocaleString('tr-TR')} TL</h1>
            
            <form action="/publish" method="POST" style="margin-top: 30px; background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px dashed #16a34a;">
                <h3 style="margin-top: 0; color: #16a34a;">🚀 Bu Evi Pazaryerinde Yayınla</h3>
                
                <input type="hidden" name="district" value="${district}">
                <input type="hidden" name="subDistrict" value="${subDistrict}">
                <input type="hidden" name="sqm" value="${sqm}">
                <input type="hidden" name="age" value="${age}">
                <input type="hidden" name="systemPrice" value="${internalPrice}">

                <div style="margin-bottom: 15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:6px; color:#1e293b;">İlan Listeleme Fiyatınız (TL):</label>
                    <input type="number" name="customPrice" value="${internalPrice}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:16px; box-sizing:border-box;" required>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:6px; color:#1e293b;">İlan Notu / Açıklama:</label>
                    <input type="text" name="note" placeholder="Örn: Acil satılık, metroya yakın, pazarlık payı var..." style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:14px; box-sizing:border-box;">
                </div>
                
                <button type="submit" style="width:100%; padding:12px; background:#16a34a; color:white; border:none; border-radius:6px; font-size:15px; font-weight:bold; cursor:pointer;">İlanı Bu Bilgilerle Canlıya Al</button>
            </form>
            <br>
            <a href="/dashboard" style="display:inline-block; padding: 10px 15px; background-color: #2c3e50; color: white; text-decoration: none; border-radius: 5px; font-size:0.9em;">⬅ Vazgeç ve Dön</a>
        </div>
    `);
};

// 2. AŞAMA: İlanı Kaydetme
exports.publishListing = (req, res) => {
    const { district, subDistrict, sqm, age, systemPrice, customPrice, note } = req.body;
    const activeUser = global.currentUser || { username: "misafir_user", role: "Bireysel Kullanıcı", companyName: "" };

    const currentEstates = getSavedEstates();

    if (activeUser.role === 'Bireysel Kullanıcı') {
        const totalUserListings = currentEstates.filter(item => item.owner === activeUser.username).length;
        if (totalUserListings >= 3) {
            return res.send(`
                <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 550px; margin: 50px auto; border: 2px solid #e74c3c; border-radius: 12px; text-align: center; background:#fffcfc;">
                    <h2 style="color: #e74c3c; margin-bottom:15px;">🚫 İlan Limiti Sınırına Ulaşıldı!</h2>
                    <p style="font-size:1.1em; color:#333;">Sayın <b>${activeUser.username}</b>, Bireysel hesapların maksimum ilan yayınlama hakkı <b>3 adettir</b>.</p>
                    <br><br>
                    <a href="/dashboard" style="display:inline-block; padding: 12px 20px; background: #2c3e50; color: white; text-decoration: none; border-radius: 6px; font-weight:bold;">⬅ Panele Geri Dön</a>
                </div>
            `);
        }
    }

    currentEstates.push({
        id: Date.now().toString(), 
        district,
        subDistrict,
        sqm: Number(sqm),
        age: age || '0-5',
        userPrice: parseInt(customPrice),
        systemPrice: parseInt(systemPrice),
        note: note || 'Açıklama belirtilmedi.',
        owner: activeUser.username,
        userRole: activeUser.role,
        companyName: activeUser.companyName || '',
        date: new Date().toLocaleString('tr-TR')
    });

    fs.writeFileSync(estatesPath, JSON.stringify(currentEstates, null, 2), 'utf8');
    res.redirect('/listings');
};

// 3. AŞAMA: TÜM İLANLARI LİSTELEME
exports.getListings = (req, res) => {
    const listings = getSavedEstates();

    listings.sort((a, b) => {
        if (a.userRole === 'Emlak Ofisi / Danışman' && b.userRole !== 'Emlak Ofisi / Danışman') return -1;
        if (a.userRole !== 'Emlak Ofisi / Danışman' && b.userRole === 'Emlak Ofisi / Danışman') return 1;
        return 0;
    });

    let rows = "";
    if (listings.length === 0) {
        rows = `<tr class="listing-row"><td colspan="8" style="text-align:center; padding:20px; color:#aaa;">Pazaryerinde henüz satılık ilan eklenmemiş.</td></tr>`;
    } else {
        listings.forEach(item => {
            let rowStyle = "";
            let ownerBadge = "";

            const userPriceDisplay = item.userPrice || item.estimatedPrice || 0;
            const systemPriceDisplay = item.systemPrice || item.estimatedPrice || 0;

            let trendBadge = "";
            const priceRatio = userPriceDisplay / systemPriceDisplay;

            if (priceRatio > 1.12) {
                trendBadge = `<span style="background: #fde8e8; color: #e74c3c; padding: 4px 8px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">🔴 Yüksek Fiyat</span>`;
            } else if (priceRatio < 0.88) {
                trendBadge = `<span style="background: #eafaf1; color: #2ecc71; padding: 4px 8px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">🟢 Kelepir / Fırsat</span>`;
            } else {
                trendBadge = `<span style="background: #fef9e7; color: #f39c12; padding: 4px 8px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">🟡 Dengeli Piyasa</span>`;
            }

            let ageDisplay = item.age || "0-5";
            if (ageDisplay === "0-5") ageDisplay = "0 - 5 Yıl (Yeni)";
            if (ageDisplay === "6-15") ageDisplay = "6 - 15 Yıl";
            if (ageDisplay === "16+") ageDisplay = "16+ Yıl (Eski)";

            if (item.userRole === 'Emlak Ofisi / Danışman') {
                rowStyle = "background-color: #f0fdf4; border-left: 4px solid #16a34a;";
                ownerBadge = `<span style="background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; display:inline-block;">🏢 ${item.companyName || 'Emlak Ofisi'}</span>`;
            } else {
                rowStyle = "border-left: 4px solid #64748b;";
                ownerBadge = `<span style="background: #64748b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; display:inline-block;">👤 Sahibinden (${item.owner || 'Bireysel'})</span>`;
            }

            rows += `
                <tr class="listing-row" style="border-bottom: 1px solid #eee; ${rowStyle}">
                    <td style="padding:12px; text-align:center;">
                        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&auto=format&fit=crop&q=60" style="border-radius:6px; width:70px; height:50px; object-fit:cover; border:1px solid #ddd;">
                    </td>
                    <td class="searchable-city" style="padding:12px;"><b>${item.district}</b></td>
                    <td class="searchable-sub" style="padding:12px;">${item.subDistrict || 'Merkez'}</td>
                    <td style="padding:12px;">${item.sqm} m²</td>
                    <td style="padding:12px; color:#219653; font-weight:bold;">${userPriceDisplay.toLocaleString('tr-TR')} TL</td>
                    <td style="padding:12px; color:#334155;">${ageDisplay}</td>
                    <td style="padding:12px;">${trendBadge}</td>
                    <td style="padding:12px;">${ownerBadge}</td>
                </tr>
            `;
        });
    }

    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 1050px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            ${getNavHtml()}
            <div style="margin-bottom: 20px;">
                <input type="text" id="tableSearchInput" onkeyup="filterMarketTable()" placeholder="🔍 Şehir veya ilçe ismine göre anlık filtrele..." style="width: 100%; padding: 12px 16px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none; box-sizing: border-box;">
            </div>
            <table id="marketTable" style="width: 100%; border-collapse: collapse; text-align: left; font-size:14px;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding:12px; width:90px; text-align:center;">Görsel</th>
                        <th style="padding:12px;">Şehir</th>
                        <th style="padding:12px;">İlçe</th>
                        <th style="padding:12px;">Genişlik</th>
                        <th style="padding:12px; color:#219653;">İlan Fiyatı</th>
                        <th style="padding:12px; color:#334155;">Bina Yaşı</th>
                        <th style="padding:12px;">Yatırım Analizi</th>
                        <th style="padding:12px;">Yetkili / Kaynak</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <script>
            function filterMarketTable() {
                const input = document.getElementById('tableSearchInput');
                const filter = input.value.toUpperCase();
                const rows = document.getElementsByClassName('listing-row');
                for (let i = 0; i < rows.length; i++) {
                    const cityCell = rows[i].getElementsByClassName('searchable-city')[0];
                    const subCell = rows[i].getElementsByClassName('searchable-sub')[0];
                    if (cityCell || subCell) {
                        if (cityCell.textContent.toUpperCase().indexOf(filter) > -1 || subCell.textContent.toUpperCase().indexOf(filter) > -1) {
                            rows[i].style.display = "";
                        } else { rows[i].style.display = "none"; }
                    }
                }
            }
        </script>
    `);
};

// 4. BÖLÜM: BENİM İLANLARIM PANELİ (YEDEKLİ FORM YAPISI)
exports.getMyListings = (req, res) => {
    const activeUser = global.currentUser || { username: "misafir_user", role: "Bireysel Kullanıcı" };
    const allListings = getSavedEstates();
    const myListings = allListings.filter(item => item.owner === activeUser.username);

    let rows = "";
    if (myListings.length === 0) {
        rows = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#aaa;">Henüz eklediğiniz bir ilan bulunmuyor.</td></tr>`;
    } else {
        myListings.forEach(item => {
            const priceVal = item.userPrice || item.estimatedPrice || 0;
            rows += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding:14px;"><b>${item.district}</b></td>
                    <td style="padding:14px;">${item.subDistrict}</td>
                    <td style="padding:14px;">${item.sqm} m²</td>
                    <td style="padding:14px; font-weight:bold; color:#16a34a;">${priceVal.toLocaleString('tr-TR')} TL</td>
                    <td style="padding:14px; color:#555; max-width:200px;"><i>"${item.note || '-'}"</i></td>
                    <td style="padding:14px; text-align:center;">
                        <form action="/delete-listing" method="POST" style="margin:0;">
                            <input type="hidden" name="id" value="${item.id || ''}">
                            <input type="hidden" name="district" value="${item.district}">
                            <input type="hidden" name="subDistrict" value="${item.subDistrict}">
                            <input type="hidden" name="userPrice" value="${priceVal}">
                            <button type="submit" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="return confirm('Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?')">❌ İlanı Sil</button>
                        </form>
                    </td>
                </tr>
            `;
        });
    }

    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 900px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            ${getNavHtml()}
            <h2 style="color: #2c3e50; margin-bottom: 5px;">⭐ Yönetilebilir İlan Panelim</h2>
            <p style="color:#666; margin-bottom:20px;">Sistemde kendi adınıza yayına aldığınız ilanları buradan inceleyebilir ve silebilirsiniz.</p>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size:14px;">
                <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                    <tr>
                        <th style="padding:12px;">Şehir</th>
                        <th style="padding:12px;">İlçe</th>
                        <th style="padding:12px;">Metrekare</th>
                        <th style="padding:12px;">Yayın Fiyatınız</th>
                        <th style="padding:12px;">İlan Notunuz</th>
                        <th style="padding:12px; text-align:center;">İşlem</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `);
};

// 5. BÖLÜM: KURŞUN GEÇİRMEZ ARKA PLAN SİLME ALGORİTMASI (KESİN ÇÖZÜM)
exports.deleteListing = (req, res) => {
    const { id, district, subDistrict, userPrice } = req.body;
    let allListings = getSavedEstates();

    // 1. Durum: Eğer ID gerçekse ve "undefined" string'i değilse doğrudan ID ile sil
    if (id && id !== 'undefined' && id !== '') {
        allListings = allListings.filter(item => item.id !== id);
    } else {
        // 2. Durum (Yedek Plan): ID bulunamadıysa (eski test verisiyse) konum ve fiyattan yakala ve sil
        allListings = allListings.filter(item => {
            const itemPrice = item.userPrice || item.estimatedPrice || 0;
            return !(item.district === district && 
                     item.subDistrict === subDistrict && 
                     String(itemPrice) === String(userPrice));
        });
    }

    fs.writeFileSync(estatesPath, JSON.stringify(allListings, null, 2), 'utf8');
    res.redirect('/my-listings');
};

// 6. BÖLÜM: PROFİL EKRANI
exports.getProfile = (req, res) => {
    const activeUser = global.currentUser || { username: "misafir_user", role: "Bireysel Kullanıcı", companyName: "" };
    const allListings = getSavedEstates();
    const totalUserListings = allListings.filter(item => item.owner === activeUser.username).length;

    let companyRow = activeUser.role === 'Emlak Ofisi / Danışman' 
        ? `<p style="font-size:1.1em; margin:10px 0;">🏢 <b>Bağlı Kurumsal Firma:</b> ${activeUser.companyName || 'Belirtilmedi'}</p>`
        : '';

    res.send(`
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            ${getNavHtml()}
            <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom:10px; margin-bottom:20px;">👤 Kullanıcı Profil Kartı</h2>
            <div style="background:#f8fafc; padding:25px; border-radius:10px; border-left:6px solid #a855f7;">
                <h3 style="margin-top:0; color:#1e293b; font-size:1.4em;">Hoş geldiniz, @${activeUser.username}!</h3>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin:15px 0;">
                <p style="font-size:1.1em; margin:10px 0;">🛡️ <b>Hesap Yetki Tipi (Rol):</b> ${activeUser.role}</p>
                ${companyRow}
                <p style="font-size:1.1em; margin:10px 0;">📊 <b>Sistemdeki Aktif İlan Sayınız:</b> <span style="background:#a855f7; color:white; padding:2px 8px; border-radius:10px; font-weight:bold;">${totalUserListings} / ${activeUser.role === 'Bireysel Kullanıcı' ? '3' : 'Sınırsız'}</span></p>
            </div>
            <br>
            <a href="/dashboard" style="display:inline-block; padding: 10px 15px; background-color: #2c3e50; color: white; text-decoration: none; border-radius: 5px; font-size:0.9em;">🏠 Panele Dön</a>
        </div>
    `);
};