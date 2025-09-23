const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard');  // Looks for src/views/admin/dashboard.ejs
});

module.exports = router;
