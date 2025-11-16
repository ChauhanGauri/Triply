const rateLimit = require('express-rate-limit');
const { getRedisClient, isRedisReady } = require('../config/redis');
const RedisStore = require('rate-limit-redis');

// Helper function to create Redis store safely (lazy initialization)
function createRedisStore(prefix) {
  try {
    if (isRedisReady()) {
      const client = getRedisClient();
      return new RedisStore({
        client: client,
        prefix: prefix,
      });
    }
  } catch (error) {
    // Redis not ready, will fallback to memory store
  }
  // Fallback to memory store if Redis is not available
  return undefined;
}

// General API rate limiter
const apiLimiter = rateLimit({
  store: createRedisStore('rl:api:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks or admin routes in development
    return process.env.NODE_ENV === 'development' && req.path === '/health';
  }
});

// Strict rate limiter for login attempts
const loginLimiter = rateLimit({
  store: createRedisStore('rl:login:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking creation rate limiter
const bookingLimiter = rateLimit({
  store: createRedisStore('rl:booking:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 bookings per hour per IP
  message: 'Too many booking attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration rate limiter
const registerLimiter = rateLimit({
  store: createRedisStore('rl:register:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 registrations per hour per IP
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  loginLimiter,
  bookingLimiter,
  registerLimiter
};

