// Script to debug the isActive field issue
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/public-transport')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Use the same schema as the application
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

async function debugIsActiveField() {
    try {
        console.log('🔍 Debugging isActive field...\n');
        
        // Get all schedules and inspect the isActive field closely
        const allSchedules = await Schedule.find({});
        console.log(`📊 Total schedules: ${allSchedules.length}\n`);
        
        allSchedules.forEach((schedule, index) => {
            console.log(`📋 Schedule ${index + 1}:`);
            console.log(`   ID: ${schedule._id}`);
            console.log(`   isActive value: ${schedule.isActive}`);
            console.log(`   isActive type: ${typeof schedule.isActive}`);
            console.log(`   isActive === true: ${schedule.isActive === true}`);
            console.log(`   isActive == true: ${schedule.isActive == true}`);
            console.log(`   isActive strict equality check: ${JSON.stringify(schedule.isActive)}`);
            console.log(`   availableSeats value: ${schedule.availableSeats}`);
            console.log(`   availableSeats type: ${typeof schedule.availableSeats}`);
            console.log(`   availableSeats > 0: ${schedule.availableSeats > 0}`);
            console.log('   ---');
        });
        
        // Test different query variations
        console.log('\n🔍 Testing different query variations:');
        
        const query1 = await Schedule.find({ isActive: true });
        console.log(`Query { isActive: true }: ${query1.length} results`);
        
        const query2 = await Schedule.find({ isActive: { $eq: true } });
        console.log(`Query { isActive: { $eq: true } }: ${query2.length} results`);
        
        const query3 = await Schedule.find({ isActive: { $ne: false } });
        console.log(`Query { isActive: { $ne: false } }: ${query3.length} results`);
        
        const query4 = await Schedule.find({ availableSeats: { $gt: 0 } });
        console.log(`Query { availableSeats: { $gt: 0 } }: ${query4.length} results`);
        
        const query5 = await Schedule.find({ availableSeats: 40 });
        console.log(`Query { availableSeats: 40 }: ${query5.length} results`);
        
        // Test the exact combination that's failing
        const failingQuery = await Schedule.find({
            isActive: true,
            availableSeats: { $gt: 0 }
        });
        console.log(`Combined query { isActive: true, availableSeats: { $gt: 0 } }: ${failingQuery.length} results`);
        
    } catch (error) {
        console.error('❌ Error debugging:', error);
    } finally {
        mongoose.connection.close();
    }
}

debugIsActiveField();
