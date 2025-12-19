const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const PassengerManifest = require('../models/PassengerManifest');
const Route = require('../models/Route');
const { getIo } = require('../config/socket');
const emailService = require('../utils/emailService');

class BookingController {
    async createBooking(req, res) {
        try {
            
            // Add user ID from URL params for web requests
            if (req.params.userId) {
                req.body.user = req.params.userId;
            }
            
            // Set default status if not provided
            if (!req.body.status) {
                req.body.status = 'confirmed';
            }

            // Set seat count (default to 1 if not provided)
            const seatCount = parseInt(req.body.passengers) || 1;
            req.body.seats = seatCount;
            
            // Get selected seat numbers
            let seatNumbers = [];
            if (req.body.seatNumbers) {
                if (typeof req.body.seatNumbers === 'string') {
                    seatNumbers = req.body.seatNumbers.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                } else if (Array.isArray(req.body.seatNumbers)) {
                    seatNumbers = req.body.seatNumbers.map(s => parseInt(s)).filter(n => !isNaN(n));
                }
            }
            
            // Validate seat numbers
            if (seatNumbers.length !== seatCount) {
                const errorMessage = `Please select exactly ${seatCount} seat(s)`;
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${req.params.userId}/bookings/new?error=${encodeURIComponent(errorMessage)}`);
                }
            }
            
            // Validate seat numbers are in valid range (1-40)
            const invalidSeats = seatNumbers.filter(s => s < 1 || s > 40);
            if (invalidSeats.length > 0) {
                const errorMessage = `Invalid seat numbers: ${invalidSeats.join(', ')}`;
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${req.params.userId}/bookings/new?error=${encodeURIComponent(errorMessage)}`);
                }
            }
            
            req.body.seatNumbers = seatNumbers;
            
