const Schedule = require('../models/Schedule');

class ScheduleController {
    async createSchedule(req, res) {
        try {
            console.log('Creating new schedule with data:', req.body);
            const newSchedule = new Schedule(req.body);
            await newSchedule.save();
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(201).json({ 
                    message: "Schedule created successfully", 
                    data: newSchedule 
                });
            } else {
                res.redirect('/admin/schedules?success=Schedule created successfully');
            }
        } catch (error) {
            console.error("Error creating schedule:", error);
            let errorMessage = "Error creating schedule";
            
            if (error.code === 11000) {
                errorMessage = "A schedule with this information already exists.";
            } else if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(e => e.message);
                errorMessage = "Validation error: " + validationErrors.join(', ');
            } else if (error.name === 'CastError') {
                errorMessage = "Invalid route selected or data format error";
            }
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({ 
                    message: errorMessage, 
                    error: error.message 
                });
            } else {
                res.redirect(`/admin/schedules?error=${encodeURIComponent(errorMessage)}`);
            }
        }
    }

    async getAllSchedules(req, res) {
        try {
            const schedules = await Schedule.find().populate('route');
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({ 
                    message: "Schedules retrieved successfully", 
                    data: schedules 
                });
            } else {
                res.render('admin/schedules', { 
                    title: 'Manage Schedules',
                    schedules: schedules,
                    user: req.session.user,
                    success: req.query.success || null,
                    error: req.query.error || null
                });
            }
        } catch (error) {
            console.error("Error retrieving schedules:", error);
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({ 
                    message: "Error retrieving schedules", 
                    error: error.message 
                });
            } else {
                res.redirect('/admin/schedules?error=Error retrieving schedules');
            }
        }
    }

    async getScheduleById(req, res) {
        try {
            const { id } = req.params;
            const schedule = await Schedule.findById(id).populate('route');
            if (!schedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }
            res.status(200).json({ 
                message: "Schedule retrieved successfully", 
                data: schedule 
            });
        } catch (error) {
            console.error("Error retrieving schedule:", error);
            res.status(500).json({ 
                message: "Error retrieving schedule", 
                error: error.message 
            });
        }
    }

    async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            console.log('Updating schedule with ID:', id);
            
            const updatedSchedule = await Schedule.findByIdAndUpdate(id, req.body, { 
                new: true,
                runValidators: true
            }).populate('route');
            
            if (!updatedSchedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }
            
            res.status(200).json({ 
                message: "Schedule updated successfully", 
                data: updatedSchedule 
            });
        } catch (error) {
            console.error("Error updating schedule:", error);
            res.status(500).json({ 
                message: "Error updating schedule", 
                error: error.message 
            });
        }
    }

    async deleteSchedule(req, res) {
        try {
            const { id } = req.params;
            const deletedSchedule = await Schedule.findByIdAndDelete(id);
            if (!deletedSchedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }
            
            res.status(200).json({ message: "Schedule deleted successfully" });
        } catch (error) {
            console.error("Error deleting schedule:", error);
            res.status(500).json({ 
                message: "Error deleting schedule", 
                error: error.message 
            });
        }
    }
}

module.exports = new ScheduleController();
