const mongoose = require('mongoose');
const Schedule = require('../../src/models/Schedule');
const Route = require('../../src/models/Route'); // Import Route model for population

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for updating schedules'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function updateSchedulesWithCapacity() {
    try {
        console.log('\n=== UPDATING SCHEDULES WITH CAPACITY ===\n');
        
        // Update all schedules to add capacity and available seats
        const result = await Schedule.updateMany(
            {},
            {
                $set: {
                    capacity: 40,
                    availableSeats: 40,
                    isActive: true
                }
            }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} schedules with capacity information`);
        
        // Verify the updates
        const schedules = await Schedule.find({}).populate('route');
        console.log('\n📅 UPDATED SCHEDULES:');
        schedules.forEach((schedule, index) => {
            console.log(`${index + 1}. ${schedule.route.routeNumber}: ${schedule.route.origin} → ${schedule.route.destination}`);
            console.log(`   Date: ${schedule.journeyDate.toDateString()}`);
            console.log(`   Time: ${schedule.departureTime} - ${schedule.arrivalTime}`);
            console.log(`   Capacity: ${schedule.capacity}, Available: ${schedule.availableSeats}`);
            console.log(`   Active: ${schedule.isActive}\n`);
        });
        
        console.log('✅ Schedule capacity update completed!');
        
    } catch (error) {
        console.error('❌ Error updating schedules:', error);
    } finally {
        mongoose.connection.close();
    }
}

updateSchedulesWithCapacity();
