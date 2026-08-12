const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: POST /api/auth/register
// Body: { "name": "...", "email": "...", "password": "..." }
router.post('/register', authController.register);

// Route: POST /api/auth/login
// Body: { "email": "...", "password": "..." }
router.post('/login', authController.login);

module.exports = router;