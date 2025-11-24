# Multi-Admin Setup Guide

## 🎯 Overview

This guide will help you set up your team of 4 admins to replace the single admin account. All team members will have full admin access to the dashboard and will receive email notifications for bookings and other important events.

---

## 📋 Prerequisites

- Node.js and MongoDB installed
- Project running successfully
- Access to team member email addresses
- Admin credentials for testing

---

## 🚀 Step-by-Step Setup

### Step 1: Edit Team Admin Details

Open the file: `scripts/setup-team-admins.js`

**Update lines 12-31** with your actual team member information:

```javascript
const TEAM_ADMINS = [
  {
    name: 'John Doe',                          // ← Replace with actual name
    email: 'john@yourcompany.com',             // ← Replace with actual email
    phone: '+911234567891',                     // ← Replace with actual phone
    password: 'ChangeMe123!'                    // ← Temporary password (they should change it)
  },
  {
    name: 'Jane Smith',
    email: 'jane@yourcompany.com',
    phone: '+911234567892',
    password: 'ChangeMe123!'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@yourcompany.com',
    phone: '+911234567893',
    password: 'ChangeMe123!'
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@yourcompany.com',
    phone: '+911234567894',
    password: 'ChangeMe123!'
  }
];
```

---

### Step 2: Run the Setup Script

Open PowerShell in your project directory and run:

```powershell
node scripts/setup-team-admins.js
```

**The script will:**
1. Show you the current admin users
2. Display the new admins to be created
3. Show which old admin accounts will be removed
4. Ask for your confirmation
5. Remove old admin accounts (admin@transport.com, admin@triply.com)
6. Create the 4 new admin accounts
7. Display a summary of changes

**Example output:**
```
🚀 Team Admin Setup Script
==========================

📊 Current admin users: 1
   - Admin (admin@transport.com)

📝 New team admins to be created:
   1. John Doe - john@yourcompany.com
   2. Jane Smith - jane@yourcompany.com
   3. Mike Johnson - mike@yourcompany.com
   4. Sarah Williams - sarah@yourcompany.com

🗑️  Old admin accounts to be removed:
   - admin@transport.com (exists)
   - admin@triply.com (not found)

⚠️  Do you want to proceed? (yes/no): yes

🔄 Processing...

✅ Removed old admin: admin@transport.com

✅ Created admin: John Doe (john@yourcompany.com)
✅ Created admin: Jane Smith (jane@yourcompany.com)
✅ Created admin: Mike Johnson (mike@yourcompany.com)
✅ Created admin: Sarah Williams (sarah@yourcompany.com)

📊 Summary:
   - Removed: 1 old admin(s)
   - Created: 4 new admin(s)
   - Skipped: 0 (already exists)

✅ Total admin users: 4
   - John Doe (john@yourcompany.com)
   - Jane Smith (jane@yourcompany.com)
   - Mike Johnson (mike@yourcompany.com)
   - Sarah Williams (sarah@yourcompany.com)

🎉 Setup complete!

⚠️  IMPORTANT: Team members should change their passwords on first login!
```

---

### Step 3: Configure Email Notifications

Update your `.env` file with all admin emails (comma-separated):

```env
# Admin Emails - All team members will receive notifications
ADMIN_EMAILS=john@yourcompany.com,jane@yourcompany.com,mike@yourcompany.com,sarah@yourcompany.com
```

**Important:** Replace with your actual team email addresses!

---

### Step 4: Test Admin Logins

Each team member should:

1. **Navigate to:** `http://localhost:3000/auth/admin/login`

2. **Login with temporary credentials:**
   - Email: Their assigned email
   - Password: `ChangeMe123!` (or whatever you set)

3. **Change password immediately:**
   - Go to profile/settings
   - Update to a secure password

4. **Verify access:**
   - Check dashboard access
   - Verify all admin features work
   - Test data visibility

---

### Step 5: Test Email Notifications

**When a customer creates a booking, ALL 4 admins should receive an email.**

To test:

1. Create a test booking (as a regular user)
2. Check that all 4 admin email addresses receive the booking notification
3. Verify email content is correct

**What admins will receive:**
- ✅ New booking notifications
- ✅ Booking cancellations
- ✅ Schedule changes (if configured)
- ✅ System alerts

---

## 🔐 Security Best Practices

### For Each Team Member:

1. **Change Password Immediately**
   - Never use the default `ChangeMe123!` password
   - Use a strong, unique password
   - Consider using a password manager

2. **Enable 2FA** (if implemented in future)

