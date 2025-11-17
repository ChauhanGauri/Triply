const redis = require('redis');
require('dotenv').config();

let redisClient;

async function connectRedis() {
  // Allow disabling Redis via environment variable
  if (process.env.DISABLE_REDIS === 'true') {
    console.warn('⚠️ Redis is disabled via DISABLE_REDIS environment variable');
    throw new Error('Redis disabled');
  }

  try {
    // Check if Redis URL is provided, otherwise use default
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Parse Redis URL to detect if TLS is required (rediss://)
    const isTLS = redisUrl.startsWith('rediss://');
    
    // Configuration for Redis Cloud or local Redis
    const clientConfig = {
      url: redisUrl,
      socket: {
        connectTimeout: 5000, // Add connection timeout
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Too many reconnection attempts');
            return new Error('Too many retries');
          }
          return Math.min(retries * 100, 3000);
        },
        // TLS configuration for Redis Cloud
        ...(isTLS && {
          tls: true,
          rejectUnauthorized: false // Set to true in production with proper certificates
        })
      }
    };
    
    redisClient = redis.createClient(clientConfig);

    // Prevent unhandled errors from crashing the app
    redisClient.on('error', (err) => {
      // Just log errors, don't crash
      console.error('❌ Redis Client Error:', err.message || 'Connection failed');
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis: Connecting...');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
    });

    // Connect with timeout protection
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      )
    ]);

    // Wait a bit for ready state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!redisClient.isReady) {
      throw new Error('Redis client not ready after connection');
    }
    
    return redisClient;
  } catch (error) {
    // Clean up client on error
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
      redisClient = null;
    }
    console.error('❌ Redis connection error:', error.message || 'Unknown error');
    console.warn('⚠️ Continuing without Redis. Some features may be unavailable.');
    throw error;
  }
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

function isRedisReady() {
  return redisClient && redisClient.isReady;
}

async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error);
    }
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
  isRedisReady
};

