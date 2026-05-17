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
        return res.status(400).json({ success: false, message: "Lütfen tüm alanları doldurun." });
    }

    try {
        // Kullanıcı var mı kontrolü
        const existingUser = User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Bu kullanıcı adı zaten alınmış." });
        }

        // Şifreyi şifreleme (Bcrypt)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı rolüyle birlikte kaydetme
        User.save({ username, password: hashedPassword, role });

        return res.status(201).json({
            success: true,
            message: "Kayıt Başarılı!",
            redirectUrl: "/login"
        });

    } catch (error) {
        console.error("Kayıt Hatası:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

// Giriş İşlemi (Login)
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Lütfen kullanıcı adı ve şifrenizi girin." });
    }

    try {
        const user = User.findByUsername(username);

        // Kullanıcı yoksa
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        // Şifre eşleşiyor mu kontrolü
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Başarılı girişte frontend'e nereye gideceğini JSON olarak söylüyoruz
            return res.status(200).json({
                success: true,
                message: "Giriş başarılı! Yönlendiriliyorsunuz...",
                redirectUrl: "/dashboard"
            });
        } else {
            return res.status(401).json({ success: false, message: "Hatalı şifre!" });
        }
    } catch (error) {
        console.error("Giriş Hatası:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};