// Authentication middleware to protect routes

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('🔐 Authentication check:', {
        path: req.path,
        session: req.session,
        user: req.session?.user,
        sessionID: req.sessionID
    });
    
    // Note: In development, VS Code Simple Browser may create new sessions when clicking links
    // For production testing, use a regular browser to maintain proper session persistence
    
    if (req.session && req.session.user) {
        console.log('✅ User authenticated:', req.session.user.name);
        return next();
    }
    
    console.log('❌ User not authenticated, redirecting...');
    
    // Redirect based on the route being accessed
    if (req.path.startsWith('/admin')) {
        return res.redirect('/auth/admin/login');
    } else if (req.path.startsWith('/user')) {
        return res.redirect('/auth/user/login');
    } else {
        return res.redirect('/auth/user/login'); // Default to user login
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    
    return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
        error: {
            status: 403,
            stack: ''
        }
    });
};

// Check if user is regular user or accessing own data
const isUser = (req, res, next) => {
    if (req.session && req.session.user) {
        // If it's an admin, allow access
        if (req.session.user.role === 'admin') {
            return next();
        }
        
        // If it's a user, check if they're accessing their own data
        if (req.session.user.role === 'user') {
            const userId = req.params.userId || req.params.id;
            if (userId && userId !== req.session.user.id) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only access your own data.',
                    error: {
                        status: 403,
                        stack: ''
                    }
                });
            }
            return next();
        }
    }
    
    return res.redirect('/user/login');
};

// Add user info to all views
const addUserToViews = (req, res, next) => {
    res.locals.currentUser = req.session?.user || null;
    res.locals.isAdmin = req.session?.user?.role === 'admin' || false;
    res.locals.isLoggedIn = !!req.session?.user;
    next();
};

// Redirect if already logged in
const redirectIfLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect(`/user/${req.session.user.id}/dashboard`);
        }
    }
    next();
};

// API Authentication for JSON responses
const apiAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    
    return res.status(401).json({
        message: 'Authentication required',
        error: 'Please log in to access this resource'
    });
};

// API Admin check for JSON responses
const apiAdminAuth = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    
    return res.status(403).json({
        message: 'Admin access required',
        error: 'You do not have permission to access this resource'
    });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isUser,
    addUserToViews,
    redirectIfLoggedIn,
    apiAuth,
    apiAdminAuth
};