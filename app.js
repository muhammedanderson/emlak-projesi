const express = require('express');
const path = require('path');
const app = express();

// ==========================================
// 1. VERİ OKUMA KÜTÜPHANELERİ (MIDDLEWARES)
// ==========================================

// Giriş ve Kayıt sayfalarındaki 'fetch/JSON' isteklerini okumak için:
app.use(express.json());

// İlan Silme ve Hesaplama formlarındaki geleneksel HTML POST verilerini okumak için (KRİTİK SATIR!):
app.use(express.urlencoded({ extended: true }));

// Eğer css, resim gibi statik dosyalarınız varsa 'public' klasörünü dışarı açar:
app.use(express.static(path.join(__dirname, 'public')));


// ==========================================
// 2. ROTA ENTEGRASYONLARI (ROUTES)
// ==========================================

const authRoutes = require('./routes/authRoutes');     // Giriş/Kayıt işlemlerinin rotası
const estateRoutes = require('./routes/estateRoutes'); // Emlak/Dashboard/Pazaryeri rotası

// Rotaları uygulamaya bağlıyoruz
app.use('/', authRoutes);
app.use('/', estateRoutes);


// ==========================================
// 3. SUNUCU BAŞLATMA (SERVER LISTEN)
// ==========================================

// Arkadaşlarınız hangi portu seçtiyse (Örn: 3000 veya 5000) buraya yazabilirsiniz.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Emlak Pazaryeri Sunucusu ${PORT} Portunda Aktif!`);
    console.log(`👉 Test etmek için: http://localhost:${PORT}/login`);
    console.log(`=================================================`);
});