3. **Secure Email Access**
   - Use strong email passwords
   - Enable 2FA on email accounts
   - Don't share email credentials

4. **Regular Security Updates**
   - Update passwords periodically
   - Review access logs
   - Report suspicious activity

---

## 📧 Email Notification System

### How It Works:

When a new booking is created:
```
1. Customer creates booking
2. System saves booking to database
3. System queries all users with role='admin' and isActive=true
4. System sends email to EACH admin individually
5. Each admin receives notification in their inbox
```

### Email Types Each Admin Receives:

| Event | Email Type | Content |
|-------|-----------|---------|
| New Booking | Booking Alert | Customer details, route, seats, amount |
| Booking Cancelled | Cancellation Notice | Booking reference, customer, refund info |
| Schedule Changed | Schedule Update | New times, affected passengers |
| Password Reset | Reset Request | When admin requests password reset |

---

## 🔧 Troubleshooting

### Issue: Script shows "Admin already exists"

**Solution:** The admin email is already in the database. The script will skip it. To replace:
1. Manually delete from database, OR
2. Change the email in the script to a different one

### Issue: Old admin not removed

**Solution:** Check if the old admin email matches exactly. The script removes:
- `admin@transport.com`
- `admin@triply.com`

If your old admin has a different email, add it to the `OLD_ADMIN_EMAILS` array in the script.

### Issue: Admins not receiving emails

**Possible causes:**
1. `.env` file not updated with `ADMIN_EMAILS`
2. Email credentials not configured
3. Admin users marked as `isActive: false`
4. Email addresses have typos

**Check:**
```javascript
// In MongoDB or using a script:
db.users.find({ role: 'admin', isActive: true })
```

### Issue: Only one admin receives emails

**Solution:** Make sure you're using `ADMIN_EMAILS` (plural) in `.env`, not `ADMIN_EMAIL` (singular):
```env
# ✅ Correct - Multiple admins
ADMIN_EMAILS=admin1@company.com,admin2@company.com,admin3@company.com

# ❌ Wrong - Only one admin
ADMIN_EMAIL=admin1@company.com
```

---

## 📊 Database Structure

### Admin User Document:
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@yourcompany.com",
  phone: "+911234567891",
  password: "hashed_password",
  role: "admin",                    // ← Must be 'admin'
  isActive: true,                   // ← Must be true
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🎯 Quick Reference

### Login URLs:
- **Admin Login:** `http://localhost:3000/auth/admin/login`
- **Admin Dashboard:** `http://localhost:3000/admin/dashboard`
- **User Login:** `http://localhost:3000/auth/user/login`

### Default Credentials (Change After First Login):
- **Email:** Your assigned email from setup script
- **Password:** `ChangeMe123!` (or custom password you set)

### Important Files:
- **Setup Script:** `scripts/setup-team-admins.js`
- **Email Service:** `src/utils/emailService.js`
- **Email Config:** `src/config/email.js`
- **User Model:** `src/models/User.js`
- **Environment:** `.env`

---

## 📝 Next Steps After Setup

1. ✅ All 4 admins can login
2. ✅ All admins changed their passwords
3. ✅ Email notifications configured in `.env`
4. ✅ Test booking created and all admins received email
5. ✅ Team members familiar with admin dashboard

### Optional Enhancements:

- **Add Admin Management Page:** Allow admins to add/remove other admins via UI
- **Role-Based Permissions:** Different admin levels (super admin, regular admin)
- **Activity Logging:** Track which admin performed which action
- **Email Preferences:** Let admins opt-in/out of specific notification types
- **Slack/SMS Integration:** Send notifications via Slack or SMS in addition to email

---

## 📞 Support

If you encounter issues:
1. Check this guide for solutions
2. Review `docs/EMAIL-SETUP.md` for email configuration
3. Check MongoDB for user data: `db.users.find({ role: 'admin' })`
4. Review console logs for error messages
5. Verify `.env` file has correct email configuration

---

## ✨ Summary

**What Changed:**
- ❌ Old single admin account (`admin@transport.com`) - REMOVED
- ✅ 4 new team admin accounts - CREATED
- ✅ Email system updated to send to ALL admins
- ✅ Same admin dashboard access for all
- ✅ All historical data preserved and accessible

**What Stayed the Same:**
- Admin dashboard functionality
- User experience
- Booking system
- Database structure
- All existing features

**What Improved:**
- Team collaboration - all admins get notified
- Better accountability - each admin has their own account
- No single point of failure
- Individual password security

---

**Created:** November 22, 2025  
**Status:** ✅ Ready to Deploy
