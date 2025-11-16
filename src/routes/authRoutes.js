const express = require('express');
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Login page routes
router.get('/admin/login', redirectIfLoggedIn, authController.renderAdminLogin);
router.get('/user/login', redirectIfLoggedIn, authController.renderUserLogin);

// Login process routes with rate limiting
router.post('/admin/login', loginLimiter, authController.adminLogin);
router.post('/user/login', loginLimiter, authController.userLogin);

// Registration route with rate limiting
router.post('/register', registerLimiter, authController.register);

// Logout route
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

// Check authentication status (API)
router.get('/check', authController.checkAuth);

// Create default admin (for testing)
router.get('/create-admin', authController.createDefaultAdmin);

module.exports = router;