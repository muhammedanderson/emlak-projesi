const express = require('express');
const router = express.Router();
const estateController = require('../controllers/estateController');

// 1. Ana sayfaya veya dashboard'a girildiğinde formu göster
router.get('/', estateController.getDashboard);
router.get('/dashboard', estateController.getDashboard);

// 2. Form gönderildiğinde (POST) hesaplama fonksiyonunu çalıştır
router.post('/calculate', estateController.calculateValuation);

// 3. İlanlar sayfasına girildiğinde listeyi göster
router.get('/listings', estateController.getListings);

module.exports = router;