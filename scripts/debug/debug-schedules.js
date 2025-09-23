const mongoose = require('mongoose');
const Schedule = require('../../src/models/Schedule');
const Route = require('../../src/models/Route');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for debugging'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function debugScheduleQuery() {
    try {
        console.log('\n=== DEBUGGING SCHEDULE AVAILABILITY ===\n');
        
        const currentDate = new Date();
        console.log('Current Date:', currentDate);
        console.log('Current Date ISO:', currentDate.toISOString());
        
        // Check all schedules (admin view)
        console.log('\n📅 ALL SCHEDULES (Admin View):');
        const allSchedules = await Schedule.find({}).populate('route');
        console.log(`Total schedules in database: ${allSchedules.length}`);
        
        allSchedules.forEach((schedule, index) => {
            console.log(`${index + 1}. Route: ${schedule.route.routeNumber}`);
            console.log(`   Journey Date: ${schedule.journeyDate}`);
            console.log(`   Journey Date ISO: ${schedule.journeyDate.toISOString()}`);
            console.log(`   Is Active: ${schedule.isActive}`);
            console.log(`   Available Seats: ${schedule.availableSeats}`);
            console.log(`   Is Future Date: ${schedule.journeyDate >= currentDate}`);
            console.log(`   Meets User Criteria: ${schedule.isActive && schedule.availableSeats > 0 && schedule.journeyDate >= currentDate}\n`);
        });
        
        // Check user booking criteria
        console.log('\n🔍 USER BOOKING CRITERIA:');
        console.log('- isActive: true');
        console.log('- availableSeats: > 0');
        console.log(`- journeyDate: >= ${currentDate.toISOString()}`);
        
        const userSchedules = await Schedule.find({
            isActive: true,
            availableSeats: { $gt: 0 },
            journeyDate: { $gte: currentDate }
        }).populate('route', 'routeNumber origin destination fare');
        
        console.log(`\n📋 SCHEDULES AVAILABLE FOR USER BOOKING: ${userSchedules.length}`);
        
        if (userSchedules.length === 0) {
            console.log('❌ No schedules meet the user booking criteria!');
            
            // Check each criteria separately
            const activeSchedules = await Schedule.find({ isActive: true });
            console.log(`- Active schedules: ${activeSchedules.length}`);
            
            const schedulesWithSeats = await Schedule.find({ availableSeats: { $gt: 0 } });
            console.log(`- Schedules with available seats: ${schedulesWithSeats.length}`);
            
            const futureSchedules = await Schedule.find({ journeyDate: { $gte: currentDate } });
            console.log(`- Future schedules: ${futureSchedules.length}`);
        } else {
            userSchedules.forEach((schedule, index) => {
                console.log(`${index + 1}. ${schedule.route.routeNumber}: ${schedule.route.origin} → ${schedule.route.destination}`);
                console.log(`   Date: ${schedule.journeyDate.toDateString()}`);
                console.log(`   Available: ${schedule.availableSeats} seats`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error debugging schedules:', error);
    } finally {
        mongoose.connection.close();
    }
}

debugScheduleQuery();
