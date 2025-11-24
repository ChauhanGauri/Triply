# Quick Start: Multi-Admin Setup

## 🎯 What You Need to Do

### 1. Edit Team Member Details (2 minutes)

Open: `scripts/setup-team-admins.js`

**Replace lines 12-31 with your team's actual details:**

```javascript
const TEAM_ADMINS = [
  {
    name: 'Your Name',
    email: 'your.email@gmail.com',        // ← YOUR ACTUAL EMAILS
    phone: '+919876543210',
    password: 'TempPass123!'              // ← They'll change this later
  },
  {
    name: 'Team Member 2',
    email: 'member2.email@gmail.com',
    phone: '+919876543211',
    password: 'TempPass123!'
  },
  {
    name: 'Team Member 3',
    email: 'member3.email@gmail.com',
    phone: '+919876543212',
    password: 'TempPass123!'
  },
  {
    name: 'Team Member 4',
    email: 'member4.email@gmail.com',
    phone: '+919876543213',
    password: 'TempPass123!'
  }
];
```

---

### 2. Run Setup Script (1 minute)

```powershell
node scripts/setup-team-admins.js
```

Type `yes` when prompted.

This will:
- ✅ Remove old admin@transport.com
- ✅ Create 4 new admin accounts
- ✅ Give you a summary

---

### 3. Update .env File (1 minute)

Add this line to your `.env` file with YOUR actual emails:

```env
ADMIN_EMAILS=your.email@gmail.com,member2.email@gmail.com,member3.email@gmail.com,member4.email@gmail.com
```

**Important:** No spaces after commas!

---

### 4. Test Login (1 minute per person)

Each team member:

1. Go to: `http://localhost:3000/auth/admin/login`
2. Login with:
   - Email: The email you set in the script
   - Password: `TempPass123!` (or whatever you chose)
3. Access admin dashboard
4. **Change password immediately!**

---

### 5. Test Email Notifications (2 minutes)

1. Create a test booking (as a regular user)
2. **ALL 4 ADMINS** should receive an email notification
3. Check each admin's inbox

---

## ✅ That's It!

Now all 4 team members:
- ✅ Can login with their own email
- ✅ Have full admin access
- ✅ See all the same data
- ✅ Receive email notifications for new bookings

---

## 🆘 Quick Troubleshooting

**Login not working?**
- Check email spelling in setup script
- Make sure MongoDB is running
- Re-run the setup script

**Not receiving emails?**
- Check `.env` has `ADMIN_EMAILS` (with S)
- Verify email addresses are comma-separated, no spaces
- Check email credentials in `.env` are correct

**Can't see admin data?**
- All admins see the SAME data (shared dashboard)
- No need to transfer anything
- All bookings, routes, schedules are accessible to all admins

---

## 📚 Full Documentation

For complete details, troubleshooting, and advanced setup:
- **Full Guide:** `docs/MULTI-ADMIN-SETUP.md`
- **Email Setup:** `docs/EMAIL-SETUP.md`

---

**Total Setup Time:** ~10 minutes  
**Difficulty:** Easy ⭐
