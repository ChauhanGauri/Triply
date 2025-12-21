
// scripts/seed-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/triply';

const ADMIN_EMAIL = 'admin@transport.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

async function seedAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('✅ Admin user already exists:', ADMIN_EMAIL);
    await mongoose.disconnect();
    return;
  }
  const admin = new User({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '+911234567890',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  await admin.save();
  console.log('✅ Admin user created:', ADMIN_EMAIL);
  await mongoose.disconnect();
}

seedAdmin().catch(err => {
  console.error('❌ Error seeding admin user:', err);
  mongoose.disconnect();
});
