const Booking = require('../models/Booking');
const User = require('../models/User');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const cache = require('../utils/cache');

class DashboardController {
    // Admin Dashboard - Get comprehensive statistics and data
    async getAdminDashboard(req, res) {
        try {
            // Cache key for dashboard statistics
            const statsCacheKey = 'dashboard:admin:stats';
            
            // Try to get statistics from cache, or fetch from database
            const stats = await cache.getOrSet(
                statsCacheKey,
                async () => {
            // Get counts for dashboard statistics
            const totalBookings = await Booking.countDocuments();
            const totalUsers = await User.countDocuments();
            const totalRoutes = await Route.countDocuments();
            const totalSchedules = await Schedule.countDocuments();
            const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
            const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

                    return {
                        totalBookings,
                        totalUsers,
                        totalRoutes,
                        totalSchedules,
                        confirmedBookings,
                        cancelledBookings
                    };
                },
                300 // Cache for 5 minutes
            );
            
            // Cache monthly bookings (they change less frequently)
            const monthlyCacheKey = 'dashboard:admin:monthly';
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const monthlyBookings = await cache.getOrSet(
                monthlyCacheKey,
                async () => {
                    return await Booking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 }
                }
            ]);
                },
                600 // Cache for 10 minutes
            );

            // Cache routes list
            const routesCacheKey = 'routes:all:sorted';
            const routes = await cache.getOrSet(
                routesCacheKey,
                async () => {
                    return await Route.find().sort({ routeNumber: 1 });
                },
                600 // Cache for 10 minutes
            );
            
            // Get recent bookings with populated data (don't cache - always fresh)
            const recentBookings = await Booking.find()
                .populate('user', 'name email')
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination'
                    }
                })
                .sort({ createdAt: -1 })
                .limit(10);

            const dashboardData = {
                stats: stats,
                recentBookings,
                monthlyBookings,
                routes
            };

            res.render('admin/dashboard', { 
                title: 'Admin Dashboard - Booking Management',
                data: dashboardData
            });
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            res.status(500).json({ 
                message: 'Error loading admin dashboard', 
                error: error.message 
            });
        }
    }

    // User Dashboard - Get user-specific booking data
    async getUserDashboard(req, res) {
        try {
            const userId = req.params.userId || req.user?.id; // Assuming user ID from auth middleware or params
            
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            // Get user information
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Get user's bookings with populated data
            const userBookings = await Booking.find({ user: userId })
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination fare'
                    }
                })
                .sort({ createdAt: -1 });

            // Debug: Log booking data structure
            if (userBookings.length > 0) {
                    id: userBookings[0]._id,
                    hasSchedule: !!userBookings[0].schedule,
                    scheduleId: userBookings[0].schedule ? userBookings[0].schedule._id : 'NO SCHEDULE',
                    hasRoute: !!(userBookings[0].schedule && userBookings[0].schedule.route),
                    routeId: userBookings[0].schedule && userBookings[0].schedule.route ? 
                        userBookings[0].schedule.route._id : 'NO ROUTE',
                    routeData: userBookings[0].schedule && userBookings[0].schedule.route ? 
                        {
                            routeNumber: userBookings[0].schedule.route.routeNumber,
                            origin: userBookings[0].schedule.route.origin,
                            destination: userBookings[0].schedule.route.destination,
                            fare: userBookings[0].schedule.route.fare
                        } : 'No route data'
                });
                
                // Check all bookings for missing route data
                let nullRouteCount = 0;
                userBookings.forEach((booking, index) => {
                    if (!booking.schedule || !booking.schedule.route) {
                        nullRouteCount++;
                            hasSchedule: !!booking.schedule,
                            scheduleId: booking.schedule ? booking.schedule._id : null,
                            hasRoute: booking.schedule ? !!booking.schedule.route : false
                        });
                    }
                });
            }

            // Get user booking statistics
            const totalUserBookings = userBookings.length;
            const confirmedUserBookings = userBookings.filter(booking => booking.status === 'confirmed').length;
            const cancelledUserBookings = userBookings.filter(booking => booking.status === 'cancelled').length;

            // Get upcoming bookings (assuming schedules have departure dates)
            const upcomingBookings = userBookings.filter(booking => {
                return booking.status === 'confirmed' && 
                       booking.schedule && 
                       booking.schedule.departureTime && 
                       new Date(booking.schedule.departureTime) > new Date();
            });

            // Get available routes for new bookings
            const availableRoutes = await Route.find().sort({ routeNumber: 1 });
            // Debug: Log route data structure
            if (availableRoutes.length > 0) {
                    id: availableRoutes[0]._id,
                    routeNumber: availableRoutes[0].routeNumber,
                    origin: availableRoutes[0].origin,
                    destination: availableRoutes[0].destination,
                    fare: availableRoutes[0].fare
                });
            }

            const dashboardData = {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                stats: {
                    totalBookings: totalUserBookings,
                    confirmedBookings: confirmedUserBookings,
                    cancelledBookings: cancelledUserBookings,
                    upcomingBookings: upcomingBookings.length
                },
                bookings: userBookings,
                upcomingBookings,
                availableRoutes
            };

            res.render('user/dashboard', { 
                title: 'My Bookings Dashboard',
                data: dashboardData
            });
        } catch (error) {
            console.error('Error loading user dashboard:', error);
            res.status(500).json({ 
                message: 'Error loading user dashboard', 
                error: error.message 
            });
        }
    }

    // Render user profile edit page
    async getUserProfile(req, res) {
        try {
            // Allow optional :userId param (admins) otherwise use session user
            const targetUserId = req.params.userId || req.session?.user?.id;
            if (!targetUserId) return res.redirect('/auth/user/login');

            const user = await User.findById(targetUserId);
            if (!user) {
                return res.status(404).render('error', {
                    title: 'User Not Found',
                    message: 'User not found',
                    error: { status: 404, stack: '' }
                });
            }

            res.render('user/profile', {
                title: 'Edit Profile',
                user,
                success: req.query.success || null,
                error: req.query.error || null
            });
        } catch (error) {
            console.error('Error loading profile page:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading profile page',
                error: error
            });
        }
    }

    // Handle user profile update
    async updateUserProfile(req, res) {
        try {
            // Allow optional :userId param to edit other users (admins)
            const targetUserId = req.params.userId || req.session?.user?.id;
            if (!targetUserId) return res.redirect('/auth/user/login');

            const { name, email, phone, password, confirmPassword } = req.body;

            const user = await User.findById(targetUserId);
            if (!user) return res.redirect(`/user/${targetUserId}/dashboard?error=User not found`);

            // If email changed, ensure uniqueness
            if (email && email !== user.email) {
                const existing = await User.findOne({ email });
                if (existing && existing._id.toString() !== targetUserId) {
                    return res.redirect(`/user/${targetUserId}/profile?error=Email already in use`);
                }
            }

            // Update fields
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;

            // Update password if provided
            if (password) {
                if (password !== confirmPassword) {
                    return res.redirect(`/user/${targetUserId}/profile?error=Passwords do not match`);
                }
                user.password = password; // will be hashed by pre-save hook
            }

            await user.save();

            // If the logged-in user updated their own profile, update session
            if (req.session && req.session.user && req.session.user.id === targetUserId) {
                req.session.user.name = user.name;
                req.session.user.email = user.email;
            }

            // Redirect back to the profile page for the target user
            const redirectPath = req.params.userId ? `/user/${targetUserId}/profile` : '/user/profile';
            return res.redirect(`${redirectPath}?success=Profile updated successfully`);
        } catch (error) {
            console.error('Error updating profile:', error);
            const redirectPath = req.params.userId ? `/user/${req.params.userId}/profile` : '/user/profile';
            return res.redirect(redirectPath + '?error=' + encodeURIComponent(error.message));
        }
    }

    // Get booking statistics for API endpoints
    async getBookingStats(req, res) {
        try {
            const totalBookings = await Booking.countDocuments();
            const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
            const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
            
            // Today's bookings
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const todayBookings = await Booking.countDocuments({
                createdAt: { $gte: today, $lt: tomorrow }
            });

            res.json({
                message: 'Booking statistics retrieved successfully',
                data: {
                    total: totalBookings,
                    confirmed: confirmedBookings,
                    cancelled: cancelledBookings,
                    today: todayBookings
                }
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error retrieving booking statistics', 
                error: error.message 
            });
        }
    }

    // Admin Routes Management
    async getAdminRoutes(req, res) {
        try {
            const routes = await Route.find().sort({ createdAt: -1 });
            res.render('admin/routes', { 
                title: 'Manage Routes',
                routes,
                user: req.session.user,
                error: req.query.error || null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Error fetching routes:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading routes',
                error: error
            });
        }
    }

    async getNewRoute(req, res) {
        res.render('admin/route-form', { 
            title: 'Add New Route',
            route: null,
            user: req.session.user
        });
    }

    async getEditRoute(req, res) {
        try {
            const route = await Route.findById(req.params.id);
            
            if (!route) {
                return res.status(404).render('error', {
                    title: 'Route Not Found',
                    message: 'The route you are looking for does not exist.',
                    error: { status: 404, stack: '' }
                });
            }
            
            res.render('admin/route-form', { 
                title: 'Edit Route',
                route,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching route:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading route',
                error: error
            });
        }
    }

    // Admin Schedules Management
    async getAdminSchedules(req, res) {
        try {
            const schedules = await Schedule.find()
                .populate('route', 'routeNumber origin destination')
                .sort({ createdAt: -1 });
            
            // Filter out schedules with null routes (orphaned references)
            const validSchedules = schedules.filter(schedule => schedule.route !== null);
            
            // Log warning if there are orphaned schedules
            if (schedules.length !== validSchedules.length) {
            }
            
            res.render('admin/schedules', { 
                title: 'Manage Schedules',
                schedules: validSchedules,
                user: req.session.user,
                error: req.query.error || null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Error fetching schedules:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading schedules',
                error: error
            });
        }
    }

    async getNewSchedule(req, res) {
        try {
            const routes = await Route.find().sort({ routeNumber: 1 });
            res.render('admin/schedule-form', { 
                title: 'Add New Schedule',
                schedule: null,
                routes,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching routes for schedule form:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading schedule form',
                error: error
            });
        }
    }

    async getEditSchedule(req, res) {
        try {
            const schedule = await Schedule.findById(req.params.id).populate('route');
            const routes = await Route.find().sort({ routeNumber: 1 });
            if (!schedule) {
                return res.status(404).render('error', {
                    title: 'Schedule Not Found',
                    message: 'The schedule you are looking for does not exist.',
                    error: { status: 404, stack: '' }
                });
            }
            res.render('admin/schedule-form', { 
                title: 'Edit Schedule',
                schedule,
                routes,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching schedule:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading schedule',
                error: error
            });
        }
    }

    // Admin Users Management
    async getAdminUsers(req, res) {
        try {
            const users = await User.find().sort({ createdAt: -1 });
            res.render('admin/users', { 
                title: 'Manage Users',
                users,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading users',
                error: error
            });
        }
    }

    async getNewUser(req, res) {
        res.render('admin/user-form', { 
            title: 'Add New User',
            editUser: null,
            user: req.session.user
        });
    }

    async getEditUser(req, res) {
        try {
            const editUser = await User.findById(req.params.id);
            if (!editUser) {
                return res.status(404).render('error', {
                    title: 'User Not Found',
                    message: 'The user you are looking for does not exist.',
                    error: { status: 404, stack: '' }
                });
            }
            res.render('admin/user-form', { 
                title: 'Edit User',
                editUser,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading user',
                error: error
            });
        }
    }

    // Admin Bookings Management
    async getAdminBookings(req, res) {
        try {
            const bookings = await Booking.find()
                .populate('user', 'name email')
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination'
                    }
                })
                .sort({ createdAt: -1 });

            res.render('admin/bookings', { 
                title: 'Manage Bookings',
                bookings,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching bookings:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading bookings',
                error: error
            });
        }
    }

    // Admin Reports
    async getAdminReports(req, res) {
        try {
            // Get various statistics for reports
            const totalBookings = await Booking.countDocuments();
            const totalUsers = await User.countDocuments();
            const totalRoutes = await Route.countDocuments();
            const totalSchedules = await Schedule.countDocuments();
            
            const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
            const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
            
            // Revenue calculation (assuming price is stored in bookings)
            const revenueData = await Booking.aggregate([
                { $match: { status: 'confirmed' } },
                { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
            ]);
            const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

            res.render('admin/reports', { 
                title: 'Reports & Analytics',
                stats: {
                    totalBookings,
                    totalUsers,
                    totalRoutes,
                    totalSchedules,
                    confirmedBookings,
                    cancelledBookings,
                    totalRevenue
                },
                user: req.session.user
            });
        } catch (error) {
            console.error('Error generating reports:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading reports',
                error: error
            });
        }
    }

    // User Booking Management Methods
    async getUserBookings(req, res) {
        try {
            const { userId } = req.params;
            const bookings = await Booking.find({ user: userId })
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination'
                    }
                })
                .sort({ createdAt: -1 });

            res.render('user/bookings', { 
                title: 'My Bookings',
                bookings,
                user: req.session.user,
                success: req.query.success || null,
                error: req.query.error || null
            });
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading bookings',
                error: error
            });
        }
    }

    async getNewBooking(req, res) {
        try {
            const { userId } = req.params;
            const { routeId } = req.query; // Get routeId from query parameters
            
            // Build query for available schedules
            const currentDate = new Date();
            let scheduleQuery = {
                isActive: true,
                availableSeats: { $gt: 0 },
                journeyDate: { $gte: currentDate }
            };
            
            // Add route filter if routeId is provided
            if (routeId) {
                scheduleQuery.route = routeId;
            }
            
            // Get available schedules (active, with available seats, future dates)
            const schedules = await Schedule.find(scheduleQuery)
            .populate('route', 'routeNumber origin destination fare')
            .sort({ journeyDate: 1, departureTime: 1 });

            // Recalculate available seats based on confirmed bookings only
            const Booking = require('../models/Booking');
            for (let schedule of schedules) {
                // Count confirmed bookings for this schedule
                const confirmedBookings = await Booking.find({
                    schedule: schedule._id,
                    status: 'confirmed'
                }).select('seats seatNumbers');
                
                // Collect all unique booked seat numbers from confirmed bookings
                const bookedSeatNumbers = new Set();
                
                confirmedBookings.forEach(booking => {
                    if (booking.seatNumbers && Array.isArray(booking.seatNumbers)) {
                        booking.seatNumbers.forEach(seat => {
                            const seatNum = parseInt(seat);
                            if (!isNaN(seatNum) && seatNum >= 1 && seatNum <= schedule.capacity) {
                                bookedSeatNumbers.add(seatNum);
                            }
                        });
                    }
                });
                
                // Calculate available seats: capacity - number of unique booked seats
                const totalBookedSeats = bookedSeatNumbers.size;
                const calculatedAvailableSeats = schedule.capacity - totalBookedSeats;
                
                // Update the schedule object with recalculated values
                schedule.availableSeats = Math.max(0, calculatedAvailableSeats);
                schedule.bookedSeats = Array.from(bookedSeatNumbers).sort((a, b) => a - b);
            }

            // Filter out schedules with 0 available seats after recalculation
            const availableSchedules = schedules.filter(s => s.availableSeats > 0);

            res.render('user/select-route', {
                title: routeId ? 'Select Schedule for Route' : 'Select Route & Schedule',
                schedules: availableSchedules,
                user: req.session.user,
                error: req.query.error || null,
                success: req.query.success || null,
                selectedRouteId: routeId || null // Pass the selected route ID to the view
            });
        } catch (error) {
            console.error('Error fetching schedules for booking:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading booking form',
                error: error
            });
        }
    }

    async getBookingDetails(req, res) {
        try {
            const { userId, id } = req.params;
            const booking = await Booking.findOne({ _id: id, user: userId })
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination fare'
                    }
                });

            if (!booking) {
                return res.status(404).render('error', {
                    title: 'Booking Not Found',
                    message: 'The booking you are looking for does not exist.',
                    error: { status: 404, stack: '' }
                });
            }

            res.render('user/booking-details', { 
                title: 'Booking Details',
                booking,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching booking details:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading booking details',
                error: error
            });
        }
    }

    async getBookingForm(req, res) {
        try {
            const { userId } = req.params;
            const scheduleId = req.query.schedule;

            if (!scheduleId) {
                return res.redirect(`/user/${userId}/bookings/new?error=Please select a schedule first`);
            }

            // Verify schedule exists and is available
            const schedule = await Schedule.findById(scheduleId)
                .populate('route', 'routeNumber origin destination fare');

            if (!schedule || !schedule.isActive || schedule.availableSeats <= 0) {
                return res.redirect(`/user/${userId}/bookings/new?error=Selected schedule is no longer available`);
            }

            res.render('user/booking-details', {
                title: 'Booking Details',
                schedule,
                user: req.session.user,
                error: req.query.error || null
            });
        } catch (error) {
            console.error('Error loading booking form:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading booking form',
                error: error
            });
        }
    }

    async processBooking(req, res) {
        try {
            const { userId } = req.params;
            const { scheduleId, passengerCount, contactPhone, totalPrice, passengers, seatNumbers } = req.body;


            // Verify schedule exists and has enough seats
            const schedule = await Schedule.findById(scheduleId)
                .populate('route', 'routeNumber origin destination fare');

            if (!schedule || !schedule.isActive) {
                return res.redirect(`/user/${userId}/bookings/new?error=Selected schedule is no longer available`);
            }

            if (schedule.availableSeats < parseInt(passengerCount)) {
                return res.redirect(`/user/${userId}/bookings/new?error=Not enough seats available`);
            }

            // Parse seat numbers
            let parsedSeatNumbers = [];
            if (seatNumbers) {
                if (typeof seatNumbers === 'string') {
                    parsedSeatNumbers = seatNumbers.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                } else if (Array.isArray(seatNumbers)) {
                    parsedSeatNumbers = seatNumbers.map(s => parseInt(s)).filter(n => !isNaN(n));
                }
            }

            // Validate seat numbers
            if (parsedSeatNumbers.length !== parseInt(passengerCount)) {
                return res.redirect(`/user/${userId}/bookings/new?error=Please select exactly ${passengerCount} seat(s)`);
            }

            // Check if any selected seats are already booked
            const alreadyBooked = parsedSeatNumbers.filter(seat => schedule.bookedSeats && schedule.bookedSeats.includes(seat));
            if (alreadyBooked.length > 0) {
                return res.redirect(`/user/${userId}/bookings/new?error=Seats ${alreadyBooked.join(', ')} are already booked. Please select different seats.`);
            }

            // Prepare booking data for payment page
            const bookingData = {
                scheduleId,
                userId,
                route: schedule.route,
                schedule: {
                    journeyDate: schedule.journeyDate,
                    departureTime: schedule.departureTime,
                    arrivalTime: schedule.arrivalTime,
                    busNumber: schedule.busNumber,
                    driverName: schedule.driverName
                },
                passengers: Array.isArray(passengers) ? passengers : [passengers],
                contactPhone,
                totalPrice: parseFloat(totalPrice),
                passengerCount: parseInt(passengerCount),
                seatNumbers: parsedSeatNumbers
            };

            // Store booking data in session for payment processing
            req.session.pendingBooking = bookingData;

            res.render('user/payment', {
                title: 'Payment',
                bookingData,
                user: req.session.user,
                error: req.query.error || null
            });
        } catch (error) {
            console.error('Error processing booking:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error processing booking details',
                error: error
            });
        }
    }

    async getPaymentPage(req, res) {
        try {
            const { userId } = req.params;
            const bookingData = req.session.pendingBooking;

            if (!bookingData) {
                return res.redirect(`/user/${userId}/bookings/new?error=No booking data found. Please start again.`);
            }

            res.render('user/payment', {
                title: 'Payment',
                bookingData,
                user: req.session.user,
                error: req.query.error || null
            });
        } catch (error) {
            console.error('Error loading payment page:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading payment page',
                error: error
            });
        }
    }

    async getBookingSuccess(req, res) {
        try {
            const { userId, id } = req.params;
            
            // Find the booking with populated data
            const booking = await Booking.findOne({ _id: id, user: userId })
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination fare'
                    }
                });

            if (!booking) {
                return res.status(404).render('error', {
                    title: 'Booking Not Found',
                    message: 'The booking you are looking for does not exist.',
                    error: { status: 404, stack: '' }
                });
            }

            res.render('user/booking-success', {
                title: 'Booking Confirmed',
                booking,
                user: req.session.user,
                success: 'Booking confirmed successfully!'
            });
        } catch (error) {
            console.error('Error loading booking success page:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading booking confirmation',
                error: error
            });
        }
    }

    // Browse all available routes (for users)
    async getBrowseRoutes(req, res) {
        try {
            console.log('🗺️ Loading browse routes page');
            
            // Get all active routes, sorted by route number
            const routes = await Route.find({ isActive: true }).sort({ routeNumber: 1 });
            
            console.log(`📋 Found ${routes.length} active routes`);

            res.render('user/browse-routes', {
                title: 'Browse Routes - Triply',
                routes
            });
        } catch (error) {
            console.error('Error loading browse routes:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading routes',
                error: error
            });
        }
    }
}

module.exports = new DashboardController();