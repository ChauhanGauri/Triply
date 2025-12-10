// app.js
require("dotenv").config();
const express = require("express");
const http = require('http');
const https = require('https');
const fs = require('fs');
const { initSocket } = require('./src/config/socket');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { RedisStore } = require('connect-redis');
const { connectRedis, getRedisClient, isRedisReady } = require('./src/config/redis');
const methodOverride = require("method-override");
const path = require("path");
const ensureAdminSeed = require('./src/utils/ensureAdmin');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Enable method override for PUT/DELETE from forms
app.use(express.static(path.join(__dirname, "public"))); // serve CSS/JS/images

// Initialize Redis connection and session store
let sessionStore;
let redisInitialized = false;

async function initializeRedisAndStartServer() {
  try {
    // Try to connect to Redis first (this now waits for ready event)
    await connectRedis();
    
    // Redis is now ready, use it for session storage
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      throw new Error('Redis client not ready after connection');
    }
    
    sessionStore = new RedisStore({
      client: client,
      prefix: 'sess:',
    });
    console.log('✅ Using Redis for session storage');
    redisInitialized = true;
  } catch (error) {
    // Fallback to MongoDB for sessions
    console.warn('⚠️ Redis not available, using MongoDB for sessions');
    if (error.message) {
      console.warn('   Error:', error.message);
    }
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/transport-management'
    });
  }

  // Session configuration (after Redis connection attempt)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
    store: sessionStore,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.COOKIE_SAME_SITE || 'lax'
  }
});

app.use(sessionMiddleware);

// Add user to views middleware
const { addUserToViews } = require('./src/middleware/auth');
app.use(addUserToViews);

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views")); // views folder inside src

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transport-management')
  .then(async () => {
    console.log("✅ MongoDB connected");
    try {
      await ensureAdminSeed();
    } catch (error) {
      console.warn('⚠️ Unable to seed default admin automatically:', error.message);
    }
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Default route - show home or redirect based on session
app.get('/', (req, res) => {
  try {
    // If a user is logged in, redirect to their dashboard
    if (req.session && req.session.user) {
      if (req.session.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }
      return res.redirect(`/user/${req.session.user.id}/dashboard`);
    }

    // Not logged in -> render public home page
    return res.render('home', { title: 'Public Transport Management System' });
  } catch (err) {
    console.error('Error handling root route:', err);
    return res.status(500).render('error', { title: 'Error', message: 'Unable to load home page', error: err });
  }
});

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const routeRoutes = require("./src/routes/routeRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const passengerManifestRoutes = require("./src/routes/passengerManifestRoutes");

// Authentication routes (must be before protected routes)
app.use("/auth", authRoutes);

// Legacy login redirects
app.get("/admin/login", (req, res) => res.redirect("/auth/admin/login"));
app.get("/user/login", (req, res) => res.redirect("/auth/user/login"));

// Use API routes
app.use("/api/users", userRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/schedules", scheduleRoutes);

// Use dashboard routes (handles both admin and user dashboards)
app.use("/", dashboardRoutes);

// Use passenger manifest routes
app.use("/", passengerManifestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404, stack: '' }
  });
});

// Security headers middleware
app.use((req, res, next) => {
  // HSTS (HTTP Strict Transport Security) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production' && process.env.HSTS_ENABLED === 'true') {
    const maxAge = process.env.HSTS_MAX_AGE || 31536000; // 1 year default
    res.setHeader('Strict-Transport-Security', `max-age=${maxAge}; includeSubDomains; preload`);
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// SSL/HTTPS Configuration
const SSL_ENABLED = process.env.SSL_ENABLED === 'true';
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

let server;

if (SSL_ENABLED && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    // Read SSL certificate files
    const privateKey = fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH), 'utf8');
    const certificate = fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH), 'utf8');
    
    const credentials = {
      key: privateKey,
      cert: certificate
    };
    
    // Create HTTPS server
    server = https.createServer(credentials, app);
    console.log('✅ SSL/HTTPS enabled');
    
    // Optional: Create HTTP server that redirects to HTTPS
    if (process.env.FORCE_HTTPS === 'true') {
      const httpApp = express();
      httpApp.use('*', (req, res) => {
        const host = req.headers.host.replace(/:\d+$/, ''); // Remove port
        const httpsPort = HTTPS_PORT === 443 ? '' : `:${HTTPS_PORT}`;
        res.redirect(301, `https://${host}${httpsPort}${req.url}`);
      });
      
      const httpServer = http.createServer(httpApp);
      httpServer.listen(PORT, () => {
        console.log(`🔀 HTTP redirect server running on port ${PORT} → HTTPS ${HTTPS_PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ SSL certificate error:', error.message);
    console.log('⚠️  Falling back to HTTP mode');
    server = http.createServer(app);
  }
} else {
  // Create HTTP server
  server = http.createServer(app);
  if (SSL_ENABLED) {
    console.log('⚠️  SSL_ENABLED is true but certificate paths are missing');
  }
  console.log('ℹ️  Running in HTTP mode');
}

// Initialize socket.io (after Redis connection) - pass session middleware
initSocket(server, sessionMiddleware);

// Start server
const listenPort = SSL_ENABLED && server instanceof https.Server ? HTTPS_PORT : PORT;
server.listen(listenPort, () => {
  const protocol = SSL_ENABLED && server instanceof https.Server ? 'https' : 'http';
  console.log(`✅ Server running on ${protocol}://localhost:${listenPort}`);
});
}

// Initialize Redis and start server
initializeRedisAndStartServer().catch((error) => {
  console.error('❌ Failed to initialize application:', error);
  process.exit(1);
});
