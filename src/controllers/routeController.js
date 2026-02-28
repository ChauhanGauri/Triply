const Route = require('../models/Route');
const cache = require('../utils/cache');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Ensure GEMINI_API_KEY is in your .env

class RouteController {
    async calculateDistance(req, res) {
        try {
            const { origin, destination } = req.body;
            if (!origin || !destination) {
                return res.status(400).json({ error: "Origin and destination are required" });
            }

            const prompt = `Calculate the driving distance and driving time between ${origin} and ${destination} in India.
Respond ONLY with a valid JSON document containing exactly these two numeric fields:
- "distance": number representing the driving distance in kilometers.
- "duration": number representing the driving time in minutes.
Do not include any other text, markdown formatting, or explanation.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            const text = response.text.trim().replace(/^```(json)?|```$/gi, '').trim();
            const data = JSON.parse(text);

            if (data.distance == null || data.duration == null) {
                throw new Error("Invalid response format from Gemini");
            }

            return res.json({ distance: Number(data.distance), duration: Number(data.duration) });
        } catch (error) {
            console.error("Gemini Calculate Distance Error:", error);
            // Fallback response for stability
            return res.status(500).json({ error: "Failed to calculate distance using AI" });
        }
    }
    async createRoute(req, res) {
        try {

            // Handle checkbox boolean conversion for new routes
            if (req.body.isActive === 'on') {
                req.body.isActive = true;
            } else if (!req.body.isActive) {
                req.body.isActive = true; // Default to active for new routes
            }

            const newRoute = new Route(req.body);
            await newRoute.save();

            // Invalidate cache when route is created
            await cache.deletePattern('routes:*');
            await cache.deletePattern('dashboard:*');


            // Check if this is an API request or web request
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(201).json({
                    message: "Route created successfully",
                    data: newRoute
                });
            } else {
                // Redirect for web interface with success message
                res.redirect('/admin/routes?success=Route created successfully');
            }
        } catch (error) {
            console.error("Error creating route:", error);
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                code: error.code,
                keyPattern: error.keyPattern,
                errors: error.errors
            });

            let errorMessage = "Error creating route";

            // Handle specific MongoDB errors
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.routeNumber) {
                    errorMessage = "Route number already exists. Please use a different route number.";
                } else {
                    errorMessage = "A route with this information already exists.";
                }
            } else if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(e => e.message);
                errorMessage = "Validation error: " + validationErrors.join(', ');
            }

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect(`/admin/routes?error=${encodeURIComponent(errorMessage)}`);
            }
        }
    }

    async getAllRoutes(req, res) {
        try {
            const cacheKey = 'routes:all';

            const routes = await cache.getOrSet(
                cacheKey,
                async () => {
                    return await Route.find();
                },
                600 // Cache for 10 minutes
            );

            res.status(200).json({
                message: "Routes retrieved successfully",
                data: routes
            });
        } catch (error) {
            res.status(500).json({
                message: "Error retrieving routes",
                error: error.message
            });
        }
    }

    async getRouteById(req, res) {
        try {
            const { id } = req.params;
            const cacheKey = `route:${id}`;

            const route = await cache.getOrSet(
                cacheKey,
                async () => {
                    return await Route.findById(id);
                },
                600 // Cache for 10 minutes
            );

            if (!route) {
                return res.status(404).json({ message: "Route not found" });
            }

            res.status(200).json({
                message: "Route retrieved successfully",
                data: route
            });
        } catch (error) {
            res.status(500).json({
                message: "Error retrieving route",
                error: error.message
            });
        }
    }

    async updateRoute(req, res) {
        try {
            const { id } = req.params;

            // Handle checkbox boolean conversion
            if (req.body.isActive === 'on') {
                req.body.isActive = true;
            } else if (!req.body.isActive) {
                req.body.isActive = false;
            }

            const updatedRoute = await Route.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            });
            if (!updatedRoute) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: "Route not found" });
                } else {
                    return res.redirect('/admin/routes?error=Route not found');
                }
            }

            // Invalidate cache when route is updated
            await cache.deletePattern('routes:*');
            await cache.delete(`route:${id}`);
            await cache.deletePattern('dashboard:*');

            // Check if this is an API request or web request
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: "Route updated successfully",
                    data: updatedRoute
                });
            } else {
                // Redirect for web interface with success message
                res.redirect('/admin/routes?success=Route updated successfully');
            }
        } catch (error) {
            console.error("Error updating route:", error);
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                code: error.code,
                keyPattern: error.keyPattern
            });

            let errorMessage = "Error updating route";

            // Handle specific MongoDB errors
            if (error.code === 11000) {
                errorMessage = "Route number already exists. Please use a different route number.";
            } else if (error.name === 'ValidationError') {
                errorMessage = "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ');
            } else if (error.name === 'CastError') {
                errorMessage = "Invalid route ID format";
            }

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect(`/admin/routes?error=${encodeURIComponent(errorMessage)}`);
            }
        }
    }

    async deleteRoute(req, res) {
        try {
            const { id } = req.params;
            const deletedRoute = await Route.findByIdAndDelete(id);
            if (!deletedRoute) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: "Route not found" });
                } else {
                    return res.redirect('/admin/routes?error=Route not found');
                }
            }

            // Invalidate cache when route is deleted
            await cache.deletePattern('routes:*');
            await cache.delete(`route:${id}`);
            await cache.deletePattern('dashboard:*');

            // Check if this is an API request or web request
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({ message: "Route deleted successfully" });
            } else {
                // Redirect for web interface
                res.redirect('/admin/routes');
            }
        } catch (error) {
            console.error("Error deleting route:", error);
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: "Error deleting route",
                    error: error.message
                });
            } else {
                res.redirect('/admin/routes?error=Error deleting route');
            }
        }
    }
}

module.exports = new RouteController();
