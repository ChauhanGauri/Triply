const User = require('../models/User');

class UserController {
    async createUser(req, res) {
        try {
            const newUser = new User(req.body);
            await newUser.save();
            res.status(201).json({ message: "User created successfully", data: newUser });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Error creating user", error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find();
            res.status(200).json({ message: "Users retrieved successfully", data: users });
        } catch (error) {
            res.status(500).json({ message: "Error retrieving users", error: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json({ message: "User retrieved successfully", data: user });
        } catch (error) {
            res.status(500).json({ message: "Error retrieving user", error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedUser) return res.status(404).json({ message: "User not found" });
            res.status(200).json({ message: "User updated successfully", data: updatedUser });
        } catch (error) {
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) return res.status(404).json({ message: "User not found" });
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting user", error: error.message });
        }
    }
}

module.exports = new UserController();
