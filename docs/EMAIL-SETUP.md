# Email Notifications Setup Guide

This guide explains how to configure and use the email notification system in Triply Transport application.

## Features

✅ **Booking Confirmations** - Sent to customers after successful booking  
✅ **Admin Notifications** - Sent to admins for new bookings  
✅ **Password Reset** - Secure password reset via email  
✅ **Schedule Change Alerts** - Notify passengers of schedule updates  
✅ **Booking Cancellation** - Confirmation of cancelled bookings  

## Configuration

### 1. Environment Variables

Add these variables to your `.env` file:

```env
# Application URL (for email links)
APP_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=Triply Transport
EMAIL_FROM_ADDRESS=noreply@triply.com
EMAIL_REPLY_TO=support@triply.com

# Admin Emails - Use ADMIN_EMAILS for multiple admins (recommended)
ADMIN_EMAILS=admin1@yourcompany.com,admin2@yourcompany.com,admin3@yourcompany.com
# Or use ADMIN_EMAIL for a single admin (legacy)
# ADMIN_EMAIL=admin@transport.com
```

### 2. Gmail Setup (Development)

For development with Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Select "2-Step Verification"
   - Scroll to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password
3. **Update .env**:
   ```env
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### 3. Production Email Services

For production, use professional email services:

#### **SendGrid** (Recommended)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

#### **Mailgun**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.com
EMAIL_PASSWORD=your_mailgun_password
```

#### **AWS SES**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_ses_smtp_username
EMAIL_PASSWORD=your_ses_smtp_password
```

#### **Mailtrap** (Testing Only)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
```

## Email Types

### 1. Booking Confirmation
**Trigger:** New booking created  
**Recipient:** Customer  
**Content:**
- Booking reference number
- Route details
- Departure/arrival times
- Seat numbers
- Total amount
- Important travel information

### 2. Admin Booking Notification
**Trigger:** New booking created  
**Recipient:** Admin  
**Content:**
- Customer details
- Booking information
- Quick link to admin dashboard

### 3. Password Reset
**Trigger:** User requests password reset  
**Recipient:** User  
**Content:**
- Secure reset link (expires in 1 hour)
- Security warnings
- Instructions

**Endpoints:**
- `GET /auth/forgot-password` - Forgot password form
- `POST /auth/forgot-password` - Request reset email
- `GET /auth/reset-password/:token` - Reset password form
- `POST /auth/reset-password/:token` - Submit new password

### 4. Schedule Change Alert
**Trigger:** Schedule time updated or cancelled  
**Recipient:** All passengers with bookings on that schedule  
**Content:**
- Booking reference
- Original vs updated schedule
- Cancellation notice (if applicable)
- Support contact information

### 5. Booking Cancellation
**Trigger:** Booking cancelled  
**Recipient:** Customer  
**Content:**
- Cancellation confirmation
- Booking details
- Refund information

## Usage

### Send Booking Confirmation

The email is sent automatically when a booking is created. No additional code needed.

```javascript
// In bookingController.js - automatically handled
const newBooking = await Booking.create(bookingData);
// Email sent automatically ✅
```

### Send Password Reset Email

```javascript
// User requests password reset
POST /auth/forgot-password
Body: { email: "user@example.com" }

// User clicks email link and resets password
POST /auth/reset-password/:token
Body: { password: "newpass", confirmPassword: "newpass" }
```

### Send Schedule Change Alert

```javascript
// Automatically sent when schedule is updated
PUT /api/schedules/:id
Body: { departureTime: "10:00 AM", ... }
// Emails sent to affected passengers ✅
```

### Manual Email Sending

```javascript
const emailService = require('./src/utils/emailService');

// Send custom email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>HTML Content</h1>',
  text: 'Plain text fallback'
});
```

## Testing

### Test Mode (No Email Server)

If email credentials are not configured, the system will log emails to console instead of sending them:

```bash
📧 Email would be sent to: user@example.com
📧 Subject: Booking Confirmation
📧 Content: ...
```

### Test with Mailtrap

1. Create free account at [mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials
3. Add to `.env`:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_username
EMAIL_PASSWORD=your_password
```
4. All emails will be captured in Mailtrap inbox

## Troubleshooting

### Emails Not Sending

**Check Console Logs:**
```
✅ Email server is ready to send messages
✅ Email sent successfully: <message-id>
```

**Common Issues:**

1. **Gmail "Less secure app" error**
   - Solution: Use App Password, not regular password

2. **Connection timeout**
   - Check `EMAIL_HOST` and `EMAIL_PORT`
   - Verify firewall/network settings

3. **Authentication failed**
   - Verify `EMAIL_USER` and `EMAIL_PASSWORD`
   - Check if 2FA is enabled (use App Password)

4. **Emails in spam**
   - Use professional email service (SendGrid, Mailgun)
   - Configure SPF/DKIM records
   - Use verified domain

### Debug Mode

Enable detailed logging:

```javascript
// In src/config/email.js
const transport = nodemailer.createTransporter({
  ...config,
  debug: true,
  logger: true
});
```

## Email Templates

Templates are embedded in `src/utils/emailService.js`. To customize:

1. Open `src/utils/emailService.js`
2. Find the email method (e.g., `sendBookingConfirmation`)
3. Modify HTML and text content
4. Save and restart server

## Security Best Practices

✅ **Never commit `.env` file** - Keep email credentials secret  
✅ **Use App Passwords** - Don't use main account password  
✅ **Rate limiting** - Already implemented on login/register  
✅ **Token expiration** - Password reset tokens expire in 1 hour  
✅ **HTTPS in production** - Ensure secure email links  
✅ **Validate email addresses** - Check format before sending  

## Production Checklist

- [ ] Use professional email service (not Gmail)
- [ ] Configure SPF and DKIM records
- [ ] Set up email domain authentication
- [ ] Enable email bounce handling
- [ ] Monitor email sending logs
- [ ] Set up email templates in provider dashboard
- [ ] Configure email rate limits
- [ ] Add unsubscribe links (for marketing emails)
- [ ] Test all email types in staging
- [ ] Set appropriate `APP_URL` for production

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/forgot-password` | GET | Forgot password form |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password/:token` | GET | Reset password form |
| `/auth/reset-password/:token` | POST | Submit new password |

## File Structure

```
src/
├── config/
│   └── email.js                 # Email configuration
├── controllers/
│   ├── authController.js        # Password reset handlers
│   ├── bookingController.js     # Booking email triggers
│   └── scheduleController.js    # Schedule change alerts
├── utils/
│   └── emailService.js          # Email service & templates
├── views/
│   └── auth/
│       ├── forgot-password.ejs  # Forgot password page
│       └── reset-password.ejs   # Reset password page
└── models/
    └── User.js                  # Reset token fields
```

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify environment variables are set correctly
- Test with Mailtrap first before using production service
- Review email service provider documentation

---

**Last Updated:** November 2025
