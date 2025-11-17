const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    seats: { type: Number, required: true },
    seatNumbers: { type: [Number], default: [] }, // Array of selected seat numbers
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    bookingReference: { type: String, unique: true }, // Generated booking ID
    passengers: [passengerSchema], // Array of passenger details
    contactPhone: { type: String }, // Contact number
    totalPrice: { type: Number }, // Total booking price
    paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'] },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    
    // Legacy field for backward compatibility
    passengerDetails: { type: String } // Names of passengers (legacy)
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
