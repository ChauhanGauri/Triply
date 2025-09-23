// Migration script to add missing fields to existing schedules
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/public-transport')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Define the current Schedule schema
const scheduleSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    journeyDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    busNumber: { type: String, required: true },
    driverName: { type: String },
    capacity: { type: Number, default: 40 },
    availableSeats: { type: Number, default: 40 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

async function migrateSchedules() {
    try {
        console.log('🔄 Starting schedule migration...\n');
        
        // Find all schedules that are missing the new fields
        const schedulesToUpdate = await Schedule.find({
            $or: [
                { isActive: { $exists: false } },
                { availableSeats: { $exists: false } },
                { capacity: { $exists: false } }
            ]
        });
        
        console.log(`📊 Found ${schedulesToUpdate.length} schedules to update\n`);
        
        if (schedulesToUpdate.length === 0) {
            console.log('✅ No schedules need migration');
            return;
        }
        
        // Update each schedule
        let updatedCount = 0;
        for (const schedule of schedulesToUpdate) {
            console.log(`🔄 Updating schedule ${schedule._id}...`);
            
            const updateData = {};
            
            // Add missing fields with default values
            if (!schedule.isActive && schedule.isActive !== false) {
                updateData.isActive = true;
                console.log('   + Adding isActive: true');
            }
            
            if (!schedule.capacity) {
                updateData.capacity = 40;
                console.log('   + Adding capacity: 40');
            }
            
            if (!schedule.availableSeats) {
                updateData.availableSeats = 40;
                console.log('   + Adding availableSeats: 40');
            }
            
            // Update the schedule
            await Schedule.updateOne(
                { _id: schedule._id },
                { $set: updateData }
            );
            
            updatedCount++;
            console.log(`   ✅ Updated schedule ${schedule._id}\n`);
        }
        
        console.log(`🎉 Migration completed! Updated ${updatedCount} schedules\n`);
        
        // Verify the migration
        console.log('🔍 Verifying migration...');
        const allSchedules = await Schedule.find({});
        const activeSchedules = await Schedule.find({ isActive: true });
        const schedulesWithSeats = await Schedule.find({ availableSeats: { $gt: 0 } });
        
        console.log(`📊 Verification results:`);
        console.log(`   Total schedules: ${allSchedules.length}`);
        console.log(`   Active schedules: ${activeSchedules.length}`);
        console.log(`   Schedules with available seats: ${schedulesWithSeats.length}`);
        
        // Test the booking query
        const currentDate = new Date();
        const bookableSchedules = await Schedule.find({
            isActive: true,
            availableSeats: { $gt: 0 },
            journeyDate: { $gte: currentDate }
        });
        
        console.log(`   ✅ Schedules available for booking: ${bookableSchedules.length}`);
        
        if (bookableSchedules.length > 0) {
            console.log('\n🎯 Available schedules:');
            bookableSchedules.forEach((schedule, index) => {
                console.log(`   ${index + 1}. ID: ${schedule._id}, Date: ${schedule.journeyDate.toISOString()}, Seats: ${schedule.availableSeats}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

migrateSchedules();
