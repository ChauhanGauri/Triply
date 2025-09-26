const mongoose = require('mongoose');
const User = require('../../src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transport_management')
    .then(() => console.log('✅ MongoDB connected for creating test user'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function createTestUser() {
    try {
        console.log('\n=== CREATING ADMIN USER ===\n');
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@transport.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists:');
            console.log(`- ID: ${existingAdmin._id}`);
            console.log(`- Name: ${existingAdmin.name}`);
            console.log(`- Email: ${existingAdmin.email}`);
            console.log(`- Role: ${existingAdmin.role}`);
        } else {
            // Create an admin user
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@transport.com',
                phone: '+1234567890',
                password: 'admin123',
                role: 'admin'
            });
            
            await adminUser.save();
            console.log('✅ Admin user created successfully:');
            console.log(`- ID: ${adminUser._id}`);
            console.log(`- Name: ${adminUser.name}`);
            console.log(`- Email: ${adminUser.email}`);
            console.log(`- Role: ${adminUser.role}`);
            console.log('\nAdmin login credentials:');
            console.log('Email: admin@transport.com');
            console.log('Password: admin123');
        }
        
        console.log('\n=== CREATING TEST USER ===\n');
        
        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'user@transport.com' });
        
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
                email: 'user@transport.com',
                phone: '+0987654321',
                password: 'user123',
                role: 'user'
            });
            
            await testUser.save();
            console.log('✅ Test user created successfully:');
            console.log(`- ID: ${testUser._id}`);
            console.log(`- Name: ${testUser.name}`);
            console.log(`- Email: ${testUser.email}`);
            console.log(`- Role: ${testUser.role}`);
            console.log('\nTest user login credentials:');
            console.log('Email: user@transport.com');
            console.log('Password: user123');
        }
        
    } catch (error) {
        console.error('❌ Error creating users:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestUser();
