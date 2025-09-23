// Quick test to see schedules without authentication
const mongoose = require('mongoose');
const Schedule = require('../../src/models/Schedule');
const Route = require('../../src/models/Route');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function testBookingQuery() {
    try {
        console.log('\n=== TESTING BOOKING QUERY ===\n');
        
        // Same query as in getNewBooking
        const schedules = await Schedule.find({
            isActive: true,
            availableSeats: { $gt: 0 },
            journeyDate: { $gte: new Date() }
        })
        .populate('route', 'routeNumber origin destination fare')
        .sort({ journeyDate: 1, departureTime: 1 });

        console.log(`Found ${schedules.length} schedules`);
        
        if (schedules.length > 0) {
            console.log('\n📋 Available Schedules:');
            schedules.forEach((schedule, index) => {
                console.log(`${index + 1}. ${schedule.route.routeNumber}: ${schedule.route.origin} → ${schedule.route.destination}`);
                console.log(`   Date: ${schedule.journeyDate.toDateString()}`);
                console.log(`   Time: ${schedule.departureTime} - ${schedule.arrivalTime}`);
                console.log(`   Fare: ₹${schedule.route.fare}`);
                console.log(`   Available Seats: ${schedule.availableSeats}\n`);
            });
        } else {
            console.log('❌ No schedules found!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

testBookingQuery();
