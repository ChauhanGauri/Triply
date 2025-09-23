const mongoose = require('mongoose');
const Schedule = require('../../src/models/Schedule');

async function cleanupOrphanedSchedules() {
  try {
    await mongoose.connect('mongodb://localhost:27017/transport-management');
    console.log('✅ Connected to MongoDB');
    
    const schedules = await Schedule.find().populate('route');
    const orphanedSchedules = schedules.filter(schedule => !schedule.route);
    
    console.log(`Found ${orphanedSchedules.length} orphaned schedules`);
    
    if (orphanedSchedules.length > 0) {
      const orphanedIds = orphanedSchedules.map(s => s._id);
      const result = await Schedule.deleteMany({ _id: { $in: orphanedIds } });
      console.log(`✅ Deleted ${result.deletedCount} orphaned schedules`);
    } else {
      console.log('✅ No orphaned schedules found');
    }
    
    await mongoose.disconnect();
    console.log('✅ Cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupOrphanedSchedules();
