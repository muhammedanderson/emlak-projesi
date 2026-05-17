const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/estates.json');

const Estate = {
    // Kayıtlı tüm ilanları getir
    getAll: () => {
        try {
            const data = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            return [];
        }
    },
    // Yeni emlak/ilan kaydet
    save: (estateData) => {
        const estates = Estate.getAll();
        estates.push(estateData);
        fs.writeFileSync(dataPath, JSON.stringify(estates, null, 2));
    }
};

module.exports = Estate;