// Direct MongoDB update to add missing fields
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function directUpdate() {
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/public-transport');
    
    try {
        await client.connect();
        console.log('✅ MongoDB connected');
        
        const db = client.db();
        const collection = db.collection('schedules');
        
        console.log('🔄 Adding missing fields to all schedules...\n');
        
        // Update all schedules to add the missing fields
        const result = await collection.updateMany(
            {}, // Match all documents
            {
                $set: {
                    isActive: true,
                    capacity: 40,
                    availableSeats: 40
                }
            }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} schedules\n`);
        
        // Verify the update
        console.log('🔍 Verifying update...');
        const updatedSchedules = await collection.find({}).toArray();
        
        updatedSchedules.forEach((schedule, index) => {
            console.log(`📋 Schedule ${index + 1}:`);
            console.log(`   ID: ${schedule._id}`);
            console.log(`   isActive: ${schedule.isActive} (${typeof schedule.isActive})`);
            console.log(`   capacity: ${schedule.capacity} (${typeof schedule.capacity})`);
            console.log(`   availableSeats: ${schedule.availableSeats} (${typeof schedule.availableSeats})`);
            console.log(`   journeyDate: ${schedule.journeyDate}`);
            console.log('   ---');
        });
        
        // Test queries
        console.log('\n🔍 Testing queries:');
        const activeCount = await collection.countDocuments({ isActive: true });
        const seatsCount = await collection.countDocuments({ availableSeats: { $gt: 0 } });
        const currentDate = new Date();
        const futureCount = await collection.countDocuments({ journeyDate: { $gte: currentDate } });
        const bookableCount = await collection.countDocuments({
            isActive: true,
            availableSeats: { $gt: 0 },
            journeyDate: { $gte: currentDate }
        });
        
        console.log(`   Active schedules: ${activeCount}`);
        console.log(`   Schedules with seats: ${seatsCount}`);
        console.log(`   Future schedules: ${futureCount}`);
        console.log(`   ✅ Bookable schedules: ${bookableCount}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Connection closed');
    }
}

directUpdate();
