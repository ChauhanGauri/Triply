// Email service for sending various types of emails
const { createTransporter, emailConfig } = require('../config/email');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = createTransporter();
    this.useBrevoAPI = process.env.EMAIL_HOST === 'smtp-relay.brevo.com';
  }

  /**
   * Send email
   * @param {Object} options - Email options (to, subject, html, text)
   * @returns {Promise}
   */
  async sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      // Use Brevo API if configured for Brevo
      if (this.useBrevoAPI && process.env.EMAIL_PASSWORD) {
        return await this.sendViaBrevoAPI({ to, subject, html, text });
      }

      // Fallback to SMTP
      if (!this.transporter) {
        console.warn('⚠️ Email transporter not configured - email not sent');
        return { success: true, messageId: 'test-mode' };
      }

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
        to,
        subject,
        text,
        html,
        replyTo: emailConfig.replyTo,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  /**
   * Send email via Brevo API
   */
  async sendViaBrevoAPI({ to, subject, html, text }) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.EMAIL_PASSWORD,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: emailConfig.from.name,
          email: emailConfig.from.address
        },
        to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
        replyTo: {
          email: emailConfig.replyTo
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking, user, schedule, route) {
    const subject = `Booking Confirmation - ${booking.bookingReference}`;
    const seatsCount = booking.seats || (Array.isArray(booking.seatNumbers) ? booking.seatNumbers.length : 1);
    const totalAmount = (typeof booking.totalPrice === 'number') ? booking.totalPrice : (route && route.fare ? route.fare * seatsCount : null);
    const totalDisplay = totalAmount !== null ? `₹${totalAmount}` : 'N/A';
    const routeFrom = (route && (route.origin || route.startLocation)) || 'Unknown';
    const routeTo = (route && (route.destination || route.endLocation)) || 'Unknown';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Booking Confirmed!</h1>
            <p>Your journey is all set</p>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Thank you for booking with Triply Transport! Your booking has been confirmed.</p>
            
            <div class="booking-details">
              <h2 style="margin-top: 0; color: #F59E0B;">Booking Details</h2>
              <div class="detail-row">
                <span class="detail-label">Booking Reference:</span>
                <span class="detail-value"><strong>${booking.bookingReference}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Route:</span>
                <span class="detail-value">${routeFrom} → ${routeTo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Departure:</span>
                <span class="detail-value">${schedule.departureTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Arrival:</span>
                <span class="detail-value">${schedule.arrivalTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Seats:</span>
                <span class="detail-value">${booking.seats}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value"><strong>${totalDisplay}</strong></span>
              </div>
            </div>

            <p><strong>Important Information:</strong></p>
            <ul>
              <li>Please arrive at the boarding point 15 minutes before departure</li>
              <li>Carry a valid ID proof for verification</li>
              <li>Keep this booking reference handy</li>
            </ul>

            <center>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/user/${user._id}/bookings" class="button">View My Bookings</a>
            </center>

            <p>If you have any questions, feel free to contact us.</p>
            <p>Happy Journey! 🚌</p>
          </div>
          <div class="footer">
            <p>Triply Transport - Your Trusted Travel Partner</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
  Booking Confirmed!

  Dear ${user.name},

  Your booking has been confirmed with the following details:

  Booking Reference: ${booking.bookingReference}
  Route: ${routeFrom} → ${routeTo}
  Departure: ${schedule.departureTime}
  Arrival: ${schedule.arrivalTime}
  Seats: ${booking.seats}
  Total Amount: ${totalDisplay}

  Important:
  - Arrive 15 minutes before departure
  - Carry valid ID proof
  - Keep booking reference handy

  Thank you for choosing Triply Transport!
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password for your Triply Transport account.</p>
            
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>

            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>

            <p>If you're having trouble, contact our support team.</p>
          </div>
          <div class="footer">
            <p>Triply Transport - Your Trusted Travel Partner</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset Request

Hello ${user.name},

We received a request to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Triply Transport
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  /**
   * Send booking notification to Triply Transport email
   */
  async sendTriplyBookingNotification(booking, user, schedule, route) {
    const triplyEmail = 'triply.transport@gmail.com';
    const subject = `New Booking: ${booking.bookingReference}`;
    const seatsCount = booking.seats || (Array.isArray(booking.seatNumbers) ? booking.seatNumbers.length : 1);
    const totalAmount = (typeof booking.totalPrice === 'number') ? booking.totalPrice : (route && route.fare ? route.fare * seatsCount : null);
    const totalDisplay = totalAmount !== null ? `₹${totalAmount}` : 'N/A';
    const routeFrom = (route && (route.origin || route.startLocation)) || 'Unknown';
    const routeTo = (route && (route.destination || route.endLocation)) || 'Unknown';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d3748; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #F59E0B; }
          .button { display: inline-block; padding: 10px 20px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🆕 New Booking Alert</h2>
          </div>
          <div class="content">
            <p><strong>A new booking has been made on the system.</strong></p>
            
            <div class="info-box">
              <h3>Booking Information</h3>
              <p><strong>Reference:</strong> ${booking.bookingReference}</p>
              <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
              <p><strong>Route:</strong> ${routeFrom} → ${routeTo}</p>
              <p><strong>Date:</strong> ${new Date(schedule.journeyDate || schedule.date || Date.now()).toLocaleDateString()}</p>
              <p><strong>Departure:</strong> ${schedule.departureTime}</p>
              <p><strong>Seats:</strong> ${booking.seats}</p>
              <p><strong>Amount:</strong> ${totalDisplay}</p>
            </div>

            <center>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/bookings" class="button">View in Dashboard</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
    New Booking Alert

    A new booking has been made:

    Reference: ${booking.bookingReference}
    Customer: ${user.name} (${user.email})
    Route: ${routeFrom} → ${routeTo}
    Date: ${new Date(schedule.journeyDate || schedule.date || Date.now()).toLocaleDateString()}
    Departure: ${schedule.departureTime}
    Seats: ${booking.seats}
    Amount: ${totalDisplay}

    View details in admin dashboard.
    `;

    return this.sendEmail({
      to: triplyEmail,
      subject,
      html,
      text
    });
  }

  /**
   * Send schedule change notification
   */
  async sendScheduleChangeAlert(schedule, route, affectedBookings) {
    const routeFrom = (route && (route.origin || route.startLocation)) || 'Unknown';
    const routeTo = (route && (route.destination || route.endLocation)) || 'Unknown';
    const subject = `Schedule Update: ${routeFrom} → ${routeTo}`;

    for (const booking of affectedBookings) {
      const user = booking.userId;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Schedule Update</h1>
            </div>
            <div class="content">
              <p>Dear ${user.name},</p>
              
              <div class="alert-box">
                <p><strong>Important:</strong> The schedule for your upcoming journey has been updated.</p>
              </div>

              <h3>Booking Details:</h3>
              <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
                <p><strong>Route:</strong> ${routeFrom} → ${routeTo}</p>
              
              <h3>Updated Schedule:</h3>
              <p><strong>New Departure Time:</strong> ${schedule.departureTime}</p>
              <p><strong>New Arrival Time:</strong> ${schedule.arrivalTime}</p>
              ${schedule.isActive === false ? '<p style="color: red;"><strong>Status: CANCELLED</strong></p>' : ''}

              <p>We apologize for any inconvenience caused. If you have any questions or concerns, please contact our support team.</p>

              <center>
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/user/${user._id}/bookings" class="button">View My Bookings</a>
              </center>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Schedule Update Alert

Dear ${user.name},

The schedule for your booking has been updated.

Booking Reference: ${booking.bookingReference}
  Route: ${routeFrom} → ${routeTo}
New Departure: ${schedule.departureTime}
New Arrival: ${schedule.arrivalTime}
${schedule.isActive === false ? 'Status: CANCELLED' : ''}

Please check your booking for more details.

Triply Transport
      `;

      await this.sendEmail({
        to: user.email,
        subject,
        html,
        text
      });
    }
  }

  /**
   * Send booking cancellation email
   */
  async sendBookingCancellation(booking, user, schedule, route) {
    const subject = `Booking Cancelled - ${booking.bookingReference}`;
    const seatsCount = booking.seats || (Array.isArray(booking.seatNumbers) ? booking.seatNumbers.length : 1);
    const totalAmount = (typeof booking.totalPrice === 'number') ? booking.totalPrice : (route && route.fare ? route.fare * seatsCount : null);
    const totalDisplay = totalAmount !== null ? `₹${totalAmount}` : 'N/A';
    const routeFrom = (route && (route.origin || route.startLocation)) || 'Unknown';
    const routeTo = (route && (route.destination || route.endLocation)) || 'Unknown';
    const journeyDateDisplay = new Date(schedule.journeyDate || schedule.date || Date.now()).toLocaleDateString();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Your booking has been cancelled.</p>
            
            <div class="info-box">
              <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
              <p><strong>Route:</strong> ${routeFrom} → ${routeTo}</p>
              <p><strong>Date:</strong> ${journeyDateDisplay}</p>
              <p><strong>Departure:</strong> ${schedule.departureTime}</p>
              <p><strong>Seats:</strong> ${seatsCount}</p>
              <p><strong>Amount:</strong> ${totalDisplay}</p>
              <p><strong>Status:</strong> Cancelled</p>
            </div>

            <p>If this was a paid booking, your refund will be processed within 5-7 business days.</p>
            <p>We hope to serve you again soon!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
  Booking Cancelled

  Dear ${user.name},

  Your booking ${booking.bookingReference} has been cancelled.
  Route: ${routeFrom} → ${routeTo}
  Date: ${journeyDateDisplay}
  Departure: ${schedule.departureTime}
  Seats: ${seatsCount}
  Amount: ${totalDisplay}

  Refund (if applicable) will be processed within 5-7 business days.

  Thank you,
  Triply Transport
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  /**
   * Send booking cancellation notification to Triply Transport email
   */
  async sendTriplyCancellationNotification(booking, user, schedule, route) {
    const triplyEmail = 'triply.transport@gmail.com';
    const subject = `Booking Cancelled: ${booking.bookingReference}`;
    const seatsCount = booking.seats || (Array.isArray(booking.seatNumbers) ? booking.seatNumbers.length : 1);
    const totalAmount = (typeof booking.totalPrice === 'number') ? booking.totalPrice : (route && route.fare ? route.fare * seatsCount : null);
    const totalDisplay = totalAmount !== null ? `₹${totalAmount}` : 'N/A';
    const routeFrom = (route && (route.origin || route.startLocation)) || 'Unknown';
    const routeTo = (route && (route.destination || route.endLocation)) || 'Unknown';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚫 Booking Cancelled</h2>
          </div>
          <div class="content">
            <p><strong>A booking has been cancelled on the system.</strong></p>
            
            <div class="info-box">
              <h3>Booking Information</h3>
              <p><strong>Reference:</strong> ${booking.bookingReference}</p>
              <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
              <p><strong>Route:</strong> ${routeFrom} → ${routeTo}</p>
              <p><strong>Date:</strong> ${new Date(schedule.journeyDate || schedule.date || Date.now()).toLocaleDateString()}</p>
              <p><strong>Departure:</strong> ${schedule.departureTime}</p>
              <p><strong>Seats:</strong> ${booking.seats}</p>
              <p><strong>Amount:</strong> ${totalDisplay}</p>
              <p><strong>Status:</strong> Cancelled</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Booking Cancelled Alert

A booking has been cancelled:

Reference: ${booking.bookingReference}
Customer: ${user.name} (${user.email})
Route: ${routeFrom} → ${routeTo}
Date: ${new Date(schedule.journeyDate || schedule.date || Date.now()).toLocaleDateString()}
Departure: ${schedule.departureTime}
Seats: ${booking.seats}
Amount: ${totalDisplay}
Status: Cancelled
    `;

    return this.sendEmail({
      to: triplyEmail,
      subject,
      html,
      text
    });
  }
}

module.exports = new EmailService();
