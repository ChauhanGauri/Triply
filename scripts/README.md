# Scripts Directory

This directory contains various utility and maintenance scripts for the Public Transport Management Backend.

## Directory Structure

### Root Level Scripts

#### Admin Management:
- `seed-admin.js` - Create initial admin user (legacy - single admin)
- `setup-team-admins.js` - Set up multiple admin users for team
- `view-admins.js` - View all current admin users in the system
- `set-individual-passwords.js` - Set different password for each admin

### `/debug/`
Scripts for debugging and data investigation:
- `check-all-schedules.js` - Check all schedules in database
- `check-raw-db.js` - Raw database inspection
- `debug-isactive.js` - Debug isActive field issues
- `debug-schedules.js` - Debug schedule-related issues
- `diagnose-bookings.js` - Diagnose booking data problems
- `investigate-data.js` - General data investigation
- `test-booking-query.js` - Test booking queries

### `/migration/`
Scripts for data migration and database fixes:
- `cleanup-schedules.js` - Clean up schedule data
- `direct-update-schedules.js` - Direct schedule updates
- `fix-orphaned-bookings.js` - Fix bookings with missing schedules
- `fix-schedules-migration.js` - Fix schedule migration issues
- `migrate-schedules.js` - Migrate schedule data

### `/utilities/`
General utility scripts:
- `create-test-user.js` - Create test users for development
- `sync-passenger-manifests.js` - Sync passenger manifest data
- `update-schedule-capacity.js` - Update schedule capacity

### `/database/`
Database maintenance scripts:
- `fix-database.js` - General database fixes
- `seed-schedules.js` - Seed schedule data
- `update-routes.js` - Update route information

## Quick Commands

### Admin Management

**Set up team of admins (RECOMMENDED):**
```bash
# 1. Edit scripts/setup-team-admins.js with your team details
# 2. Run the setup
node scripts/setup-team-admins.js
```

**View all admins:**
```bash
node scripts/view-admins.js
```

**Set individual passwords:**
```bash
node scripts/set-individual-passwords.js
```

**Create single admin (legacy):**
```bash
node scripts/seed-admin.js
```

### Debugging

**Check all schedules:**
```bash
node scripts/debug/check-all-schedules.js
```

**Diagnose bookings:**
```bash
node scripts/debug/diagnose-bookings.js
```

**Investigate data issues:**
```bash
node scripts/debug/investigate-data.js
```

### Database Maintenance

**Fix orphaned bookings:**
```bash
node scripts/migration/fix-orphaned-bookings.js
```

**Update schedule capacity:**
```bash
node scripts/utilities/update-schedule-capacity.js
```

## Usage

To run any script, use:
```bash
node scripts/[category]/[script-name].js
```

For example:
```bash
node scripts/debug/diagnose-bookings.js
node scripts/migration/fix-orphaned-bookings.js
node scripts/utilities/create-test-user.js
```

## Multi-Admin Setup Guide

For detailed instructions on setting up multiple admin users for your team:
- **Quick Start:** See `MULTI-ADMIN-QUICKSTART.md` in the root directory
- **Full Guide:** See `docs/MULTI-ADMIN-SETUP.md`

### Why Use Multi-Admin?

✅ Each team member has their own account  
✅ All admins receive email notifications  
✅ Better security (individual passwords)  
✅ Accountability (track who did what)  
✅ Same dashboard access for everyone  
✅ All historical data preserved

## Notes

- Make sure to have your `.env` file configured with the correct `MONGO_URI`
- Some scripts may modify database data, use with caution in production
- Always backup your database before running migration scripts
- For multi-admin setup, use `ADMIN_EMAILS` (plural) in `.env` file