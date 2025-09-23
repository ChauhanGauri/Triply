const mongoose = require('mongoose');
const User = require('../../src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for creating test user'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function createTestUser() {
    try {
        console.log('\n=== CREATING TEST USER ===\n');
        
        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'testuser@example.com' });
        
        if (existingUser) {
            console.log('Test user already exists:');
            console.log(`- ID: ${existingUser._id}`);
            console.log(`- Name: ${existingUser.name}`);
            console.log(`- Email: ${existingUser.email}`);
            console.log(`- Role: ${existingUser.role}`);
        } else {
            // Create a test user
            const testUser = new User({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123',
                role: 'user'
            });
            
            await testUser.save();
            console.log('✅ Test user created successfully:');
            console.log(`- ID: ${testUser._id}`);
            console.log(`- Name: ${testUser.name}`);
            console.log(`- Email: ${testUser.email}`);
            console.log(`- Role: ${testUser.role}`);
            console.log('\nLogin credentials:');
            console.log('Email: testuser@example.com');
            console.log('Password: password123');
        }
        
    } catch (error) {
        console.error('❌ Error creating test user:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestUser();
