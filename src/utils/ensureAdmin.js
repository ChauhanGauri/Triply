const User = require('../models/User');

async function ensureAdminSeed() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log(`ℹ️ Admin already present (${existingAdmin.email}).`);
      return existingAdmin;
    }

    const adminData = {
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@transport.com',
      phone: process.env.ADMIN_PHONE || '1234567890',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Default admin seeded:', admin.email);
    return admin;
  } catch (error) {
    console.error('❌ Failed to seed default admin:', error);
    throw error;
  }
}

module.exports = ensureAdminSeed;


