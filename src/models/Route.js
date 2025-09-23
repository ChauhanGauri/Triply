const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true }, // must be provided
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true }, // in kilometers
  duration: { type: Number, required: true }, // in minutes
  fare: { type: Number, required: true }, // price in currency
  stops: [String],
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Route", routeSchema);
