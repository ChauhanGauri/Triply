const express = require('express');
const passengerManifestController = require('../controllers/passengerManifestController');
const { isAuthenticated, isAdmin, apiAuth, apiAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
    console.log(`Passenger Manifest Route accessed: ${req.method} ${req.originalUrl}`);
    next();
});

// Admin manifest routes (protected)
router.get('/admin/manifests', isAuthenticated, isAdmin, passengerManifestController.getAllManifests);
router.get('/admin/manifests/:manifestId', isAuthenticated, isAdmin, passengerManifestController.getManifestById);
router.get('/admin/schedules/:scheduleId/manifest', isAuthenticated, isAdmin, passengerManifestController.getManifestForSchedule);

// Manifest management routes
router.post('/admin/manifests/:manifestId/finalize', isAuthenticated, isAdmin, passengerManifestController.finalizeManifest);
router.post('/admin/manifests/:manifestId/departed', isAuthenticated, isAdmin, passengerManifestController.markDeparted);
router.post('/admin/manifests/sync', isAuthenticated, isAdmin, passengerManifestController.syncAllManifests);

// Passenger status update routes
router.patch('/admin/manifests/:manifestId/passengers/:passengerId/status', isAuthenticated, isAdmin, passengerManifestController.updatePassengerStatus);

// API routes for mobile/external access (protected)
router.get('/api/manifests', apiAuth, apiAdminAuth, passengerManifestController.getAllManifests);
router.get('/api/manifests/:manifestId', apiAuth, apiAdminAuth, passengerManifestController.getManifestById);
router.get('/api/schedules/:scheduleId/manifest', apiAuth, apiAdminAuth, passengerManifestController.getManifestForSchedule);
router.patch('/api/manifests/:manifestId/passengers/:passengerId/status', apiAuth, apiAdminAuth, passengerManifestController.updatePassengerStatus);

module.exports = router;