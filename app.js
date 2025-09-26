// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Enable method override for PUT/DELETE from forms
app.use(express.static(path.join(__dirname, "public"))); // serve CSS/JS/images

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/transport-management'
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Add user to views middleware
const { addUserToViews } = require('./src/middleware/auth');
app.use(addUserToViews);

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views")); // views folder inside src

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transport-management')
  .then(() => console.log("✅ MongoDB connected"))
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
