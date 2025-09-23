// Script to check raw database structure
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkRawDatabase() {
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/public-transport');
    
    try {
        await client.connect();
        console.log('✅ MongoDB connected');
        
        const db = client.db();
        
        // List all collections
        console.log('\n🔍 Collections in database:');
        const collections = await db.listCollections().toArray();
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });
        
        // Check schedules collection directly
        console.log('\n🔍 Checking schedules collection:');
        const schedulesCollection = db.collection('schedules');
        const schedules = await schedulesCollection.find({}).toArray();
        
        console.log(`📊 Documents in 'schedules' collection: ${schedules.length}`);
        
        if (schedules.length > 0) {
            console.log('\n📋 Raw document structure:');
            const sample = schedules[0];
            console.log('Field names and values:');
            Object.keys(sample).forEach(key => {
                console.log(`   ${key}: ${JSON.stringify(sample[key])} (${typeof sample[key]})`);
            });
            
            console.log('\n📋 All schedules raw data:');
            schedules.forEach((schedule, index) => {
                console.log(`   Schedule ${index + 1}:`);
                console.log(`     _id: ${schedule._id}`);
                console.log(`     isActive: ${JSON.stringify(schedule.isActive)} (${typeof schedule.isActive})`);
                console.log(`     availableSeats: ${JSON.stringify(schedule.availableSeats)} (${typeof schedule.availableSeats})`);
                console.log(`     journeyDate: ${JSON.stringify(schedule.journeyDate)} (${typeof schedule.journeyDate})`);
            });
        }
        
        // Try alternative collection names
        console.log('\n🔍 Checking alternative collection names:');
        const alternativeNames = ['Schedule', 'SCHEDULES', 'Schedules'];
        for (const name of alternativeNames) {
            const collection = db.collection(name);
            const count = await collection.countDocuments();
            console.log(`   ${name}: ${count} documents`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

checkRawDatabase();
