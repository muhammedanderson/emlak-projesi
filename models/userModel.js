const fs = require('fs');
const path = require('path');

// JSON dosyamızın bilgisayardaki tam yolunu buluyoruz
const dataPath = path.join(__dirname, '../data/users.json');

const User = {
    // Tüm kullanıcıları getir
    getAll: () => {
        const data = fs.readFileSync(dataPath);
        return JSON.parse(data);
    },
    // Yeni kullanıcı kaydet
    save: (userData) => {
        const users = User.getAll();
        users.push(userData);
        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
    },
    // Giriş yaparken kullanıcıyı adına göre bul
    findByUsername: (username) => {
        const users = User.getAll();
        return users.find(user => user.username === username);
    }
};

module.exports = User;