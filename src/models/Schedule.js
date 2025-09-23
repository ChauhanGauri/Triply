const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    journeyDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    busNumber: { type: String, required: true },
    driverName: { type: String },
    capacity: { type: Number, default: 40 }, // Total seats in bus
    availableSeats: { type: Number, default: 40 }, // Available seats (reduced with bookings)
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
