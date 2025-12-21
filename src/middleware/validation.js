exports.validateRoute = (req, res, next) => {
    const { name, startLocation, endLocation } = req.body;
    if (!name || !startLocation || !endLocation) {
        return res.status(400).json({ error: "All fields are required for a route." });
    }
    next();
};

const Route = require('../models/Route');
exports.validateSchedule = async (req, res, next) => {
    const { route, departureTime, arrivalTime } = req.body;
    if (!route || !departureTime) {
        return res.status(400).json({ error: "Route and departure time are required for a schedule." });
    }
    // If arrivalTime is missing, check if route has duration
    if (!arrivalTime) {
        try {
            const foundRoute = await Route.findById(route);
            if (!foundRoute || !foundRoute.duration) {
                return res.status(400).json({ error: "Arrival time is required if route has no duration." });
            }
        } catch (e) {
            return res.status(400).json({ error: "Invalid route selected." });
        }
    }
    next();
};

exports.validateUser = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required for a user." });
    }
    next();
};

exports.validateBooking = (req, res, next) => {
    const { userId, scheduleId, seats } = req.body;
    if (!userId || !scheduleId || !seats) {
        return res.status(400).json({ error: "All fields are required for a booking." });
    }
    next();
};