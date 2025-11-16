const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    // human-friendly unique schedule identifier
    scheduleId: { type: String, unique: true, index: true },
    journeyDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    busNumber: { type: String, required: true },
    driverName: { type: String },
    capacity: { type: Number, default: 40 }, // Total seats in bus
    availableSeats: { type: Number, default: 40 }, // Available seats (reduced with bookings)
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Generate a unique scheduleId before saving if not provided
function generateScheduleId() {
    const prefix = 'SCH';
    const timePart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timePart}${randomPart}`;
}

scheduleSchema.pre('save', async function (next) {
    try {
        if (!this.scheduleId) {
            // Keep trying until a unique scheduleId is assigned (protect against rare collision)
            let candidate = generateScheduleId();
            // Check uniqueness
            const Schedule = this.constructor;
            let exists = await Schedule.findOne({ scheduleId: candidate }).lean();
            let attempts = 0;
            while (exists && attempts < 5) {
                candidate = generateScheduleId();
                exists = await Schedule.findOne({ scheduleId: candidate }).lean();
                attempts += 1;
            }
            this.scheduleId = candidate;
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
