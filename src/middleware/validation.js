exports.validateRoute = (req, res, next) => {
    const { name, startLocation, endLocation } = req.body;
    if (!name || !startLocation || !endLocation) {
        return res.status(400).json({ error: "All fields are required for a route." });
    }
    next();
};

exports.validateSchedule = (req, res, next) => {
    const { routeId, departureTime, arrivalTime } = req.body;
    if (!routeId || !departureTime || !arrivalTime) {
        return res.status(400).json({ error: "All fields are required for a schedule." });
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