const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// Sayfaları Gösterme
exports.getRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
};

exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
};

// Kayıt İşlemi (Register)
exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.send("Lütfen tüm alanları doldurun.");
    }

    try {
        // Kullanıcı var mı kontrolü
        const existingUser = User.findByUsername(username);
        if (existingUser) {
            return res.send("Bu kullanıcı adı zaten alınmış.");
        }

        // Şifreyi şifreleme (Bcrypt)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı rolüyle birlikte kaydetme
        User.save({ username, password: hashedPassword, role });
        
        // HATA BURADAYDI: Backtick ( ` ) eklendi
        res.send(`<h1>Kayıt Başarılı!</h1><p>Hoş geldin, ${role} ${username}. <a href="/login">Buradan giriş yapabilirsin</a>.</p>`);
        
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        res.status(500).send("Sunucu hatası.");
    }
};

// Giriş İşlemi (Login)
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send("Lütfen kullanıcı adı ve şifrenizi girin.");
    }

    try {
        const user = User.findByUsername(username);
        
        // Kullanıcı yoksa
        if (!user) {
            return res.send("Kullanıcı bulunamadı.");
        }

        // Şifre eşleşiyor mu kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            // Başarılı giriş simülasyonu
            res.send(`<h1>Sisteme Başarıyla Giriş Yapıldı!</h1>
                      <p>Hoş geldin <b>${user.username}</b>. Sisteme <b>${user.role}</b> yetkisiyle bağlandın.</p>
                      <p><i>Fatih ve Bakırköy bölgelerindeki güncel emlak analiz paneline yönlendiriliyorsunuz...</i></p>`);
        } else {
            res.send("Hatalı şifre!");
        }
    } catch (error) {
        console.error("Giriş Hatası:", error);
        res.status(500).send("Sunucu hatası.");
    }
};