const mongoose = require('mongoose');

async function fixDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/public_transportation');
        console.log('✅ Connected to MongoDB');

        // Drop the users collection entirely to remove all indexes
        await mongoose.connection.db.collection('users').drop();
        console.log('✅ Dropped users collection and all its indexes');

        // Disconnect
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        console.log('✅ Database fix completed. You can now create the admin user.');
        
    } catch (error) {
        if (error.message.includes('ns not found')) {
            console.log('✅ Collection already doesn\'t exist - that\'s fine');
        } else {
            console.error('❌ Error:', error.message);
        }
        await mongoose.disconnect();
    }
}

fixDatabase();
