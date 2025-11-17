const express = require('express');
const bookingController = require('../controllers/bookingController');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Create a new booking with rate limiting
router.post('/', bookingLimiter, bookingController.createBooking.bind(bookingController));

// Get all bookings
router.get('/', bookingController.getAllBookings.bind(bookingController));

// Get bookings by user ID
router.get('/user/:userId', bookingController.getUserBookings.bind(bookingController));

// Get booking statistics
router.get('/statistics', bookingController.getBookingStatistics.bind(bookingController));

// Get seat availability for a schedule
router.get('/schedule/:scheduleId/seats', bookingController.getSeatAvailability.bind(bookingController));

// Get a booking by ID
router.get('/:id', bookingController.getBookingById.bind(bookingController));

// Update a booking by ID
router.put('/:id', bookingController.updateBooking.bind(bookingController));

// Cancel a booking (patch status to cancelled)
router.patch('/:id/cancel', bookingController.cancelBooking.bind(bookingController));

// Delete a booking by ID
router.delete('/:id', bookingController.deleteBooking.bind(bookingController));

module.exports = router;
