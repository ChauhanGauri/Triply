const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Booking = require('../../src/models/Booking');
const Schedule = require('../../src/models/Schedule');
const Route = require('../../src/models/Route');

async function diagnoseBookings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check bookings
        const bookings = await Booking.find().limit(5);
        console.log('\n=== RAW BOOKINGS ===');
        bookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
                id: booking._id,
                scheduleId: booking.schedule,
                status: booking.status,
                createdAt: booking.createdAt
            });
        });

        // Check schedules
        const schedules = await Schedule.find().limit(5);
        console.log('\n=== RAW SCHEDULES ===');
        schedules.forEach((schedule, index) => {
            console.log(`Schedule ${index + 1}:`, {
                id: schedule._id,
                routeId: schedule.route,
                journeyDate: schedule.journeyDate,
                busNumber: schedule.busNumber
            });
        });

        // Check routes
        const routes = await Route.find().limit(5);
        console.log('\n=== RAW ROUTES ===');
        routes.forEach((route, index) => {
            console.log(`Route ${index + 1}:`, {
                id: route._id,
                routeNumber: route.routeNumber,
                origin: route.origin,
                destination: route.destination,
                fare: route.fare
            });
        });

        // Check populated bookings
        console.log('\n=== POPULATED BOOKINGS ===');
        const populatedBookings = await Booking.find()
            .populate({
                path: 'schedule',
                populate: {
                    path: 'route',
                    select: 'routeNumber origin destination fare'
                }
            })
            .limit(3);

        populatedBookings.forEach((booking, index) => {
            console.log(`\nPopulated Booking ${index + 1}:`);
            console.log('- Booking ID:', booking._id);
            console.log('- Has Schedule:', !!booking.schedule);
            
            if (booking.schedule) {
                console.log('- Schedule ID:', booking.schedule._id);
                console.log('- Has Route:', !!booking.schedule.route);
                
                if (booking.schedule.route) {
                    console.log('- Route Details:', {
                        id: booking.schedule.route._id,
                        routeNumber: booking.schedule.route.routeNumber,
                        origin: booking.schedule.route.origin,
                        destination: booking.schedule.route.destination,
                        fare: booking.schedule.route.fare
                    });
                } else {
                    console.log('- Route: NULL');
                }
            } else {
                console.log('- Schedule: NULL');
            }
        });

        // Check for orphaned data
        console.log('\n=== ORPHANED DATA CHECK ===');
        
        // Check for bookings with missing schedules
        const bookingsWithSchedules = await Booking.aggregate([
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'schedule',
                    foreignField: '_id',
                    as: 'scheduleData'
                }
            },
            {
                $match: {
                    scheduleData: { $size: 0 }
                }
            }
        ]);
        console.log(`Bookings with missing schedules: ${bookingsWithSchedules.length}`);

        // Check for schedules with missing routes
        const schedulesWithRoutes = await Schedule.aggregate([
            {
                $lookup: {
                    from: 'routes',
                    localField: 'route',
                    foreignField: '_id',
                    as: 'routeData'
                }
            },
            {
                $match: {
                    routeData: { $size: 0 }
                }
            }
        ]);
        console.log(`Schedules with missing routes: ${schedulesWithRoutes.length}`);

        if (schedulesWithRoutes.length > 0) {
            console.log('Schedules with missing routes:', schedulesWithRoutes.map(s => ({
                scheduleId: s._id,
                routeId: s.route
            })));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

diagnoseBookings();
