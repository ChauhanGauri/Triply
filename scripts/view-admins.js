// Quick script to view all admin users in the system
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/triply';

async function viewAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n📋 Current Admin Users\n' + '='.repeat(60));

    const admins = await User.find({ role: 'admin' }).select('-password');
    
    if (admins.length === 0) {
      console.log('\n❌ No admin users found in the system!\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n✅ Found ${admins.length} admin user(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   📱 Phone: ${admin.phone}`);
      console.log(`   ${admin.isActive ? '✅' : '❌'} Active: ${admin.isActive}`);
      console.log(`   🕒 Created: ${admin.createdAt?.toLocaleDateString() || 'N/A'}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`Total Active Admins: ${admins.filter(a => a.isActive).length}`);
    console.log(`Total Inactive Admins: ${admins.filter(a => !a.isActive).length}\n`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

viewAdmins();
