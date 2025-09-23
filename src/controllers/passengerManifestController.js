const PassengerManifest = require('../models/PassengerManifest');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const { syncPassengerManifests } = require('../../scripts/utilities/sync-passenger-manifests');

class PassengerManifestController {
    // Generate or get passenger manifest for a schedule
    async getManifestForSchedule(req, res) {
        try {
            const { scheduleId } = req.params;
            
            console.log(`Getting passenger manifest for schedule: ${scheduleId}`);
            
            // Verify schedule exists
            const schedule = await Schedule.findById(scheduleId)
                .populate('route', 'routeNumber origin destination');
            
            if (!schedule) {
                const errorMessage = 'Schedule not found';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: errorMessage });
                } else {
                    return res.redirect('/admin/schedules?error=' + encodeURIComponent(errorMessage));
                }
            }
            
            // Generate or get existing manifest
            const manifest = await PassengerManifest.generateForSchedule(scheduleId);
            
            // Populate the manifest with full details
            const populatedManifest = await PassengerManifest.findById(manifest._id)
                .populate('schedule')
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination fare'
                    }
                })
                .populate('passengers.user', 'name email')
                .populate('passengers.booking', 'bookingReference totalPrice seats');
            
            console.log(`Manifest generated with ${manifest.totalPassengers} passengers`);
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: 'Passenger manifest retrieved successfully',
                    data: populatedManifest
                });
            } else {
                res.render('admin/passenger-manifest', {
                    title: 'Passenger Manifest',
                    manifest: populatedManifest,
                    schedule,
                    user: req.session.user,
                    success: req.query.success || null,
                    error: req.query.error || null
                });
            }
        } catch (error) {
            console.error('Error getting passenger manifest:', error);
            
            const errorMessage = 'Error loading passenger manifest';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.status(500).render('error', {
                    title: 'Error',
                    message: errorMessage,
                    error: error
                });
            }
        }
    }
    
    // Get all passenger manifests (admin view)
    async getAllManifests(req, res) {
        try {
            const manifests = await PassengerManifest.find()
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination'
                    }
                })
                .sort({ createdAt: -1 });
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: 'Passenger manifests retrieved successfully',
                    data: manifests
                });
            } else {
                res.render('admin/manifests', {
                    title: 'Passenger Manifests',
                    manifests,
                    user: req.session.user,
                    success: req.query.success || null,
                    error: req.query.error || null
                });
            }
        } catch (error) {
            console.error('Error getting passenger manifests:', error);
            
            const errorMessage = 'Error loading passenger manifests';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.status(500).render('error', {
                    title: 'Error',
                    message: errorMessage,
                    error: error
                });
            }
        }
    }
    
    // Update passenger boarding status
    async updatePassengerStatus(req, res) {
        try {
            const { manifestId, passengerId } = req.params;
            const { boardingStatus, checkedIn } = req.body;
            
            const manifest = await PassengerManifest.findById(manifestId);
            
            if (!manifest) {
                return res.status(404).json({ message: 'Manifest not found' });
            }
            
            const passenger = manifest.passengers.id(passengerId);
            
            if (!passenger) {
                return res.status(404).json({ message: 'Passenger not found in manifest' });
            }
            
            // Update passenger status
            if (boardingStatus) {
                passenger.passengerDetails.boardingStatus = boardingStatus;
            }
            
            if (checkedIn !== undefined) {
                passenger.checkedIn = checkedIn;
                if (checkedIn) {
                    passenger.checkedInAt = new Date();
                } else {
                    passenger.checkedInAt = null;
                }
            }
            
            await manifest.save();
            
            console.log(`Updated passenger ${passenger.passengerDetails.name} status to ${boardingStatus}`);
            
            res.status(200).json({
                message: 'Passenger status updated successfully',
                data: passenger
            });
        } catch (error) {
            console.error('Error updating passenger status:', error);
            res.status(500).json({
                message: 'Error updating passenger status',
                error: error.message
            });
        }
    }
    
    // Finalize manifest (no more changes allowed)
    async finalizeManifest(req, res) {
        try {
            const { manifestId } = req.params;
            
            const manifest = await PassengerManifest.findById(manifestId);
            
            if (!manifest) {
                const errorMessage = 'Manifest not found';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: errorMessage });
                } else {
                    return res.redirect('/admin/manifests?error=' + encodeURIComponent(errorMessage));
                }
            }
            
            await manifest.finalizeManifest();
            
            console.log(`Manifest ${manifestId} finalized`);
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: 'Manifest finalized successfully',
                    data: manifest
                });
            } else {
                res.redirect(`/admin/manifests/${manifestId}?success=Manifest finalized successfully`);
            }
        } catch (error) {
            console.error('Error finalizing manifest:', error);
            
            const errorMessage = 'Error finalizing manifest';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect('/admin/manifests?error=' + encodeURIComponent(errorMessage));
            }
        }
    }
    
    // Mark bus as departed
    async markDeparted(req, res) {
        try {
            const { manifestId } = req.params;
            
            const manifest = await PassengerManifest.findById(manifestId);
            
            if (!manifest) {
                return res.status(404).json({ message: 'Manifest not found' });
            }
            
            await manifest.markDeparted();
            
            console.log(`Manifest ${manifestId} marked as departed`);
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: 'Bus marked as departed successfully',
                    data: manifest
                });
            } else {
                res.redirect(`/admin/manifests/${manifestId}?success=Bus marked as departed`);
            }
        } catch (error) {
            console.error('Error marking bus as departed:', error);
            
            const errorMessage = 'Error marking bus as departed';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect('/admin/manifests?error=' + encodeURIComponent(errorMessage));
            }
        }
    }
    
    // Get manifest by ID for detailed view
    async getManifestById(req, res) {
        try {
            const { manifestId } = req.params;
            
            const manifest = await PassengerManifest.findById(manifestId)
                .populate({
                    path: 'schedule',
                    populate: {
                        path: 'route',
                        select: 'routeNumber origin destination fare'
                    }
                })
                .populate('passengers.user', 'name email')
                .populate('passengers.booking', 'bookingReference totalPrice seats');
            
            if (!manifest) {
                const errorMessage = 'Manifest not found';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({ message: errorMessage });
                } else {
                    return res.status(404).render('error', {
                        title: 'Manifest Not Found',
                        message: errorMessage,
                        error: { status: 404, stack: '' }
                    });
                }
            }
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message: 'Manifest retrieved successfully',
                    data: manifest
                });
            } else {
                res.render('admin/passenger-manifest', {
                    title: 'Passenger Manifest Details',
                    manifest,
                    schedule: manifest.schedule,
                    user: req.session.user,
                    success: req.query.success || null,
                    error: req.query.error || null
                });
            }
        } catch (error) {
            console.error('Error getting manifest:', error);
            
            const errorMessage = 'Error loading manifest';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.status(500).render('error', {
                    title: 'Error',
                    message: errorMessage,
                    error: error
                });
            }
        }
    }
    
    // Manual sync all passenger manifests
    async syncAllManifests(req, res) {
        try {
            console.log('Manual sync triggered by admin');
            
            // Get all confirmed bookings to count
            const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
            
            if (totalBookings === 0) {
                const message = 'No confirmed bookings found to sync';
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(200).json({ message, data: { synced: 0 } });
                } else {
                    return res.redirect('/admin/manifests?success=' + encodeURIComponent(message));
                }
            }
            
            // Run the sync (this is async but we don't wait for it to complete)
            syncPassengerManifests()
                .then(() => {
                    console.log('Background sync completed successfully');
                })
                .catch((error) => {
                    console.error('Background sync failed:', error);
                });
            
            const message = `Sync started for ${totalBookings} confirmed bookings. This may take a few moments.`;
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(200).json({
                    message,
                    data: { totalBookings }
                });
            } else {
                res.redirect('/admin/manifests?success=' + encodeURIComponent(message));
            }
            
        } catch (error) {
            console.error('Error starting sync:', error);
            
            const errorMessage = 'Error starting passenger manifest sync';
            
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({
                    message: errorMessage,
                    error: error.message
                });
            } else {
                res.redirect('/admin/manifests?error=' + encodeURIComponent(errorMessage));
            }
        }
    }
}

module.exports = new PassengerManifestController();