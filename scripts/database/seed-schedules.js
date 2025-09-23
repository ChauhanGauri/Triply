const mongoose = require('mongoose');
const Route = require('../../src/models/Route');
const Schedule = require('../../src/models/Schedule');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for seeding'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function seedScheduleData() {
    try {
        console.log('\n=== SEEDING SCHEDULE DATA ===\n');
        
        // Get all routes
        const routes = await Route.find({});
        console.log(`Found ${routes.length} routes`);
        
        if (routes.length === 0) {
            console.log('No routes found. Please create routes first.');
            return;
        }
        
        // Create sample schedules for each route
        const sampleSchedules = [];
        
        for (const route of routes) {
            // Create 2-3 schedules per route with different times
            const scheduleData = [
                {
                    route: route._id,
                    departureTime: '08:00',
                    arrivalTime: '10:30',
                    journeyDate: new Date(2025, 8, 25), // Sept 25, 2025
                    driverName: 'John Smith',
                    busNumber: 'BUS001',
                    isActive: true
                },
                {
                    route: route._id,
                    departureTime: '14:00',
                    arrivalTime: '16:30',
                    journeyDate: new Date(2025, 8, 25), // Sept 25, 2025
                    driverName: 'Jane Doe',
                    busNumber: 'BUS002',
                    isActive: true
                },
                {
                    route: route._id,
                    departureTime: '09:30',
                    arrivalTime: '12:00',
                    journeyDate: new Date(2025, 8, 26), // Sept 26, 2025
                    driverName: 'Bob Wilson',
                    busNumber: 'BUS003',
                    isActive: true
                }
            ];
            
            sampleSchedules.push(...scheduleData);
        }
        
        // Clear existing schedules first
        await Schedule.deleteMany({});
        console.log('Cleared existing schedules');
        
        // Insert new schedules
        const createdSchedules = await Schedule.insertMany(sampleSchedules);
        console.log(`✅ Created ${createdSchedules.length} sample schedules`);
        
        // Display created schedules
        console.log('\n📅 CREATED SCHEDULES:');
        for (const schedule of createdSchedules) {
            const populatedSchedule = await Schedule.findById(schedule._id).populate('route');
            console.log(`- ${populatedSchedule.route.routeNumber}: ${populatedSchedule.route.origin} → ${populatedSchedule.route.destination}`);
            console.log(`  Time: ${populatedSchedule.departureTime} - ${populatedSchedule.arrivalTime}`);
            console.log(`  Date: ${populatedSchedule.journeyDate.toDateString()}`);
            console.log(`  Driver: ${populatedSchedule.driverName}, Bus: ${populatedSchedule.busNumber}\n`);
        }
        
        console.log('✅ Schedule seeding completed!');
        
    } catch (error) {
        console.error('❌ Error seeding schedules:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedScheduleData();
