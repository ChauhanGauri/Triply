// Email configuration
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use:
  // 1. Brevo (recommended): smtp-relay.brevo.com:587
  // 2. SendGrid: smtp.sendgrid.net:587 with apikey
  // 3. Gmail (requires app password): smtp.gmail.com:587
  // 4. Mailtrap (testing): smtp.mailtrap.io
  // 5. Resend, Mailgun, AWS SES for production
  
  const config = {
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Brevo SMTP key
    }
  };

  // If no email credentials are configured, use a test account
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials not configured. Emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport(config);
};

// Verify transporter configuration
const verifyTransporter = async (transporter) => {
  if (!transporter) {
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server verification failed:', error.message);
    return false;
  }
};

// Parse admin emails from comma-separated string
const getAdminEmails = () => {
  const adminEmailsString = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'admin@transport.com';
  return adminEmailsString.split(',').map(email => email.trim()).filter(email => email);
};

// Email configuration settings
const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Triply Transport',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@triply.com'
  },
  replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@transport.com', // Kept for backward compatibility
  adminEmails: getAdminEmails() // Array of all admin emails
};

module.exports = {
  createTransporter,
  verifyTransporter,
  emailConfig,
  getAdminEmails
};
