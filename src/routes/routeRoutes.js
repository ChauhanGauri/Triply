// routes/routeRoutes.js
const express = require("express");
const routeController = require("../controllers/routeController");

const router = express.Router();

// CRUD Endpoints
router.post("/calculate-distance", routeController.calculateDistance);
router.post("/", routeController.createRoute);      // Create
router.get("/", routeController.getAllRoutes);      // Read all
router.get("/:id", routeController.getRouteById);   // Read one
router.put("/:id", routeController.updateRoute);    // Update
router.delete("/:id", routeController.deleteRoute); // Delete

module.exports = router;
