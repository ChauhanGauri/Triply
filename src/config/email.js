// Brevo API email configuration only

// Parse admin emails from comma-separated string
const getAdminEmails = () => {
  const adminEmailsString = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'admin@transport.com';
  return adminEmailsString.split(',').map(email => email.trim()).filter(email => email);
};

const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Triply Transport',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@triply.com'
  },
  replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM_ADDRESS,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@transport.com',
  adminEmails: getAdminEmails()
};

module.exports = {
  emailConfig,
  getAdminEmails
};
