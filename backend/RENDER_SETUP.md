# Render Deployment Setup for Persistent Data

## Problem
By default, Render's filesystem is ephemeral - any data written to files is lost when the service restarts or redeploys. This means game scores, events, and other data stored in `data.json` gets reset on each deployment.

## Solution: Use Render Disks (Persistent Storage)

### Step 1: Create a Disk in Render Dashboard

1. Go to your Render dashboard
2. Navigate to your backend web service
3. Click on the "Disks" tab
4. Click "Add Disk"
5. Configure the disk:
   - **Name**: `data-storage`
   - **Mount Path**: `/data`
   - **Size**: 1 GB (minimum, adjust as needed)
6. Click "Create Disk"

### Step 2: Set Environment Variable

1. Still in your backend web service settings
2. Go to the "Environment" tab
3. Add a new environment variable:
   - **Key**: `DATA_DIR`
   - **Value**: `/data`
4. Save changes

### Step 3: Redeploy

Render will automatically redeploy your service with the new disk attached. After deployment:

- All data will be saved to `/data/data.json`
- Data persists across deployments and restarts
- Scores and events will be preserved

## Verification

Check your service logs after deployment. You should see:
```
[timestamp] Data loaded from /data/data.json
```
or
```
[timestamp] Data file not found, creating new one at /data/data.json
[timestamp] Data saved to /data/data.json
```

## Alternative: Use a Database

For production apps, consider migrating to a proper database:
- PostgreSQL (Render offers free tier)
- MongoDB Atlas (free tier available)
- Firebase Realtime Database

## Current Setup

- **Local Development**: Data stored in `backend/data.json`
- **Render (with disk)**: Data stored in `/data/data.json`
- **Render (without disk)**: Data resets on each deployment ⚠️

## Backup Recommendations

Since this is an important data file, consider:
1. Regular backups of the data file
2. Exporting scores/events periodically
3. Eventually migrating to a database for better reliability
