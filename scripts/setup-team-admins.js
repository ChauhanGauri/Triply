// Script to set up multiple admin users for the team
// This will create 4 admin accounts and remove the old single admin

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/triply';

// Team admin configurations
// UPDATE THESE WITH YOUR ACTUAL TEAM MEMBER DETAILS
const TEAM_ADMINS = [
  {
    name: 'Ridhima Sharma',
    email: 'sharmaridhima2004@gmail.com',
    phone: '+91 72289 51044',
    password: 'ridhima123' // They should change this on first login
  },
  {
    name: 'Aditya Vikram Chawla',
    email: 'chawlaadityavikram@gmail.com',
    phone: '+91 70180 13625',
    password: 'aditya123'
  },
  {
    name: 'Dipanshu Rajpal',
    email: 'rajpaldipanshu07@gmail.com',
    phone: '+91 97810 19152',
    password: 'dipanshu123'
  },
  {
    name: 'Gauri Chauhan',
    email: 'gaurichauhan2212@gmail.com',
    phone: '+91 99887 41722',
    password: 'gauri123'
  }
];

// Old admin emails to remove
const OLD_ADMIN_EMAILS = [
  'admin@transport.com',
  'admin@triply.com'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupTeamAdmins() {
  try {
    console.log('\n🚀 Team Admin Setup Script');
    console.log('==========================\n');

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Show current admin users
    const currentAdmins = await User.find({ role: 'admin' });
    console.log(`📊 Current admin users: ${currentAdmins.length}`);
    currentAdmins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });
    console.log('\n');

    // Show what will be added
    console.log('📝 New team admins to be created:');
    TEAM_ADMINS.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} - ${admin.email}`);
    });
    console.log('\n');

    // Show what will be removed
    console.log('🗑️  Old admin accounts to be removed:');
    OLD_ADMIN_EMAILS.forEach(email => {
      const exists = currentAdmins.find(a => a.email === email);
      console.log(`   - ${email} ${exists ? '(exists)' : '(not found)'}`);
    });
    console.log('\n');

    // Confirmation
    const confirm = await askQuestion('⚠️  Do you want to proceed? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Operation cancelled');
      rl.close();
      await mongoose.disconnect();
      return;
    }

    console.log('\n🔄 Processing...\n');

    // Remove old admin accounts
    let removedCount = 0;
    for (const email of OLD_ADMIN_EMAILS) {
      const result = await User.deleteOne({ email, role: 'admin' });
      if (result.deletedCount > 0) {
        console.log(`✅ Removed old admin: ${email}`);
        removedCount++;
      }
    }
    if (removedCount === 0) {
      console.log('ℹ️  No old admin accounts found to remove');
    }

    console.log('\n');

    // Create new team admin accounts
    let createdCount = 0;
    let skippedCount = 0;

    for (const adminData of TEAM_ADMINS) {
      try {
        // Check if admin already exists
        const existing = await User.findOne({ email: adminData.email });
        
        if (existing) {
          console.log(`⚠️  Admin already exists: ${adminData.email}`);
          
          // Update role to admin if not already
          if (existing.role !== 'admin') {
            existing.role = 'admin';
            await existing.save();
            console.log(`   ✅ Updated ${adminData.email} to admin role`);
          }
          skippedCount++;
          continue;
        }

        // Create new admin user
        const admin = new User({
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phone,
          password: adminData.password,
          role: 'admin',
          isActive: true
        });

        await admin.save();
        console.log(`✅ Created admin: ${adminData.name} (${adminData.email})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   - Removed: ${removedCount} old admin(s)`);
    console.log(`   - Created: ${createdCount} new admin(s)`);
    console.log(`   - Skipped: ${skippedCount} (already exists)`);

    // Show final admin list
    const finalAdmins = await User.find({ role: 'admin' });
    console.log(`\n✅ Total admin users: ${finalAdmins.length}`);
    finalAdmins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });

    console.log('\n🎉 Setup complete!');
    console.log('\n⚠️  IMPORTANT: Team members should change their passwords on first login!\n');
    console.log('📧 Next steps:');
    console.log('   1. Update your .env file with ADMIN_EMAILS (comma-separated)');
    console.log('   2. Inform team members of their credentials');
    console.log('   3. Each admin should login and change their password\n');

    rl.close();
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error during setup:', error);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the setup
setupTeamAdmins();
