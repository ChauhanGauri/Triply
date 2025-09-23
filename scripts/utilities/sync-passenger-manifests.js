// sync-passenger-manifests.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Booking = require('../../src/models/Booking');
const Schedule = require('../../src/models/Schedule');
const Route = require('../../src/models/Route');
const User = require('../../src/models/User');
const PassengerManifest = require('../../src/models/PassengerManifest');

async function syncPassengerManifests() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transport-management');
        console.log('✅ Connected to MongoDB');
        
        // Get all confirmed bookings
        const bookings = await Booking.find({ status: 'confirmed' })
            .populate('schedule')
            .populate('user', 'name email phone');
        
        console.log(`📋 Found ${bookings.length} confirmed bookings to sync`);
        
        if (bookings.length === 0) {
            console.log('ℹ️  No confirmed bookings found to sync');
            await mongoose.disconnect();
            return;
        }
        
        // Group bookings by schedule
        const bookingsBySchedule = {};
        bookings.forEach(booking => {
            if (booking.schedule && booking.schedule._id) {
                const scheduleId = booking.schedule._id.toString();
                if (!bookingsBySchedule[scheduleId]) {
                    bookingsBySchedule[scheduleId] = {
                        schedule: booking.schedule,
                        bookings: []
                    };
                }
                bookingsBySchedule[scheduleId].bookings.push(booking);
            }
        });
        
        console.log(`🚌 Found bookings for ${Object.keys(bookingsBySchedule).length} different schedules`);
        
        let manifestsCreated = 0;
        let manifestsUpdated = 0;
        
        // Process each schedule
        for (const [scheduleId, data] of Object.entries(bookingsBySchedule)) {
            console.log(`\n🔄 Processing schedule ${scheduleId}...`);
            console.log(`   Route: ${data.schedule.route || 'N/A'}`);
            console.log(`   Journey Date: ${data.schedule.journeyDate || 'N/A'}`);
            console.log(`   Bookings: ${data.bookings.length}`);
            
            try {
                // Check if manifest already exists
                let manifest = await PassengerManifest.findOne({ schedule: scheduleId });
                
                if (manifest) {
                    console.log(`   ℹ️  Manifest already exists, updating...`);
                    // Update existing manifest
                    await PassengerManifest.generateForSchedule(scheduleId);
                    manifestsUpdated++;
                } else {
                    console.log(`   ✨ Creating new manifest...`);
                    // Generate new manifest
                    await PassengerManifest.generateForSchedule(scheduleId);
                    manifestsCreated++;
                }
                
                // Get the updated manifest to show details
                const updatedManifest = await PassengerManifest.findOne({ schedule: scheduleId });
                console.log(`   ✅ Manifest has ${updatedManifest.totalPassengers} passengers, ${updatedManifest.totalSeatsBooked} seats booked`);
                
            } catch (error) {
                console.error(`   ❌ Error processing schedule ${scheduleId}:`, error.message);
            }
        }
        
        console.log('\n📊 Sync Summary:');
        console.log(`   📝 Manifests Created: ${manifestsCreated}`);
        console.log(`   🔄 Manifests Updated: ${manifestsUpdated}`);
        console.log(`   📋 Total Bookings Processed: ${bookings.length}`);
        
        // Show final manifest count
        const totalManifests = await PassengerManifest.countDocuments();
        console.log(`   📋 Total Manifests in Database: ${totalManifests}`);
        
        console.log('\n✅ Passenger manifest sync completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during sync:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the sync if this script is executed directly
if (require.main === module) {
    console.log('🚀 Starting passenger manifest sync...');
    syncPassengerManifests()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Sync failed:', error);
            process.exit(1);
        });
}

module.exports = { syncPassengerManifests };
