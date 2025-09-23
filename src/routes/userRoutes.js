const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Create a new user
router.post('/', userController.createUser.bind(userController));

// Get all users
router.get('/', userController.getAllUsers.bind(userController));

// Get a user by ID
router.get('/:id', userController.getUserById.bind(userController));

// Update a user by ID
router.put('/:id', userController.updateUser.bind(userController));

// Delete a user by ID
router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;
