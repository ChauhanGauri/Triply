const {
  validateRoute,
  validateSchedule,
  validateUser,
  validateBooking
} = require('../../../src/middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateRoute', () => {
    it('should call next() if all required fields are present', () => {
      req.body = {
        name: 'Route 1',
        startLocation: 'City A',
        endLocation: 'City B'
      };

      validateRoute(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 if name is missing', () => {
      req.body = {
        startLocation: 'City A',
        endLocation: 'City B'
      };

      validateRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a route.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if startLocation is missing', () => {
      req.body = {
        name: 'Route 1',
        endLocation: 'City B'
      };

      validateRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a route.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if endLocation is missing', () => {
      req.body = {
        name: 'Route 1',
        startLocation: 'City A'
      };

      validateRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a route.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateSchedule', () => {
    it('should call next() if all required fields are present', () => {
      req.body = {
        routeId: 'route123',
        departureTime: '10:00',
        arrivalTime: '12:00'
      };

      validateSchedule(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 if routeId is missing', () => {
      req.body = {
        departureTime: '10:00',
        arrivalTime: '12:00'
      };

      validateSchedule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a schedule.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if departureTime is missing', () => {
      req.body = {
        routeId: 'route123',
        arrivalTime: '12:00'
      };

      validateSchedule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a schedule.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if arrivalTime is missing', () => {
      req.body = {
        routeId: 'route123',
        departureTime: '10:00'
      };

      validateSchedule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a schedule.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should call next() if all required fields are present', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      validateUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 if username is missing', () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      validateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a user.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if email is missing', () => {
      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      validateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a user.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if password is missing', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com'
      };

      validateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a user.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateBooking', () => {
    it('should call next() if all required fields are present', () => {
      req.body = {
        userId: 'user123',
        scheduleId: 'schedule123',
        seats: 2
      };

      validateBooking(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 if userId is missing', () => {
      req.body = {
        scheduleId: 'schedule123',
        seats: 2
      };

      validateBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a booking.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if scheduleId is missing', () => {
      req.body = {
        userId: 'user123',
        seats: 2
      };

      validateBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a booking.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if seats is missing', () => {
      req.body = {
        userId: 'user123',
        scheduleId: 'schedule123'
      };

      validateBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All fields are required for a booking.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

