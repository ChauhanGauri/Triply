const mongoose = require('mongoose');

const passengerManifestSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true,
        index: true
    },
    passengers: [{
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        passengerDetails: {
            name: { type: String, required: true },
            age: { type: Number, required: true },
            gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
            seatNumber: { type: String }, // Optional seat assignment
            boardingStatus: {
                type: String,
                enum: ['not-boarded', 'boarded', 'no-show'],
                default: 'not-boarded'
            }
        },
        contactPhone: { type: String },
        bookingReference: { type: String }
    }],
    totalPassengers: { type: Number, default: 0 },
    totalSeatsBooked: { type: Number, default: 0 },
    manifestStatus: {
        type: String,
        enum: ['draft', 'finalized', 'departed', 'completed'],
        default: 'draft'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    finalizedAt: { type: Date },
    departedAt: { type: Date }
}, { timestamps: true });

// Index for efficient queries
passengerManifestSchema.index({ schedule: 1, manifestStatus: 1 });

// Virtual for route information
passengerManifestSchema.virtual('route', {
    ref: 'Route',
    localField: 'schedule.route',
    foreignField: '_id',
    justOne: true
});

// Method to finalize manifest
passengerManifestSchema.methods.finalizeManifest = function () {
    this.manifestStatus = 'finalized';
    this.finalizedAt = new Date();
    return this.save();
};

// Method to mark as departed
passengerManifestSchema.methods.markDeparted = function () {
    this.manifestStatus = 'departed';
    this.departedAt = new Date();
    return this.save();
};

// Static method to generate manifest for a schedule
passengerManifestSchema.statics.generateForSchedule = async function (scheduleId) {
    const Booking = require('./Booking');

    // Get all confirmed bookings for this schedule
    const bookings = await Booking.find({
        schedule: scheduleId,
        status: 'confirmed'
    }).populate('user', 'name email phone');

    // Check if manifest already exists
    let manifest = await this.findOne({ schedule: scheduleId });

    // Create a lookup for existing passengers to preserve their IDs and statuses
    const existingPassengersMap = {};
    if (manifest && manifest.passengers) {
        manifest.passengers.forEach(p => {
            const bId = p.booking.toString();
            if (!existingPassengersMap[bId]) {
                existingPassengersMap[bId] = [];
            }
            existingPassengersMap[bId].push(p);
        });
    }

    const passengers = [];
    let totalPassengers = 0;
    let totalSeatsBooked = 0;

    bookings.forEach(booking => {
        totalSeatsBooked += booking.seats;

        const bIdStr = booking._id.toString();
        const existingForBooking = existingPassengersMap[bIdStr] || [];
        let pIndex = 0;

        if (booking.passengers && booking.passengers.length > 0) {
            // New booking format with detailed passenger info
            booking.passengers.forEach(passenger => {
                const existingP = existingForBooking[pIndex++];
                const pData = {
                    booking: booking._id,
                    user: booking.user._id,
                    passengerDetails: {
                        name: passenger.name,
                        age: passenger.age,
                        gender: passenger.gender,
                        boardingStatus: existingP ? existingP.passengerDetails.boardingStatus : 'not-boarded'
                    },
                    contactPhone: booking.contactPhone || booking.user.phone,
                    bookingReference: booking.bookingReference
                };
                if (existingP && existingP._id) pData._id = existingP._id;

                passengers.push(pData);
                totalPassengers++;
            });
        } else {
            // Legacy booking format
            for (let i = 0; i < booking.seats; i++) {
                const existingP = existingForBooking[pIndex++];
                const pData = {
                    booking: booking._id,
                    user: booking.user._id,
                    passengerDetails: {
                        name: booking.user.name,
                        age: 0, // Unknown for legacy bookings
                        gender: 'Other', // Unknown for legacy bookings
                        boardingStatus: existingP ? existingP.passengerDetails.boardingStatus : 'not-boarded'
                    },
                    contactPhone: booking.contactPhone || booking.user.phone,
                    bookingReference: booking.bookingReference
                };
                if (existingP && existingP._id) pData._id = existingP._id;

                passengers.push(pData);
                totalPassengers++;
            }
        }
    });

    if (manifest) {
        // Update existing manifest
        manifest.passengers = passengers;
        manifest.totalPassengers = totalPassengers;
        manifest.totalSeatsBooked = totalSeatsBooked;
        await manifest.save();
    } else {
        // Create new manifest
        manifest = new this({
            schedule: scheduleId,
            passengers,
            totalPassengers,
            totalSeatsBooked
        });
        await manifest.save();
    }

    return manifest;
};

module.exports = mongoose.model('PassengerManifest', passengerManifestSchema);