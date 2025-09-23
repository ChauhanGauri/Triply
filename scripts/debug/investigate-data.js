const mongoose = require('mongoose');
const Route = require('../../src/models/Route');
const Schedule = require('../../src/models/Schedule');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for investigation'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function investigateDataInconsistency() {
    try {
        console.log('\n=== INVESTIGATING DATA INCONSISTENCY ===\n');
        
        // Check all routes
        console.log('📋 ROUTES DATA:');
        const routes = await Route.find({});
        console.log(`Total routes found: ${routes.length}`);
        
        routes.forEach((route, index) => {
            console.log(`\nRoute ${index + 1}:`);
            console.log(`- ID: ${route._id}`);
            console.log(`- Route Number: ${route.routeNumber}`);
            console.log(`- Origin: ${route.origin}`);
            console.log(`- Destination: ${route.destination}`);
            console.log(`- Has embedded schedule: ${route.schedule ? 'YES' : 'NO'}`);
            if (route.schedule) {
                console.log(`- Embedded schedule departure: ${route.schedule.departureTime}`);
                console.log(`- Embedded schedule arrival: ${route.schedule.arrivalTime}`);
            }
        });
        
        // Check all schedules in separate collection
        console.log('\n📅 SCHEDULES COLLECTION DATA:');
        const schedules = await Schedule.find({}).populate('route');
        console.log(`Total schedules found: ${schedules.length}`);
        
        schedules.forEach((schedule, index) => {
            console.log(`\nSchedule ${index + 1}:`);
            console.log(`- ID: ${schedule._id}`);
            console.log(`- Route ID: ${schedule.route ? schedule.route._id : 'NULL'}`);
            console.log(`- Route Number: ${schedule.route ? schedule.route.routeNumber : 'NULL'}`);
            console.log(`- Departure: ${schedule.departureTime}`);
            console.log(`- Arrival: ${schedule.arrivalTime}`);
            console.log(`- Journey Date: ${schedule.journeyDate}`);
            console.log(`- Driver: ${schedule.driverName || 'Not specified'}`);
            console.log(`- Bus Number: ${schedule.busNumber || 'Not specified'}`);
        });
        
        // Check for orphaned schedules
        console.log('\n🔍 CHECKING FOR ORPHANED SCHEDULES:');
        const orphanedSchedules = await Schedule.find({ route: null });
        console.log(`Orphaned schedules (route is null): ${orphanedSchedules.length}`);
        
        // Check for schedules with invalid route references
        const allSchedules = await Schedule.find({});
        let invalidReferences = 0;
        for (const schedule of allSchedules) {
            if (schedule.route) {
                const routeExists = await Route.findById(schedule.route);
                if (!routeExists) {
                    invalidReferences++;
                    console.log(`- Schedule ${schedule._id} references non-existent route ${schedule.route}`);
                }
            }
        }
        console.log(`Schedules with invalid route references: ${invalidReferences}`);
        
        console.log('\n=== INVESTIGATION COMPLETE ===');
        
    } catch (error) {
        console.error('Error during investigation:', error);
    } finally {
        mongoose.connection.close();
    }
}

investigateDataInconsistency();
