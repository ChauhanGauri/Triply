// Script to check all schedules in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/public-transport')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Schedule schema (simplified)
const scheduleSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    departureTime: String,
    arrivalTime: String,
    journeyDate: Date,
    capacity: { type: Number, default: 40 },
    availableSeats: { type: Number, default: 40 },
    isActive: { type: Boolean, default: true },
    busNumber: String,
    driverName: String
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

async function checkSchedules() {
    try {
        console.log('🔍 Checking all schedules in database...\n');
        
        // Get all schedules without population first
        const allSchedules = await Schedule.find({});
        console.log(`📊 Total schedules in database: ${allSchedules.length}\n`);
        
        if (allSchedules.length === 0) {
            console.log('❌ No schedules found in database!');
            return;
        }
        
        // Analyze schedules
        allSchedules.forEach((schedule, index) => {
            console.log(`📋 Schedule ${index + 1}:`);
            console.log(`   ID: ${schedule._id}`);
            console.log(`   Route ID: ${schedule.route}`);
            console.log(`   Journey Date: ${schedule.journeyDate}`);
            console.log(`   Journey Date ISO: ${schedule.journeyDate?.toISOString()}`);
            console.log(`   Departure: ${schedule.departureTime}`);
            console.log(`   Arrival: ${schedule.arrivalTime}`);
            console.log(`   Capacity: ${schedule.capacity}`);
            console.log(`   Available Seats: ${schedule.availableSeats}`);
            console.log(`   Is Active: ${schedule.isActive}`);
            console.log(`   Bus Number: ${schedule.busNumber}`);
            console.log(`   Driver: ${schedule.driverName}`);
            console.log('   ---');
        });
        
        // Count by status
        const activeSchedules = allSchedules.filter(s => s.isActive);
        const schedulesWithSeats = allSchedules.filter(s => s.availableSeats > 0);
        const currentDate = new Date();
        const futureSchedules = allSchedules.filter(s => s.journeyDate >= currentDate);
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total schedules: ${allSchedules.length}`);
        console.log(`   Active schedules: ${activeSchedules.length}`);
        console.log(`   Schedules with available seats: ${schedulesWithSeats.length}`);
        console.log(`   Current date: ${currentDate.toISOString()}`);
        console.log(`   Future schedules (>= current date): ${futureSchedules.length}`);
        
        // Check schedules that meet all criteria
        const availableSchedules = allSchedules.filter(s => 
            s.isActive && s.availableSeats > 0 && s.journeyDate >= currentDate
        );
        console.log(`   ✅ Available for booking: ${availableSchedules.length}`);
        
        if (availableSchedules.length > 0) {
            console.log(`\n🎯 Available schedules for booking:`);
            availableSchedules.forEach((schedule, index) => {
                console.log(`   ${index + 1}. Route: ${schedule.route}, Date: ${schedule.journeyDate?.toISOString()}, Seats: ${schedule.availableSeats}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking schedules:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkSchedules();
