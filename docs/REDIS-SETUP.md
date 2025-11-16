# Redis Setup Guide

This guide explains how Redis is integrated into the Public Transport Management System and how to set it up.

## Overview

Redis is used in this application for:
1. **Session Storage** - Faster session lookups compared to MongoDB
2. **Caching** - Cache frequently accessed data (routes, schedules, dashboard statistics)
3. **Rate Limiting** - Prevent API abuse and brute force attacks
4. **Socket.io Scaling** - Enable real-time features across multiple server instances

## Installation

### Local Development (Windows)

1. **Download Redis for Windows:**
   - Download from: https://github.com/microsoftarchive/redis/releases
   - Or use WSL: `wsl sudo apt-get install redis-server`

2. **Install Redis via Docker (Recommended):**
   ```bash
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

3. **Or use Redis Cloud (Free tier available - Recommended):**
   - Sign up at: https://redis.com/try-free/
   - Get your connection URL
   - **See [Redis Cloud Setup Guide](REDIS-CLOUD-SETUP.md) for detailed instructions**

### macOS

```bash
brew install redis
brew services start redis
```

### Linux

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Redis Configuration (optional - defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# For Redis with password:
# REDIS_URL=redis://:password@localhost:6379

# For Redis Cloud (use rediss:// for TLS):
# REDIS_URL=rediss://default:password@endpoint:port
# Example: REDIS_URL=rediss://default:AbC123@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345
```

### Fallback Behavior

If Redis is not available:
- **Sessions**: Automatically fallback to MongoDB session store
- **Caching**: Gracefully degrades - queries go directly to database
- **Rate Limiting**: Falls back to in-memory store (resets on server restart)
- **Socket.io**: Uses default adapter (still works, just won't scale across servers)

## Usage

### Caching

The application automatically caches:
- **Dashboard Statistics**: 5 minutes cache
- **Routes**: 10 minutes cache
- **Monthly Booking Statistics**: 10 minutes cache
- **Individual Routes**: 10 minutes cache

Cache is automatically invalidated when data is updated.

Example of cache usage in controllers:

```javascript
const cache = require('../utils/cache');

// Get or set cache
const data = await cache.getOrSet(
    'cache:key',
    async () => {
        // Fetch from database
        return await Model.find();
    },
    600 // Cache for 10 minutes
);

// Invalidate cache on update
await cache.deletePattern('cache:*');
```

### Rate Limiting

Rate limiting is automatically applied to:
- **Login endpoints**: 5 attempts per 15 minutes per IP
- **Registration**: 3 registrations per hour per IP
- **Booking creation**: 10 bookings per hour per IP
- **API endpoints**: 100 requests per 15 minutes per IP

### Session Storage

Sessions are automatically stored in Redis if available, otherwise MongoDB.

### Socket.io Scaling

When Redis is available, Socket.io uses Redis adapter, allowing real-time features to work across multiple server instances.

## Testing Redis Connection

To test if Redis is working:

```bash
# Start your application
npm run dev

# Check console output
# Should see: "✅ Redis connected and ready"
# Should see: "✅ Using Redis for session storage"
```

## Troubleshooting

### Redis Connection Failed

**Symptoms:**
- Console shows: "⚠️ Redis not available, using MongoDB for sessions"
- Cache operations fail silently

**Solutions:**
1. Check if Redis is running: `redis-cli ping` (should return "PONG")
2. Verify REDIS_URL in `.env` file
3. Check firewall settings if using remote Redis
4. Ensure Redis server is accessible on port 6379

### Session Store Issues

If sessions aren't persisting:
1. Check Redis connection logs
2. Verify session secret in `.env`
3. Check Redis memory limits: `redis-cli INFO memory`

### Cache Not Working

If cache isn't improving performance:
1. Verify Redis is connected
2. Check cache expiration times in controllers
3. Monitor Redis with: `redis-cli MONITOR`

## Performance Benefits

With Redis implemented:
- **Session lookups**: ~90% faster than MongoDB
- **Dashboard load times**: Reduced by 60-80% when cached
- **Route queries**: Near-instant when cached
- **Database load**: Significantly reduced

## Production Considerations

1. **Use Redis with password authentication**
2. **Enable Redis persistence** (AOF or RDB)
3. **Set up Redis replication** for high availability
4. **Monitor Redis memory usage**
5. **Configure Redis maxmemory** policy
6. **Use Redis Sentinel** or **Redis Cluster** for production

## Redis Commands for Monitoring

```bash
# Connect to Redis CLI
redis-cli

# Check Redis info
INFO

# Monitor all commands
MONITOR

# Check memory usage
INFO memory

# List all keys
KEYS *

# Get a specific key
GET keyname

# Clear all cache (use with caution!)
FLUSHDB
```

