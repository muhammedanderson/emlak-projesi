const express = require('express');
const router = express.Router();
const estateController = require('../controllers/estateController');

router.get('/dashboard', estateController.getDashboard);
router.post('/evaluate', estateController.calculateValuation);
router.get('/listings', estateController.getListings);

module.exports = router;