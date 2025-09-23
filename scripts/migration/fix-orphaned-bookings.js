const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Booking = require('../../src/models/Booking');
const Schedule = require('../../src/models/Schedule');

async function fixOrphanedBookings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find bookings with missing schedules
        const orphanedBookings = await Booking.aggregate([
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

        console.log(`Found ${orphanedBookings.length} orphaned bookings`);

        if (orphanedBookings.length > 0) {
            console.log('\nOrphaned bookings:');
            orphanedBookings.forEach((booking, index) => {
                console.log(`${index + 1}. Booking ID: ${booking._id}, Schedule ID: ${booking.schedule}, Status: ${booking.status}`);
            });

            // Option 1: Delete orphaned bookings (safest approach)
            console.log('\nDeleting orphaned bookings...');
            const deleteResult = await Booking.deleteMany({
                _id: { $in: orphanedBookings.map(b => b._id) }
            });
            console.log(`Deleted ${deleteResult.deletedCount} orphaned bookings`);
        } else {
            console.log('No orphaned bookings found');
        }

        // Verify the fix
        console.log('\n=== VERIFICATION ===');
        const remainingBookings = await Booking.find()
            .populate({
                path: 'schedule',
                populate: {
                    path: 'route',
                    select: 'routeNumber origin destination fare'
                }
            })
            .limit(3);

        console.log(`Remaining bookings: ${remainingBookings.length}`);
        remainingBookings.forEach((booking, index) => {
            console.log(`\nBooking ${index + 1}:`);
            console.log('- Has Schedule:', !!booking.schedule);
            if (booking.schedule) {
                console.log('- Has Route:', !!booking.schedule.route);
                if (booking.schedule.route) {
                    console.log('- Route Number:', booking.schedule.route.routeNumber);
                    console.log('- Origin → Destination:', `${booking.schedule.route.origin} → ${booking.schedule.route.destination}`);
                }
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

fixOrphanedBookings();
