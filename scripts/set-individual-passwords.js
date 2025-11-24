// Script to set individual passwords for each admin
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/triply';

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

async function setIndividualPasswords() {
  try {
    console.log('\n🔐 Set Individual Passwords for Each Admin\n' + '='.repeat(60));

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all admin users
    const admins = await User.find({ role: 'admin' }).sort({ email: 1 });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
      rl.close();
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${admins.length} admin user(s)\n`);

    const passwords = {};

    // Ask for password for each admin
    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      console.log(`\n${i + 1}. ${admin.name} (${admin.email})`);
      
      const password = await askQuestion(`   Enter password for ${admin.name}: `);
      
      if (!password || password.length < 6) {
        console.log('   ❌ Password must be at least 6 characters! Skipping...');
        continue;
      }
      
      passwords[admin.email] = password;
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Summary of passwords to be set:\n');
    
    Object.entries(passwords).forEach(([email, password]) => {
      const admin = admins.find(a => a.email === email);
      console.log(`   ${admin.name}: ${email} → ${password}`);
    });

    const confirm = await askQuestion(`\n⚠️  Proceed with these passwords? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Operation cancelled');
      rl.close();
      await mongoose.disconnect();
      return;
    }

    console.log('\n🔄 Updating passwords...\n');

    for (const admin of admins) {
      if (passwords[admin.email]) {
        admin.password = passwords[admin.email];
        await admin.save();
        console.log(`✅ Password updated for: ${admin.name} (${admin.email})`);
      }
    }

    console.log(`\n🎉 SUCCESS! Individual passwords have been set!\n`);
    console.log('📋 Login Credentials:\n');
    
    for (const admin of admins) {
      if (passwords[admin.email]) {
        console.log(`   ${admin.name}:`);
        console.log(`      Email: ${admin.email}`);
        console.log(`      Password: ${passwords[admin.email]}`);
        console.log('');
      }
    }

    console.log('🔗 Login at: http://localhost:3000/auth/admin/login\n');

    rl.close();
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

setIndividualPasswords();
