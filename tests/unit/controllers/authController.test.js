
const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');
const mongoose = require('mongoose');

// Silence console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('AuthController', () => {
  describe('register', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn()
      };
    });

    it('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'user'
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          user: expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          })
        })
      );

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com'
        // Missing phone and password
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please provide all required fields'
      });
    });

    it('should return 400 if user already exists', async () => {
      // Create existing user
      const existingUser = new User({
        name: 'Existing User',
        email: 'existing@example.com',
        phone: '1234567890',
        password: 'password123'
      });
      await existingUser.save();

      req.body = {
        name: 'New User',
        email: 'existing@example.com', // Same email
        phone: '9876543210',
        password: 'password456'
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User with this email already exists'
      });
    });

    it('should create admin user when role is admin', async () => {
      req.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '1234567890',
        password: 'admin123',
        role: 'admin'
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            role: 'admin'
          })
        })
      );

      const user = await User.findOne({ email: 'admin@example.com' });
      expect(user.role).toBe('admin');
    });

    it('should default to user role if role is not admin', async () => {
      req.body = {
        name: 'Regular User',
        email: 'regular@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'invalid'
      };

      await authController.register(req, res);

      const user = await User.findOne({ email: 'regular@example.com' });
      expect(user.role).toBe('user');
    });
  });

  describe('adminLogin', () => {
    let req, res;
    let testAdmin;

    beforeEach(async () => {
      testAdmin = new User({
        name: 'Admin User',
        email: 'admin@test.com',
        phone: '1234567890',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      await testAdmin.save();

      req = {
        body: {},
        session: {}
      };
      res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should login admin successfully with valid credentials', async () => {
      req.body = {
        email: 'admin@test.com',
        password: 'admin123'
      };

      await authController.adminLogin(req, res);

      expect(req.session.user).toBeDefined();
      expect(req.session.user.email).toBe('admin@test.com');
      expect(req.session.user.role).toBe('admin');
      expect(res.redirect).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('should redirect with error if email is missing', async () => {
      req.body = {
        password: 'admin123'
      };

      await authController.adminLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/admin/login?error=Please provide email and password'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should redirect with error if password is missing', async () => {
      req.body = {
        email: 'admin@test.com'
      };

      await authController.adminLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/admin/login?error=Please provide email and password'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should redirect with error if admin not found', async () => {
      req.body = {
        email: 'nonexistent@test.com',
        password: 'admin123'
      };

      await authController.adminLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/admin/login?error=Invalid admin credentials'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should redirect with error if password is incorrect', async () => {
      req.body = {
        email: 'admin@test.com',
        password: 'wrongpassword'
      };

      await authController.adminLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/admin/login?error=Invalid admin credentials'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should not login inactive admin', async () => {
      testAdmin.isActive = false;
      await testAdmin.save();

      req.body = {
        email: 'admin@test.com',
        password: 'admin123'
      };

      await authController.adminLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/admin/login?error=Invalid admin credentials'
      );
      expect(req.session.user).toBeUndefined();
    });
  });

  describe('userLogin', () => {
    let req, res;
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        name: 'Test User',
        email: 'user@test.com',
        phone: '1234567890',
        password: 'user123',
        role: 'user',
        isActive: true
      });
      await testUser.save();

      req = {
        body: {},
        session: {}
      };
      res = {
        redirect: jest.fn()
      };
    });

    it('should login user successfully with valid credentials', async () => {
      req.body = {
        email: 'user@test.com',
        password: 'user123'
      };

      await authController.userLogin(req, res);

      expect(req.session.user).toBeDefined();
      expect(req.session.user.email).toBe('user@test.com');
      expect(req.session.user.role).toBe('user');
      expect(res.redirect).toHaveBeenCalledWith(
        `/user/${testUser._id}/dashboard`
      );
    });

    it('should redirect with error if email is missing', async () => {
      req.body = {
        password: 'user123'
      };

      await authController.userLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/user/login?error=Please provide email and password'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should redirect with error if password is missing', async () => {
      req.body = {
        email: 'user@test.com'
      };

      await authController.userLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/user/login?error=Please provide email and password'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should redirect with error if user not found', async () => {
      req.body = {
        email: 'nonexistent@test.com',
        password: 'user123'
      };

      await authController.userLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/user/login?error=Invalid user credentials'
      );
      expect(req.session.user).toBeUndefined();
    });

    it('should redirect with error if password is incorrect', async () => {
      req.body = {
        email: 'user@test.com',
        password: 'wrongpassword'
      };

      await authController.userLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/auth/user/login?error=Invalid user credentials'
      );
      expect(req.session.user).toBeUndefined();
    });
  });

  describe('logout', () => {
    let req, res;

    beforeEach(() => {
      req = {
        session: {
          user: { id: '123', role: 'user' },
          destroy: jest.fn((callback) => callback(null))
        }
      };
      res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should destroy session and redirect to home', () => {
      authController.logout(req, res);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('should handle session destroy error', () => {
      req.session.destroy = jest.fn((callback) => callback(new Error('Destroy error')));

      authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout failed'
      });
    });
  });

  describe('checkAuth', () => {
    let req, res;

    beforeEach(() => {
      req = {
        session: {}
      };
      res = {
        json: jest.fn()
      };
    });

    it('should return authenticated true if user is in session', () => {
      req.session.user = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      authController.checkAuth(req, res);

      expect(res.json).toHaveBeenCalledWith({
        isAuthenticated: true,
        user: req.session.user
      });
    });

    it('should return authenticated false if user is not in session', () => {
      req.session.user = null;

      authController.checkAuth(req, res);

      expect(res.json).toHaveBeenCalledWith({
        isAuthenticated: false,
        user: null
      });
    });
  });

  describe('createDefaultAdmin', () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
    });

    it('should create default admin if none exists', async () => {
      await authController.createDefaultAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Default admin created successfully',
          credentials: {
            email: 'admin@transport.com',
            password: 'admin123'
          }
        })
      );

      const admin = await User.findOne({ email: 'admin@transport.com' });
      expect(admin).toBeDefined();
      expect(admin.role).toBe('admin');
    });

    it('should return message if admin already exists', async () => {
      // Create admin first
      const admin = new User({
        name: 'Admin User',
        email: 'admin@transport.com',
        phone: '1234567890',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();

      await authController.createDefaultAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Admin already exists',
        admin: 'admin@transport.com'
      });
    });
  });

  describe('renderAdminLogin', () => {
    let req, res;

    beforeEach(() => {
      req = {
        session: {},
        query: {}
      };
      res = {
        render: jest.fn(),
        redirect: jest.fn()
      };
    });

    it('should render admin login page', () => {
      authController.renderAdminLogin(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/admin-login', {
        title: 'Admin Login',
        error: null
      });
    });

    it('should redirect to dashboard if admin is already logged in', () => {
      req.session.user = {
        id: '123',
        role: 'admin'
      };

      authController.renderAdminLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/admin/dashboard');
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should pass error query parameter to view', () => {
      req.query.error = 'Invalid credentials';

      authController.renderAdminLogin(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/admin-login', {
        title: 'Admin Login',
        error: 'Invalid credentials'
      });
    });
  });

  describe('renderUserLogin', () => {
    let req, res;

    beforeEach(() => {
      req = {
        session: {},
        query: {}
      };
      res = {
        render: jest.fn(),
        redirect: jest.fn()
      };
    });

    it('should render user login page', () => {
      authController.renderUserLogin(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/user-login', {
        title: 'User Login',
        error: null
      });
    });

    it('should redirect to dashboard if user is already logged in', () => {
      req.session.user = {
        id: '123',
        role: 'user'
      };

      authController.renderUserLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/user/123/dashboard');
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});

