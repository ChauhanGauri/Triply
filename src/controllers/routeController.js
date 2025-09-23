const Route = require('../models/Route');

class RouteController {
    async createRoute(req, res) {
        try {
            console.log('Creating new route with data:', req.body);
            
            // Handle checkbox boolean conversion for new routes
            if (req.body.isActive === 'on') {
                req.body.isActive = true;
            } else if (!req.body.isActive) {
                req.body.isActive = true; // Default to active for new routes
            }
            
            const newRoute = new Route(req.body);
            await newRoute.save();
            
            console.log('Route created successfully:', newRoute.routeNumber);
            
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
            const routes = await Route.find();
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
            const route = await Route.findById(id);
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
            console.log('Updating route with ID:', id);
            console.log('Request body:', req.body);
            
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
