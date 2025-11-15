const User = require('../../../src/models/User');
const mongoose = require('mongoose');

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'user'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe('user');
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should require name field', async () => {
      const user = new User({
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require email field', async () => {
      const user = new User({
        name: 'Test User',
        phone: '1234567890',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require phone field', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require password field', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      };

      await new User(userData).save();

      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should default role to "user"', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      expect(savedUser.role).toBe('user');
    });

    it('should default isActive to true', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      expect(savedUser.isActive).toBe(true);
    });

    it('should only allow "user" or "admin" as role', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'invalid'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should create admin user with role "admin"', async () => {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '1234567890',
        password: 'admin123',
        role: 'admin'
      });

      const savedAdmin = await admin.save();
      expect(savedAdmin.role).toBe('admin');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      expect(savedUser.password).not.toBe('password123');
      expect(savedUser.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should hash password on update', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      const originalHash = savedUser.password;

      savedUser.password = 'newpassword123';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).not.toBe(originalHash);
      expect(updatedUser.password).not.toBe('newpassword123');
    });

    it('should not re-hash password if not modified', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      const originalHash = savedUser.password;

      savedUser.name = 'Updated Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).toBe(originalHash);
    });
  });

  describe('comparePassword method', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      const isMatch = await savedUser.comparePassword('password123');

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      const isMatch = await savedUser.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('toJSON method', () => {
    it('should remove password from JSON output', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123'
      });

      const savedUser = await user.save();
      const userJSON = savedUser.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.name).toBe('Test User');
      expect(userJSON.email).toBe('test@example.com');
    });
  });
});

