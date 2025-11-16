const redis = require('redis');
require('dotenv').config();

let redisClient;

async function connectRedis() {
  try {
    // Check if Redis URL is provided, otherwise use default
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Parse Redis URL to detect if TLS is required (rediss://)
    const isTLS = redisUrl.startsWith('rediss://');
    
    // Configuration for Redis Cloud or local Redis
    const clientConfig = {
      url: redisUrl,
      socket: {
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

    // Set up Promise BEFORE connecting to catch ready event
    const readyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Redis ready timeout'));
      }, 5000);

      // Set up listeners before connecting
      redisClient.once('ready', () => {
        clearTimeout(timeout);
        console.log('✅ Redis connected and ready');
        resolve();
      });

      redisClient.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis: Connecting...');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
    });

    // Connect and wait for ready
    await redisClient.connect();
    await readyPromise; // Wait for ready event
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
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

