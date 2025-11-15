const {
  isAuthenticated,
  isAdmin,
  isUser,
  addUserToViews,
  redirectIfLoggedIn,
  apiAuth,
  apiAdminAuth
} = require('../../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {},
      path: '/test'
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      json: jest.fn(),
      locals: {}
    };
    next = jest.fn();
  });

  describe('isAuthenticated', () => {
    it('should call next() if user is authenticated', () => {
      req.session.user = { id: '123', role: 'user' };

      isAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to admin login if accessing admin route without auth', () => {
      req.session.user = null;
      req.path = '/admin/dashboard';

      isAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/auth/admin/login');
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect to user login if accessing user route without auth', () => {
      req.session.user = null;
      req.path = '/user/123/dashboard';

      isAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/auth/user/login');
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect to user login for default routes without auth', () => {
      req.session.user = null;
      req.path = '/some-route';

      isAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/auth/user/login');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should allow access for admin users', () => {
      req.session.user = { id: '123', role: 'admin' };

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin users', () => {
      req.session.user = { id: '123', role: 'user' };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          title: 'Access Denied',
          message: 'You do not have permission to access this page.'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access if user is not authenticated', () => {
      req.session.user = null;

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isUser', () => {
    it('should allow access for admin users', () => {
      req.session.user = { id: '123', role: 'admin' };

      isUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow access for user accessing their own data', () => {
      req.session.user = { id: '123', role: 'user' };
      req.params = { userId: '123' };

      isUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access if user tries to access another user\'s data', () => {
      req.session.user = { id: '123', role: 'user' };
      req.params = { userId: '456' };

      isUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          title: 'Access Denied',
          message: 'You can only access your own data.'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect to login if user is not authenticated', () => {
      req.session.user = null;

      isUser(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/user/login');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('addUserToViews', () => {
    it('should add user info to res.locals when authenticated', () => {
      req.session.user = { id: '123', role: 'admin', name: 'Admin' };

      addUserToViews(req, res, next);

      expect(res.locals.currentUser).toEqual(req.session.user);
      expect(res.locals.isAdmin).toBe(true);
      expect(res.locals.isLoggedIn).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    it('should set null values when not authenticated', () => {
      req.session.user = null;

      addUserToViews(req, res, next);

      expect(res.locals.currentUser).toBeNull();
      expect(res.locals.isAdmin).toBe(false);
      expect(res.locals.isLoggedIn).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it('should set isAdmin to false for regular users', () => {
      req.session.user = { id: '123', role: 'user', name: 'User' };

      addUserToViews(req, res, next);

      expect(res.locals.isAdmin).toBe(false);
      expect(res.locals.isLoggedIn).toBe(true);
    });
  });

  describe('redirectIfLoggedIn', () => {
    it('should redirect admin to admin dashboard if already logged in', () => {
      req.session.user = { id: '123', role: 'admin' };

      redirectIfLoggedIn(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/admin/dashboard');
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect user to user dashboard if already logged in', () => {
      req.session.user = { id: '123', role: 'user' };

      redirectIfLoggedIn(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/user/123/dashboard');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user is not logged in', () => {
      req.session.user = null;

      redirectIfLoggedIn(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('apiAuth', () => {
    it('should call next() if user is authenticated', () => {
      req.session.user = { id: '123', role: 'user' };

      apiAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 JSON response if user is not authenticated', () => {
      req.session.user = null;

      apiAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required',
        error: 'Please log in to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('apiAdminAuth', () => {
    it('should call next() if user is admin', () => {
      req.session.user = { id: '123', role: 'admin' };

      apiAdminAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 JSON response if user is not admin', () => {
      req.session.user = { id: '123', role: 'user' };

      apiAdminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Admin access required',
        error: 'You do not have permission to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 JSON response if user is not authenticated', () => {
      req.session.user = null;

      apiAdminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

