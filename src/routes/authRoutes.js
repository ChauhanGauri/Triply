const express = require('express');
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

const router = express.Router();

// Login page routes
router.get('/admin/login', redirectIfLoggedIn, authController.renderAdminLogin);
router.get('/user/login', redirectIfLoggedIn, authController.renderUserLogin);

// Login process routes
router.post('/admin/login', authController.adminLogin);
router.post('/user/login', authController.userLogin);

// Registration route (for creating users)
router.post('/register', authController.register);

// Logout route
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

// Check authentication status (API)
router.get('/check', authController.checkAuth);

// Create default admin (for testing)
router.get('/create-admin', authController.createDefaultAdmin);

module.exports = router;