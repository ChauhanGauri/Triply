const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const bookingController = require('../controllers/bookingController');
const routeController = require('../controllers/routeController');
const scheduleController = require('../controllers/scheduleController');
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin, isUser, apiAuth, apiAdminAuth } = require('../middleware/auth');
const { getRedisClient } = require('../config/redis');

const router = express.Router();

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
    console.log(`Dashboard Route accessed: ${req.method} ${req.originalUrl}`);
    console.log('User session:', req.session.user);
    next();
});

// Public browse schedules page (for all users - no auth required)
router.get('/schedules', scheduleController.browseSchedules);
router.get('/user/schedule', (req, res) => res.redirect('/schedules'));
router.get('/user/schedules', (req, res) => res.redirect('/schedules'));

// Admin dashboard routes (protected)
router.get('/admin', isAuthenticated, isAdmin, dashboardController.getAdminDashboard);
router.get('/admin/dashboard', isAuthenticated, isAdmin, dashboardController.getAdminDashboard);

// Admin management routes
router.get('/admin/routes', isAuthenticated, isAdmin, dashboardController.getAdminRoutes);
router.get('/admin/routes/new', isAuthenticated, isAdmin, dashboardController.getNewRoute);
router.post('/admin/routes', isAuthenticated, isAdmin, routeController.createRoute);
router.get('/admin/routes/:id/edit', isAuthenticated, isAdmin, dashboardController.getEditRoute);
router.put('/admin/routes/:id', isAuthenticated, isAdmin, routeController.updateRoute);
router.delete('/admin/routes/:id', isAuthenticated, isAdmin, routeController.deleteRoute);

router.get('/admin/schedules', isAuthenticated, isAdmin, dashboardController.getAdminSchedules);
router.get('/admin/schedule', (req, res) => res.redirect('/admin/schedules')); // Redirect singular to plural
router.get('/admin/schedules/new', isAuthenticated, isAdmin, dashboardController.getNewSchedule);
router.post('/admin/schedules', isAuthenticated, isAdmin, scheduleController.createSchedule);
router.get('/admin/schedules/:id/edit', isAuthenticated, isAdmin, dashboardController.getEditSchedule);
router.put('/admin/schedules/:id', isAuthenticated, isAdmin, scheduleController.updateSchedule);
router.delete('/admin/schedules/:id', isAuthenticated, isAdmin, scheduleController.deleteSchedule);

router.get('/admin/users', isAuthenticated, isAdmin, dashboardController.getAdminUsers);
router.get('/admin/users/new', isAuthenticated, isAdmin, dashboardController.getNewUser);
router.post('/admin/users', isAuthenticated, isAdmin, userController.createUser);
router.get('/admin/users/:id/edit', isAuthenticated, isAdmin, dashboardController.getEditUser);
router.put('/admin/users/:id', isAuthenticated, isAdmin, userController.updateUser);
router.delete('/admin/users/:id', isAuthenticated, isAdmin, userController.deleteUser);

router.get('/admin/bookings', isAuthenticated, isAdmin, dashboardController.getAdminBookings);
router.get('/admin/reports', isAuthenticated, isAdmin, dashboardController.getAdminReports);

// User profile (edit) routes - MUST be before :userId routes to avoid matching "profile" as userId
router.get('/user/profile', isAuthenticated, isUser, dashboardController.getUserProfile);
router.put('/user/profile', isAuthenticated, isUser, dashboardController.updateUserProfile);

// User dashboard routes (protected)
router.get('/user/:userId', isAuthenticated, isUser, dashboardController.getUserDashboard);
router.get('/user/:userId/dashboard', isAuthenticated, isUser, dashboardController.getUserDashboard);

// Allow accessing profile by userId (admins can edit others; users can edit own profile)
router.get('/user/:userId/profile', isAuthenticated, isUser, dashboardController.getUserProfile);
router.put('/user/:userId/profile', isAuthenticated, isUser, dashboardController.updateUserProfile);

// User booking management routes (protected)
router.get('/user/:userId/bookings', isAuthenticated, isUser, dashboardController.getUserBookings);
router.get('/user/:userId/bookings/new', isAuthenticated, isUser, dashboardController.getNewBooking);
router.get('/user/:userId/bookings/select-route', isAuthenticated, isUser, dashboardController.getNewBooking);
router.get('/user/:userId/bookings/form', isAuthenticated, isUser, dashboardController.getBookingForm);
router.post('/user/:userId/bookings/process', isAuthenticated, isUser, dashboardController.processBooking);
router.get('/user/:userId/bookings/payment', isAuthenticated, isUser, dashboardController.getPaymentPage);
router.post('/user/:userId/bookings/confirm', isAuthenticated, isUser, bookingController.confirmBooking);

// TEMPORARY: Test route to debug schedules without authentication
router.get('/test/bookings/schedules', dashboardController.getNewBooking);

router.post('/user/:userId/bookings', isAuthenticated, isUser, bookingController.createBooking);
router.get('/user/:userId/bookings/:id', isAuthenticated, isUser, dashboardController.getBookingDetails);
router.get('/user/:userId/bookings/:id/success', isAuthenticated, isUser, dashboardController.getBookingSuccess);
router.patch('/user/:userId/bookings/:id/cancel', isAuthenticated, isUser, bookingController.cancelBookingWithSeats);

// API routes for dashboard data (protected)
router.get('/api/stats', apiAuth, apiAdminAuth, dashboardController.getBookingStats);
router.get('/api/bookings/user/:userId', apiAuth, bookingController.getUserBookings);
router.patch('/api/bookings/:id/cancel', apiAuth, bookingController.cancelBookingWithSeats);
router.get('/api/bookings/statistics', apiAuth, apiAdminAuth, bookingController.getBookingStatistics);

// Admin utility route - Clear Redis cache (for testing)
router.get('/admin/clear-cache', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const client = getRedisClient();
        await client.flushAll();
        console.log('🗑️ Redis cache cleared by admin');
        res.send("✅ Redis cache cleared!");
    } catch (error) {
        console.error('❌ Error clearing Redis cache:', error);
        res.status(500).send("❌ Error clearing cache: " + error.message);
    }
});

// Legacy route - redirect to admin dashboard
router.get('/', dashboardController.getAdminDashboard);

module.exports = router;
