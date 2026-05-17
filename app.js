const express = require('express');
const app = express();

// Form verilerini okumak için gerekli ayarlar
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota dosyalarını çağırıyoruz
const authRoutes = require('./routes/authRoutes');
const estateRoutes = require('./routes/estateRoutes');

// Rotaları Express'e bağlıyoruz
app.use('/', authRoutes);
app.use('/', estateRoutes);

// Windows 11 bağlantı sorununu çözmek için 5000 portu ve '0.0.0.0' kullanıyoruz
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🚀 SUNUCU BAŞARIYLA AYAĞA KALKTI!`);
    console.log(`🔗 Test etmek için bu linke tıkla: http://127.0.0.1:${PORT}/login`);
    console.log(`==================================================`);
});