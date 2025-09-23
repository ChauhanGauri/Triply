const mongoose = require('mongoose');
const Route = require('../../src/models/Route');

async function updateExistingRoutes() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/public_transportation');
        console.log('✅ Connected to MongoDB');

        // Find all routes without distance, duration, or fare
        const routes = await Route.find({
            $or: [
                { distance: { $exists: false } },
                { duration: { $exists: false } },
                { fare: { $exists: false } }
            ]
        });

        console.log(`Found ${routes.length} routes to update`);

        // Update each route with sample data
        for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            const updateData = {};

            // Add missing fields with sample data
            if (!route.distance) updateData.distance = Math.floor(Math.random() * 50) + 10; // 10-60 km
            if (!route.duration) updateData.duration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
            if (!route.fare) updateData.fare = Math.floor(Math.random() * 100) + 50; // ₹50-150
            if (route.isActive === undefined) updateData.isActive = true;

            await Route.findByIdAndUpdate(route._id, updateData);
            console.log(`✅ Updated route ${route.routeNumber}: distance=${updateData.distance}km, duration=${updateData.duration}min, fare=₹${updateData.fare}`);
        }

        console.log('✅ All routes updated successfully');
        
        // Show updated routes
        const updatedRoutes = await Route.find();
        console.log('\nUpdated routes:');
        updatedRoutes.forEach(route => {
            console.log(`${route.routeNumber}: ${route.origin} → ${route.destination} | ${route.distance}km | ${route.duration}min | ₹${route.fare}`);
        });

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

updateExistingRoutes();
