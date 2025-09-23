# Scripts Directory

This directory contains various utility and maintenance scripts for the Public Transport Management Backend.

## Directory Structure

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
Database-related scripts (currently empty, ready for future database utilities)

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

## Notes

- Make sure to have your `.env` file configured with the correct `MONGO_URI`
- Some scripts may modify database data, use with caution in production
- Always backup your database before running migration scripts