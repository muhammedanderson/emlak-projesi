const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kayıt (Register) Rotaları
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerUser);

// Giriş (Login) Rotaları
router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);

module.exports = router;