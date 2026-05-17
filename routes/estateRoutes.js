const express = require('express');
const router = express.Router();
const estateController = require('../controllers/estateController');

// 1. Dashboard ekranı
router.get('/', estateController.getDashboard);
router.get('/dashboard', estateController.getDashboard);

// 2. Değer Hesaplama ve Raporlama rotası
router.post('/calculate', estateController.calculateValuation);

// 3. İlanı serbest fiyat ve notla canliya alma rotası
router.post('/publish', estateController.publishListing);

// 4. Genel ilan pazaryeri rotası
router.get('/listings', estateController.getListings);

// 5. YENİ: Sadece giriş yapana ait ilan paneli
router.get('/my-listings', estateController.getMyListings);

// 6. YENİ: İlan silme tetiği (POST)
router.post('/delete-listing', estateController.deleteListing);

// 7. YENİ: Profil sayfası rotası
router.get('/profile', estateController.getProfile);

module.exports = router;