            // Check if schedule has enough available seats
            const schedule = await Schedule.findById(req.body.schedule);
            if (!schedule) {
                const errorMessage = 'Selected schedule not found';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${req.params.userId}/bookings/new?error=${encodeURIComponent(errorMessage)}`);
                }
            }

            // Compute and store total price for booking if route fare is available
            try {
                const routeDoc = await Route.findById(schedule.route);
                if (routeDoc && typeof routeDoc.fare === 'number') {
                    req.body.totalPrice = routeDoc.fare * seatCount;
                }
            } catch (e) {
                // ignore if route lookup fails; email will compute amount from route when populated
            }
            
            // Check if any selected seats are already booked
            const alreadyBooked = seatNumbers.filter(seat => schedule.bookedSeats.includes(seat));
            if (alreadyBooked.length > 0) {
                const errorMessage = `Seats ${alreadyBooked.join(', ')} are already booked. Please select different seats.`;
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${req.params.userId}/bookings/new?error=${encodeURIComponent(errorMessage)}`);
                }
            }
            
            if (schedule.availableSeats < seatCount) {
                const errorMessage = `Not enough seats available. Only ${schedule.availableSeats} seats left.`;
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${req.params.userId}/bookings/new?error=${encodeURIComponent(errorMessage)}`);
                }
            }

            // Create the booking
            const newBooking = new Booking(req.body);
            await newBooking.save();
            
            // Update available seats and booked seats in the schedule
            await Schedule.findByIdAndUpdate(req.body.schedule, {
                $inc: { availableSeats: -seatCount },
                $push: { bookedSeats: { $each: seatNumbers } }
            });
            
            // Generate/update passenger manifest for this schedule
            try {
                await PassengerManifest.generateForSchedule(req.body.schedule);
            } catch (manifestError) {
                console.error('Error updating passenger manifest:', manifestError);
                // Continue with booking confirmation even if manifest fails
            }
            
            // Send booking confirmation emails
            try {
                const populatedBooking = await Booking.findById(newBooking._id)
                    .populate('user')
                    .populate({
                        path: 'schedule',
                        populate: { path: 'route' }
                    });

                if (populatedBooking && populatedBooking.user && populatedBooking.schedule && populatedBooking.schedule.route) {
                    // Send confirmation email to customer
                    await emailService.sendBookingConfirmation(
                        populatedBooking,
                        populatedBooking.user,
                        populatedBooking.schedule,
                        populatedBooking.schedule.route
                    );
                    console.log('✅ Booking confirmation email sent to user');

                    // Send notification email to Triply Transport
                    await emailService.sendTriplyBookingNotification(
                        populatedBooking,
                        populatedBooking.user,
                        populatedBooking.schedule,
                        populatedBooking.schedule.route
                    );
                    console.log('✅ Booking notification email sent to triply.transport@gmail.com');
                }
            } catch (emailError) {
                console.error('❌ Error sending booking emails:', emailError);
                // Continue even if email fails - booking is already created
            }
            
            // Emit realtime update to admins and specific user room
            try {
                const io = getIo();
                // populate booking for richer payload
                const populated = await Booking.findById(newBooking._id)
                    .populate('user', 'name email')
                    .populate({ path: 'schedule', populate: { path: 'route' } });
                io.to('admins').emit('bookingCreated', { booking: populated });
                io.to(`user_${populated.user ? populated.user._id : 'unknown'}`).emit('bookingCreated', { booking: populated });
                
                // Emit seat update for the specific schedule
                io.to(`schedule_${req.body.schedule}`).emit('seatsUpdated', {
                    scheduleId: req.body.schedule,
                    bookedSeats: schedule.bookedSeats.concat(seatNumbers),
                    availableSeats: schedule.availableSeats - seatCount
                });
            } catch (emitErr) {
                // Socket might not be initialized in some environments; ignore errors
                console.warn('Socket emit skipped (not initialized):', emitErr.message);
            }

            // Check if this is an API request or web request
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(201).json({ 
                    message: "Booking created successfully", 
                    data: newBooking 
                });
            } else {
                // Redirect for web interface with success message
                res.redirect(`/user/${req.params.userId}/bookings?success=Booking created successfully`);
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            
            let errorMessage = "Error creating booking";
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(e => e.message);
                errorMessage = "Validation error: " + validationErrors.join(", ");
            }
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({ 
                    message: errorMessage, 
                    error: error.message 
                });
            } else {
                res.redirect(`/user/${req.params.userId}/bookings/new?error=${encodeURIComponent(errorMessage)}`);
            }
        }
    }

    async getAllBookings(req, res) {
        try {
            const bookings = await Booking.find().populate('user').populate('schedule');
            res.status(200).json({ message: "Bookings retrieved successfully", data: bookings });
        } catch (error) {
            res.status(500).json({ message: "Error retrieving bookings", error: error.message });
        }
    }

    async getBookingById(req, res) {
        try {
            const booking = await Booking.findById(req.params.id)
                .populate('user', 'name email createdAt updatedAt')
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination fare'
                    }
                });
                
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            
            res.status(200).json({ 
                message: "Booking retrieved successfully", 
                data: booking 
            });
        } catch (error) {
            console.error('Error retrieving booking:', error);
            res.status(500).json({ 
                message: "Error retrieving booking", 
                error: error.message 
            });
        }
    }

    async updateBooking(req, res) {
        try {
            const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
            res.status(200).json({ message: "Booking updated successfully", data: updatedBooking });
        } catch (error) {
            res.status(500).json({ message: "Error updating booking", error: error.message });
        }
    }

    async deleteBooking(req, res) {
        try {
            const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
            if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });
            res.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting booking", error: error.message });
        }
    }

    // Get bookings by user ID for user dashboard
    async getUserBookings(req, res) {
        try {
            const userId = req.params.userId;
            const bookings = await Booking.find({ user: userId })
                .populate('user', 'name email')
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'name origin destination price'
                    }
                })
                .sort({ createdAt: -1 });
            
            res.status(200).json({ 
                message: "User bookings retrieved successfully", 
                data: bookings 
            });
        } catch (error) {
            res.status(500).json({ 
                message: "Error retrieving user bookings", 
                error: error.message 
            });
        }
    }

    // Cancel a booking (change status to cancelled)
    async cancelBooking(req, res) {
        try {
            const bookingId = req.params.id;
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId, 
                { status: 'cancelled' }, 
                { new: true }
            ).populate('user', 'name email')
             .populate({
                path: 'schedule',
                populate: {
                    path: 'route',
                    select: 'name origin destination'
                }
            });
            
            if (!updatedBooking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            // Send cancellation emails
            try {
                if (updatedBooking.user && updatedBooking.schedule && updatedBooking.schedule.route) {
                    // Send cancellation email to customer
                    await emailService.sendBookingCancellation(
                        updatedBooking,
                        updatedBooking.user,
                        updatedBooking.schedule,
                        updatedBooking.schedule.route
                    );

                    // Send notification email to Triply Transport
                    await emailService.sendTriplyCancellationNotification(
                        updatedBooking,
                        updatedBooking.user,
                        updatedBooking.schedule,
                        updatedBooking.schedule.route
                    );
                }
            } catch (emailError) {
                console.error('❌ Error sending cancellation emails:', emailError);
                // Continue even if email fails - booking is already cancelled
            }

            // Emit bookingCancelled to the user who owns this booking
            try {
                const io = getIo();
                // determine user id string
                let userId = 'unknown';
                if (updatedBooking.user) {
                    if (typeof updatedBooking.user === 'string') userId = updatedBooking.user;
                    else if (updatedBooking.user._id) userId = updatedBooking.user._id.toString();
                    else if (updatedBooking.user.id) userId = updatedBooking.user.id;
                }
                io.to(`user_${userId}`).emit('bookingCancelled', { booking: updatedBooking });
                // Also notify admins
                io.to('admins').emit('bookingCancelled', { booking: updatedBooking });
            } catch (emitErr) {
                console.warn('Socket emit skipped (not initialized):', emitErr.message);
            }

            res.status(200).json({ 
                message: "Booking cancelled successfully", 
                data: updatedBooking 
            });
        } catch (error) {
            res.status(500).json({ 
                message: "Error cancelling booking", 
                error: error.message 
            });
        }
    }

    // Get booking statistics for admin dashboard
    async getBookingStatistics(req, res) {
        try {
            const totalBookings = await Booking.countDocuments();
            const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
            const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
            
            // Get bookings by month for chart data
            const monthlyStats = await Booking.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        confirmed: { 
                            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } 
                        },
                        cancelled: { 
                            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } 
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ]);

            res.status(200).json({
                message: "Booking statistics retrieved successfully",
                data: {
                    total: totalBookings,
                    confirmed: confirmedBookings,
                    cancelled: cancelledBookings,
                    monthlyStats
                }
            });
        } catch (error) {
            res.status(500).json({ 
                message: "Error retrieving booking statistics", 
                error: error.message 
            });
        }
    }

    // Process payment and confirm booking
    async confirmBooking(req, res) {
        try {
            const { userId } = req.params;
            const { paymentMethod, cardNumber, expiryDate, cvv, nameOnCard, upiId, bankAccount } = req.body;
            
            // Get pending booking from session
            const bookingData = req.session.pendingBooking;
            
            if (!bookingData) {
                return res.redirect(`/user/${userId}/bookings/new?error=No booking data found. Please start again.`);
            }
            
            // Verify schedule still has enough seats
            const schedule = await Schedule.findById(bookingData.scheduleId);
            if (!schedule || !schedule.isActive || schedule.availableSeats < bookingData.passengerCount) {
                return res.redirect(`/user/${userId}/bookings/new?error=Selected schedule is no longer available`);
            }
            
            // Generate booking ID
            const bookingId = 'BK' + Date.now().toString(36).toUpperCase();
            
            // Parse seat numbers from booking data
            let seatNumbers = [];
            if (bookingData.seatNumbers) {
                if (typeof bookingData.seatNumbers === 'string') {
                    seatNumbers = bookingData.seatNumbers.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                } else if (Array.isArray(bookingData.seatNumbers)) {
                    seatNumbers = bookingData.seatNumbers.map(s => parseInt(s)).filter(n => !isNaN(n));
                }
            }

            // Create booking document
            const newBooking = new Booking({
                user: userId,
                schedule: bookingData.scheduleId,
                seats: bookingData.passengerCount,
                seatNumbers: seatNumbers,
                status: 'confirmed',
                bookingReference: bookingId,
                passengers: bookingData.passengers,
                contactPhone: bookingData.contactPhone,
                totalPrice: bookingData.totalPrice,
                paymentMethod: paymentMethod,
                paymentStatus: 'completed'
            });
            
            await newBooking.save();
            
            // Update available seats and booked seats in the schedule
            await Schedule.findByIdAndUpdate(bookingData.scheduleId, {
                $inc: { availableSeats: -bookingData.passengerCount },
                $push: { bookedSeats: { $each: seatNumbers } }
            });
            
            // Generate/update passenger manifest for this schedule
            try {
                await PassengerManifest.generateForSchedule(bookingData.scheduleId);
            } catch (manifestError) {
                console.error('Error updating passenger manifest:', manifestError);
                // Continue with booking confirmation even if manifest fails
            }
            
            // Send booking confirmation emails
            try {
                const populatedBooking = await Booking.findById(newBooking._id)
                    .populate('user')
                    .populate({
                        path: 'schedule',
                        populate: { path: 'route' }
                    });

                if (populatedBooking && populatedBooking.user && populatedBooking.schedule && populatedBooking.schedule.route) {
                    // Send confirmation email to customer
                    await emailService.sendBookingConfirmation(
                        populatedBooking,
                        populatedBooking.user,
                        populatedBooking.schedule,
                        populatedBooking.schedule.route
                    );
                    console.log('✅ Booking confirmation email sent to user');

                    // Send notification email to Triply Transport
                    await emailService.sendTriplyBookingNotification(
                        populatedBooking,
                        populatedBooking.user,
                        populatedBooking.schedule,
                        populatedBooking.schedule.route
                    );
                    console.log('✅ Booking notification email sent to triply.transport@gmail.com');
                }
            } catch (emailError) {
                console.error('❌ Error sending booking emails:', emailError);
                // Continue even if email fails - booking is already created
            }
            
            // Clear pending booking from session
            delete req.session.pendingBooking;
            
            // Emit realtime update to admins and user room after confirmation
            try {
                const io = getIo();
                const populated = await Booking.findById(newBooking._id)
                    .populate('user', 'name email')
                    .populate({ path: 'schedule', populate: { path: 'route' } });
                io.to('admins').emit('bookingCreated', { booking: populated });
                io.to(`user_${populated.user ? populated.user._id : 'unknown'}`).emit('bookingCreated', { booking: populated });
                
                // Emit seat update for the specific schedule
                const updatedSchedule = await Schedule.findById(bookingData.scheduleId);
                io.to(`schedule_${bookingData.scheduleId}`).emit('seatsUpdated', {
                    scheduleId: bookingData.scheduleId,
                    bookedSeats: updatedSchedule.bookedSeats || [],
                    availableSeats: updatedSchedule.availableSeats
                });
            } catch (emitErr) {
                console.warn('Socket emit skipped (not initialized):', emitErr.message);
            }

            // Check if API request
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(201).json({
                    message: 'Booking confirmed successfully',
                    data: {
                        bookingId: bookingId,
                        booking: newBooking
                    }
                });
            } else {
                // Redirect to success page or booking details
                res.redirect(`/user/${userId}/bookings/${newBooking._id}/success`);
            }
            
        } catch (error) {
            console.error('Error confirming booking:', error);
            
            const errorMessage = 'Error processing payment and confirming booking';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect(`/user/${req.params.userId}/bookings/payment?error=${encodeURIComponent(errorMessage)}`);
            }
        }
    }

    // Cancel booking and return seats
    async cancelBookingWithSeats(req, res) {
        try {
            const { userId, id } = req.params;
            
            // Find the booking
            const booking = await Booking.findOne({ _id: id, user: userId })
                .populate('schedule');
            
            if (!booking) {
                const errorMessage = 'Booking not found';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${userId}/bookings?error=${encodeURIComponent(errorMessage)}`);
                }
            }
            
            if (booking.status === 'cancelled') {
                const errorMessage = 'Booking is already cancelled';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: errorMessage });
                } else {
                    return res.redirect(`/user/${userId}/bookings?error=${encodeURIComponent(errorMessage)}`);
                }
            }
            
            // Update booking status to cancelled
            booking.status = 'cancelled';
            await booking.save();
            
            // Return seats to schedule and remove from bookedSeats array
            await Schedule.findByIdAndUpdate(booking.schedule._id, {
                $inc: { availableSeats: booking.seats },
                $pull: { bookedSeats: { $in: booking.seatNumbers || [] } }
            });
            
            // Update passenger manifest for this schedule
            try {
                await PassengerManifest.generateForSchedule(booking.schedule._id);
            } catch (manifestError) {
                console.error('Error updating passenger manifest after cancellation:', manifestError);
                // Continue with cancellation even if manifest update fails
            }

            // Send cancellation emails
            try {
                // Populate user and route for email sending
                const populatedBooking = await Booking.findById(booking._id)
                    .populate('user')
                    .populate({
                        path: 'schedule',
                        populate: { path: 'route' }
                    });

                if (populatedBooking && populatedBooking.user && populatedBooking.schedule && populatedBooking.schedule.route) {
                    // Send cancellation email to customer
                    await emailService.sendBookingCancellation(
                        populatedBooking,
                        populatedBooking.user,
                        populatedBooking.schedule,
                        populatedBooking.schedule.route
                    );

                    // Send notification email to Triply Transport
                    await emailService.sendTriplyCancellationNotification(
                        populatedBooking,
                        populatedBooking.user,
                        populatedBooking.schedule,
                        populatedBooking.schedule.route
                    );
                }
            } catch (emailError) {
                console.error('❌ Error sending cancellation emails:', emailError);
                // Continue even if email fails - booking is already cancelled
            }
            
            // Emit real-time seat update
            try {
                const io = getIo();
                const updatedSchedule = await Schedule.findById(booking.schedule._id);
                io.to(`schedule_${booking.schedule._id}`).emit('seatsUpdated', {
                    scheduleId: booking.schedule._id,
                    bookedSeats: updatedSchedule.bookedSeats || [],
                    availableSeats: updatedSchedule.availableSeats
                });
            } catch (emitErr) {
                console.warn('Socket emit skipped (not initialized):', emitErr.message);
            }
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: 'Booking cancelled successfully',
                    data: booking
                });
            } else {
                res.redirect(`/user/${userId}/bookings?success=Booking cancelled successfully. Seats have been made available for other passengers.`);
            }
            
        } catch (error) {
            console.error('Error cancelling booking:', error);
            
            const errorMessage = 'Error cancelling booking';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect(`/user/${req.params.userId}/bookings?error=${encodeURIComponent(errorMessage)}`);
            }
        }
    }

    // Get seat availability for a schedule
    async getSeatAvailability(req, res) {
        try {
            const { scheduleId } = req.params;
            
            const schedule = await Schedule.findById(scheduleId);
            
            if (!schedule) {
                return res.status(404).json({ message: 'Schedule not found' });
            }
            
            // Get all confirmed bookings for this schedule to ensure accuracy
            const confirmedBookings = await Booking.find({
                schedule: scheduleId,
                status: 'confirmed'
            }).select('seatNumbers');
            
            // Aggregate all booked seat numbers from confirmed bookings
            const bookedSeatsFromBookings = [];
            confirmedBookings.forEach(booking => {
                if (booking.seatNumbers && Array.isArray(booking.seatNumbers)) {
                    bookedSeatsFromBookings.push(...booking.seatNumbers);
                }
            });
            
            // Merge with schedule's bookedSeats array and remove duplicates
            // Ensure all values are numbers
            const allBookedSeats = [...new Set([
                ...(schedule.bookedSeats || []).map(s => parseInt(s)).filter(s => !isNaN(s)),
                ...bookedSeatsFromBookings.map(s => parseInt(s)).filter(s => !isNaN(s))
            ])].sort((a, b) => a - b);
            
            res.status(200).json({
                scheduleId: schedule._id,
                totalSeats: schedule.capacity,
                availableSeats: schedule.availableSeats,
                bookedSeats: allBookedSeats,
                bookedCount: allBookedSeats.length
            });
        } catch (error) {
            console.error('❌ Error fetching seat availability:', error);
            res.status(500).json({
                message: 'Error fetching seat availability',
                error: error.message
            });
        }
    }
}

module.exports = new BookingController();
