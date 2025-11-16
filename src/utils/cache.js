const { getRedisClient } = require('../config/redis');

class CacheService {
  async get(key) {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      if (data) {
        console.log("✅ CACHE HIT");
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      // Silently fail - return null to fallback to database
      return null;
    }
  }
// ...existing code...

  // Set cached data with expiration
  async set(key, value, expirationInSeconds = 300) {
    try {
      const client = getRedisClient();
      await client.setEx(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      // Silently fail - caching is optional
      return false;
    }
  }

  // Delete cached data
  async delete(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Delete multiple keys by pattern
  async deletePattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cache middleware helper - get from cache or fetch and cache
  async getOrSet(key, fetchFunction, expirationInSeconds = 300) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        // CACHE HIT already logged in get() method
        return cached;
      }

      // If not in cache, fetch from database
      console.log("🔴 DB HIT");
      const data = await fetchFunction();

      // Store in cache
      await this.set(key, data, expirationInSeconds);

      return data;
    } catch (error) {
      // On error, try to fetch from database (graceful degradation)
      console.log("🔴 DB HIT");
      try {
        const data = await fetchFunction();
        return data;
      } catch (fetchError) {
        throw fetchError;
      }
    }
  }

  // Check if Redis is available
  isAvailable() {
    try {
      const client = getRedisClient();
      return client && client.isReady;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new CacheService();


