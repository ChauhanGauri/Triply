const mongoose = require('mongoose');
const Route = require('../../src/models/Route');
const Schedule = require('../../src/models/Schedule');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for migration'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function migrateScheduleData() {
    try {
        console.log('\n=== SCHEDULE DATA MIGRATION ===\n');
        
        // Get all routes with embedded schedules
        const routes = await Route.find({});
        console.log(`Found ${routes.length} routes to process`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const route of routes) {
            console.log(`\nProcessing Route: ${route.routeNumber} (${route.origin} → ${route.destination})`);
            
            // Check if route has embedded schedule
            if (route.schedule && (route.schedule.departureTime || route.schedule.arrivalTime)) {
                console.log('  - Has embedded schedule data');
                
                // Check if a schedule already exists for this route
                const existingSchedule = await Schedule.findOne({ route: route._id });
                
                if (existingSchedule) {
                    console.log('  - Schedule already exists in collection, skipping...');
                    skippedCount++;
                } else {
                    // Create new schedule document
                    const newSchedule = new Schedule({
                        route: route._id,
                        departureTime: route.schedule.departureTime || '09:00',
                        arrivalTime: route.schedule.arrivalTime || '10:00',
                        journeyDate: new Date(), // Default to today
                        driverName: route.schedule.driverName || 'Driver Name',
                        busNumber: route.schedule.busNumber || 'BUS001',
                        isActive: route.isActive !== false
                    });
                    
                    try {
                        await newSchedule.save();
                        console.log('  - ✅ Created new schedule document');
                        migratedCount++;
                    } catch (saveError) {
                        console.log('  - ❌ Error creating schedule:', saveError.message);
                    }
                }
            } else {
                console.log('  - No embedded schedule data found');
            }
            
            // Remove embedded schedule from route
            await Route.findByIdAndUpdate(route._id, {
                $unset: { schedule: 1 }
            });
            console.log('  - Removed embedded schedule from route');
        }
        
        console.log('\n=== MIGRATION SUMMARY ===');
        console.log(`📦 Processed routes: ${routes.length}`);
        console.log(`✅ Migrated schedules: ${migratedCount}`);
        console.log(`⏭️  Skipped (already exist): ${skippedCount}`);
        
        // Verify final counts
        const finalRouteCount = await Route.countDocuments();
        const finalScheduleCount = await Schedule.countDocuments();
        
        console.log('\n=== FINAL VERIFICATION ===');
        console.log(`📍 Total routes: ${finalRouteCount}`);
        console.log(`📅 Total schedules: ${finalScheduleCount}`);
        
        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        mongoose.connection.close();
    }
}

migrateScheduleData();
