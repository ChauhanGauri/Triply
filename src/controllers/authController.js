const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');
const crypto = require('crypto');

class AuthController {
    // Render admin login page
    renderAdminLogin(req, res) {
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }
        res.render('auth/admin-login', { 
            title: 'Admin Login',
            error: req.query.error || null
        });
    }

    // Render user login page
    renderUserLogin(req, res) {
        if (req.session.user && req.session.user.role === 'user') {
            return res.redirect(`/user/${req.session.user.id}/dashboard`);
        }
        res.render('auth/user-login', { 
            title: 'User Login',
            error: req.query.error || null
        });
    }

    // Admin login process
    async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.redirect('/auth/admin/login?error=Please provide email and password');
            }

            // Find admin user
            const admin = await User.findOne({ email, role: 'admin', isActive: true });
            if (!admin) {
                return res.redirect('/auth/admin/login?error=Invalid admin credentials');
            }

            // Check password
            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                return res.redirect('/auth/admin/login?error=Invalid admin credentials');
            }

            // Create session
            req.session.user = {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            };
            

            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Admin login error:', error);
            res.redirect('/auth/admin/login?error=Login failed. Please try again.');
        }
    }

    // User login process
    async userLogin(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.redirect('/auth/user/login?error=Please provide email and password');
            }

            // Find user
            const user = await User.findOne({ email, role: 'user', isActive: true });
            if (!user) {
                return res.redirect('/auth/user/login?error=Invalid user credentials');
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.redirect('/auth/user/login?error=Invalid user credentials');
            }

            // Create session
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            res.redirect(`/user/${user._id}/dashboard`);
        } catch (error) {
            console.error('User login error:', error);
            res.redirect('/auth/user/login?error=Login failed. Please try again.');
        }
    }

    // Register new user (for testing purposes)
    async register(req, res) {
        try {
            const { name, email, phone, password, role = 'user' } = req.body;

            if (!name || !email || !phone || !password) {
                return res.status(400).json({ 
                    message: 'Please provide all required fields' 
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'User with this email already exists' 
                });
            }

            // Create new user
            const user = new User({
                name,
                email,
                phone,
                password,
                role: role === 'admin' ? 'admin' : 'user'
            });

            await user.save();

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                message: 'Registration failed. Please try again.',
                error: error.message 
            });
        }
    }

    // Logout
    logout(req, res) {
        const userRole = req.session.user?.role;
        
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            
            // Redirect to home page after logout
            res.redirect('/');
        });
    }

    // Check authentication status (API endpoint)
    checkAuth(req, res) {
        if (req.session.user) {
            res.json({
                isAuthenticated: true,
                user: req.session.user
            });
        } else {
            res.json({
                isAuthenticated: false,
                user: null
            });
        }
    }

    // Create default admin (for testing)
    async createDefaultAdmin(req, res) {
        try {
            // Check if admin already exists
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.json({ 
                    message: 'Admin already exists',
                    admin: existingAdmin.email
                });
            }

            // Create default admin
            const admin = new User({
                name: 'Admin User',
                email: 'admin@transport.com',
                phone: '1234567890',
                password: 'admin123',
                role: 'admin'
            });

            await admin.save();

            res.json({
                message: 'Default admin created successfully',
                credentials: {
                    email: 'admin@transport.com',
                    password: 'admin123'
                }
            });
        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({ 
                message: 'Failed to create admin',
                error: error.message 
            });
        }
    }

    // Request password reset
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: 'Email is required' });
                }
                return res.redirect('/auth/forgot-password?error=Email is required');
            }

            // Find user by email
            const user = await User.findOne({ email, isActive: true });
            
            // Don't reveal if user exists or not for security
            const successMessage = 'If that email exists, we sent a password reset link';
            
            if (user) {
                // Generate reset token
                const resetToken = user.createPasswordResetToken();
                await user.save({ validateBeforeSave: false });

                // Send reset email
                try {
                    await emailService.sendPasswordResetEmail(user, resetToken);
                } catch (emailError) {
                    console.error('❌ Error sending password reset email:', emailError);
                    // Clear the reset token if email fails
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    await user.save({ validateBeforeSave: false });
                    
                    if (req.headers.accept && req.headers.accept.includes('application/json')) {
                        return res.status(500).json({ 
                            message: 'Error sending email. Please try again later.' 
                        });
                    }
                    return res.redirect('/auth/forgot-password?error=Error sending email. Please try again later.');
                }
            }

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.json({ message: successMessage });
            } else {
                res.redirect(`/auth/forgot-password?success=${encodeURIComponent(successMessage)}`);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({ message: 'An error occurred. Please try again.' });
            } else {
                res.redirect('/auth/forgot-password?error=An error occurred. Please try again.');
            }
        }
    }

    // Reset password with token
    async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { password, confirmPassword } = req.body;

            if (!password || !confirmPassword) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: 'Password and confirmation are required' });
                }
                return res.redirect(`/auth/reset-password/${token}?error=Password and confirmation are required`);
            }

            if (password !== confirmPassword) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: 'Passwords do not match' });
                }
                return res.redirect(`/auth/reset-password/${token}?error=Passwords do not match`);
            }

            if (password.length < 6) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: 'Password must be at least 6 characters' });
                }
                return res.redirect(`/auth/reset-password/${token}?error=Password must be at least 6 characters`);
            }

            // Hash the token to compare with database
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Find user with valid token
            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(400).json({ message: 'Invalid or expired reset token' });
                }
                return res.redirect('/auth/forgot-password?error=Invalid or expired reset token');
            }

            // Update password
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();


            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.json({ message: 'Password reset successful. You can now login.' });
            } else {
                const loginUrl = user.role === 'admin' ? '/auth/admin/login' : '/auth/user/login';
                res.redirect(`${loginUrl}?success=Password reset successful. You can now login.`);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.status(500).json({ message: 'An error occurred. Please try again.' });
            } else {
                res.redirect('/auth/forgot-password?error=An error occurred. Please try again.');
            }
        }
    }

    // Render forgot password page
    renderForgotPassword(req, res) {
        res.render('auth/forgot-password', {
            title: 'Forgot Password',
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    // Render reset password page
    renderResetPassword(req, res) {
        res.render('auth/reset-password', {
            title: 'Reset Password',
            token: req.params.token,
            error: req.query.error || null
        });
    }
}

module.exports = new AuthController();