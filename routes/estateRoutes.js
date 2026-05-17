const express = require('express');
const router = express.Router();
const estateController = require('../controllers/estateController');

// 1. Dashboard ekranı
router.get('/', estateController.getDashboard);
router.get('/dashboard', estateController.getDashboard);

// 2. İlk aşama: Ev bilgilerini alıp değer hesaplayan rota
router.post('/calculate', estateController.calculateValuation);

// 3. İkinci aşama: Rapor altından gelen özel fiyatlı ilanı kaydeden YENİ rota
router.post('/publish', estateController.publishListing);

// 4. İlanları listeleyen sayfa
router.get('/listings', estateController.getListings);

module.exports = router;