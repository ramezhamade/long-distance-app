# MongoDB Atlas Setup for Free Persistent Data

## Problem
Render's filesystem is ephemeral - any data written to files is lost when the service restarts or redeploys. Render Disks (persistent storage) require a paid plan.

## Solution: MongoDB Atlas (Free Forever)

MongoDB Atlas provides 512MB of free cloud database storage that persists permanently. This is the perfect free solution for storing game scores, events, and app data.

---

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

---

## Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (512 MB storage, shared CPU)
3. Select a cloud provider and region (choose one close to your Render server location)
   - Recommended: AWS / us-east-1 (if your Render app is in the US)
4. Name your cluster (e.g., `lamez-hub`)
5. Click **"Create Cluster"**

---

## Step 3: Create Database User

1. In the "Security Quickstart" screen, create a database user:
   - **Username**: Choose a username (e.g., `lamez-admin`)
   - **Password**: Generate a strong password (save this!)
   - Click **"Create User"**

2. **IMPORTANT**: Copy and save the username and password - you'll need them for the connection string

---

## Step 4: Configure Network Access

1. In the "Network Access" section:
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - Click **"Confirm"**

   > **Note**: This allows connections from any IP address, which is necessary for Render's dynamic IPs. Your database is still protected by username/password authentication.

---

## Step 5: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Driver: Node.js"** and **"Version: 5.5 or later"**
4. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. The final string should look like:
   ```
   mongodb+srv://lamez-admin:YourPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Step 6: Set Environment Variable in Render

1. Go to your Render dashboard
2. Navigate to your **backend web service**
3. Click on the **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key**: `MONGODB_URI`
   - **Value**: Paste your full MongoDB connection string from Step 5
6. Click **"Save Changes"**

---

## Step 7: Deploy

Render will automatically redeploy your service with the MongoDB connection. After deployment:

- All data will be saved to MongoDB Atlas
- Data persists permanently across deployments and restarts
- Scores, events, and game progress will be preserved forever
- 512MB is more than enough for years of gameplay data

---

## Verification

Check your Render service logs after deployment. You should see:

```
[timestamp] Connecting to MongoDB...
[timestamp] Connected to MongoDB successfully
[timestamp] Data loaded from MongoDB
```

or if starting fresh:

```
[timestamp] Connecting to MongoDB...
[timestamp] Connected to MongoDB successfully
[timestamp] No data found, creating default data
[timestamp] Default data created in MongoDB
```

---

## Migrating Existing Data

If you have existing data in a `data.json` file that you want to import to MongoDB:

1. Download your existing `data.json` file
2. On your local machine, set the `MONGODB_URI` environment variable:
   ```bash
   export MONGODB_URI="mongodb+srv://..."
   ```
3. Run the migration script:
   ```bash
   cd backend
   node migrate.js /path/to/data.json
   ```

The migration script will:
- Import all your existing data to MongoDB
- Create a backup of your original data.json
- Preserve all events, game scores, and statistics

---

## Local Development

For local development, you can either:

1. **Use the cloud MongoDB** (recommended):
   - Set `MONGODB_URI` in your local environment
   - Your local app will connect to the cloud database

2. **Use local MongoDB** (advanced):
   - Install MongoDB locally
   - Leave `MONGODB_URI` unset (will default to `mongodb://localhost:27017`)

---

## Benefits of MongoDB Atlas Free Tier

✅ **Free forever** - No credit card required
✅ **512 MB storage** - Enough for years of data
✅ **Automatic backups** - Built-in data protection
✅ **High availability** - 99.9% uptime SLA
✅ **Global accessibility** - Access from anywhere
✅ **No maintenance** - Fully managed by MongoDB

---

## Troubleshooting

### Connection Errors

If you see connection errors in Render logs:

1. **Check your connection string**:
   - Ensure username and password are correct
   - Make sure there are no extra spaces
   - Password should be URL-encoded (special characters like `@`, `#`, `:` need encoding)

2. **Check network access**:
   - In MongoDB Atlas, verify "Network Access" includes `0.0.0.0/0`

3. **Check cluster status**:
   - In MongoDB Atlas dashboard, ensure cluster status is "Active"

### Data Not Persisting

If data resets after deployment:

1. Check Render logs for MongoDB connection errors
2. Verify `MONGODB_URI` is set correctly in Render environment variables
3. Ensure your MongoDB Atlas cluster is running (not paused)

---

## Current Setup

- **Local Development**: MongoDB (cloud or local)
- **Render Production**: MongoDB Atlas (free tier)
- **Data Persistence**: ✅ Permanent (free forever)

---

## Support

- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- Render Documentation: [https://render.com/docs](https://render.com/docs)
