# Quick Deployment Guide for Render

This guide will get your app online in about 10 minutes!

## Step 1: Push to GitHub

If you haven't already:
```bash
cd /Users/ramezhamade/long-distance-app
git add .
git commit -m "Prepare for deployment"
git push
```

If you don't have a GitHub repo yet:
1. Go to [github.com](https://github.com) and create a new repository
2. Follow the instructions to push your code

## Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your repository
4. Configure the backend:
   - **Name**: `long-distance-backend` (or any name you like)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **"Create Web Service"**
6. Wait for deployment (2-3 minutes)
7. **Copy your backend URL** (looks like: `https://long-distance-backend.onrender.com`)

## Step 3: Deploy Frontend on Render

1. In Render, click **"New +"** → **"Static Site"**
2. Select the same GitHub repository
3. Configure the frontend:
   - **Name**: `long-distance-love` (or any name you like)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Add Environment Variable**:
   - Click **"Advanced"** or **"Environment"**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (your backend URL from Step 2 + `/api`)
   - Example: `https://long-distance-backend.onrender.com/api`
5. Click **"Create Static Site"**
6. Wait for deployment (2-3 minutes)
7. **Copy your frontend URL** (looks like: `https://long-distance-love.onrender.com`)

## Step 4: Share with Your Girlfriend!

Send her the frontend URL and the login credentials:
- **URL**: Your frontend URL from Step 3
- **Username**: `kingramez`
- **Password**: `takemewheneveryouneed`

Both of you can use the same credentials to log in and share the same data!

## Important Notes

- **Free tier limitations**:
  - Apps may sleep after 15 minutes of inactivity
  - First load after sleeping takes 30-60 seconds
  - Data in `data.json` may reset occasionally

- **For better reliability**:
  - Upgrade to paid tier ($7/month) for always-on service
  - Or add a database (MongoDB Atlas has a free tier)

- **Update backend URL later**:
  - Go to your frontend service on Render
  - Navigate to "Environment" tab
  - Update `VITE_API_URL` and redeploy

## Troubleshooting

**App not loading?**
- Wait 60 seconds on first load (free tier wakes up from sleep)
- Check that backend is running on Render dashboard

**Can't log in?**
- Make sure you're using the correct credentials from [backend/server.js](backend/server.js:11-12)
- Check browser console for errors

**Changes not showing?**
- Render auto-deploys on git push
- Or manually redeploy from Render dashboard

## Your URLs

After deployment, write them here:

- **Frontend**: ___________________________
- **Backend**: ___________________________
- **Username**: kingramez
- **Password**: takemewheneveryouneed

---

Made with love! ❤️
