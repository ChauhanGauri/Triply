# Redis Cloud Setup Guide

This guide will help you set up Redis Cloud for your Public Transport Management System.

## Step 1: Create Redis Cloud Account

1. **Sign up for Redis Cloud:**
   - Go to: https://redis.com/try-free/
   - Click "Get Started" or "Try Free"
   - Sign up with your email or use Google/GitHub login

2. **Create a Free Database:**
   - After logging in, click "New Subscription"
   - Select the **Free** tier (30MB, perfect for development)
   - Choose your cloud provider and region (closest to your server)
   - Click "Activate"

## Step 2: Get Your Connection Details

1. **Access Your Database:**
   - In Redis Cloud console, go to your subscription
   - Click on your database name

2. **Get Connection Information:**
   - You'll see connection details including:
     - **Endpoint** (host:port)
     - **Default user password**
     - **Public endpoint** (if enabled)

3. **Connection URL Format:**
   ```
   rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT:PORT
   ```
   
   Or if TLS is not required:
   ```
   redis://default:YOUR_PASSWORD@YOUR_ENDPOINT:PORT
   ```

## Step 3: Configure Your Application

1. **Create or Update `.env` file:**
   
   ```env
   # Redis Cloud Configuration
   REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT:PORT
   ```
   
   **Example:**
   ```env
   REDIS_URL=rediss://default:AbCdEf123456@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345
   ```

2. **Important Notes:**
   - Replace `YOUR_PASSWORD` with your actual Redis password
   - Replace `YOUR_ENDPOINT` with your Redis Cloud endpoint
   - Replace `PORT` with your Redis port (usually 12345 or similar)
   - Use `rediss://` (with double 's') for TLS/SSL connections
   - Use `redis://` (single 's') if TLS is disabled

## Step 4: Enable Public Endpoint (If Required)

If your application is hosted outside Redis Cloud's network:

1. In Redis Cloud console, go to your database
2. Click on "Configuration"
3. Enable "Public endpoint"
4. Note the new public endpoint URL
5. Update your `.env` file with the public endpoint

## Step 5: Test the Connection

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Check console output:**
   You should see:
   ```
   🔄 Redis: Connecting...
   ✅ Redis connected and ready
   ✅ Using Redis for session storage
   ✅ Socket.io Redis adapter initialized
   ```

3. **If connection fails:**
   - Verify your `REDIS_URL` in `.env`
   - Check that public endpoint is enabled (if needed)
   - Verify password is correct
   - Check firewall/network settings

## Step 6: Verify Redis is Working

### Test Session Storage:
1. Log in to your application
2. Check if session persists after page refresh
3. Look for session data in Redis Cloud console (if available)

### Test Caching:
1. Load the admin dashboard
2. First load: fetches from database
3. Second load (within cache time): should be faster (from cache)

### Test Rate Limiting:
1. Try logging in with wrong credentials 5+ times
2. Should see rate limit error after 5 attempts
3. Wait 15 minutes or clear Redis to reset

## Redis Cloud Console Features

### Monitor Your Database:
- **Metrics**: View memory usage, operations per second
- **Slow Log**: See slow queries
- **Configuration**: View and modify Redis settings
- **Backups**: Configure automatic backups

### View Data:
- Use the built-in Redis CLI in the console
- Or use Redis Insight (downloadable tool)

## Security Best Practices

1. **Use Strong Passwords:**
   - Redis Cloud generates secure passwords by default
   - Don't share your password

2. **Enable TLS/SSL:**
   - Always use `rediss://` for production
   - Protects data in transit

3. **Restrict Access:**
   - Use IP whitelisting if possible
   - Enable VPC peering for cloud deployments

4. **Rotate Passwords:**
   - Change passwords periodically
   - Update `.env` when changed

## Troubleshooting

### Connection Timeout

**Problem:** Connection times out

**Solutions:**
- Enable "Public endpoint" in Redis Cloud
- Check firewall rules
- Verify endpoint URL is correct
- Try using `redis://` instead of `rediss://` (less secure)

### Authentication Failed

**Problem:** "NOAUTH Authentication required" or "WRONGPASS"

**Solutions:**
- Verify password in `.env` file
- Check for extra spaces in REDIS_URL
- Ensure you're using the correct user (usually "default")
- Reset password in Redis Cloud console if needed

### TLS/SSL Errors

**Problem:** "certificate verify failed" or TLS errors

**Solutions:**
- The configuration already sets `rejectUnauthorized: false` for development
- For production, use proper certificates
- Verify you're using `rediss://` (with double 's')

### Memory Limit Exceeded

**Problem:** "OOM command not allowed when used memory > 'maxmemory'"

**Solutions:**
- Free tier has 30MB limit
- Upgrade to paid tier for more memory
- Clear old cache data
- Reduce cache expiration times

## Free Tier Limits

- **Memory:** 30MB
- **Databases:** 1
- **Connections:** 30
- **Operations:** 250 commands/second

**For Production:**
- Consider upgrading to a paid tier
- Monitor memory usage
- Set appropriate cache expiration times

## Upgrading Your Plan

1. Go to Redis Cloud console
2. Click on your subscription
3. Click "Upgrade"
4. Choose a plan that fits your needs
5. Your connection URL remains the same

## Support

- **Redis Cloud Docs:** https://docs.redis.com/
- **Redis Cloud Support:** Available in console
- **Community:** https://redis.io/community

## Quick Reference

```env
# .env file example
REDIS_URL=rediss://default:your_password_here@your_endpoint:port
```

**Connection String Components:**
- `rediss://` - Protocol (TLS enabled)
- `default` - Username (usually "default" for Redis Cloud)
- `your_password_here` - Your Redis password
- `your_endpoint` - Redis Cloud endpoint
- `port` - Redis port (usually 12345 or similar)


