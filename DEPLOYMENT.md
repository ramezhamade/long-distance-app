# Deployment Guide - Our Long Distance Love App

Your app now has authentication and is ready to be deployed so you and your girlfriend can access it from anywhere!

## 🔒 Security Setup

### Change Your Credentials

**IMPORTANT**: Before deploying, change the default credentials!

1. Open [backend/server.js](backend/server.js)
2. Find lines 10-11:
   ```javascript
   const AUTH_USERNAME = 'couple';
   const AUTH_PASSWORD = 'ourLove2024';
   ```
3. Change these to your own secure credentials:
   ```javascript
   const AUTH_USERNAME = 'your-username';
   const AUTH_PASSWORD = 'your-secure-password';
   ```

## 🚀 Deployment Options

### Option 1: Render (Recommended - Free & Easy)

**Deploy Backend:**

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or upload manually)
4. Configure:
   - **Name**: long-distance-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Copy your backend URL (e.g., `https://long-distance-backend.onrender.com`)

**Deploy Frontend:**

1. In Render, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: long-distance-frontend
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: Your backend URL from above
5. Update [frontend/src/App.jsx](frontend/src/App.jsx) line 9:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
   ```
6. Click "Create Static Site"
7. Copy your frontend URL (e.g., `https://long-distance-love.onrender.com`)

### Option 2: Railway.app

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Deploy both backend and frontend similarly to Render
4. Railway provides a free tier with $5 credit/month

### Option 3: Vercel + Railway

**Backend on Railway** (follow Option 2)

**Frontend on Vercel:**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     - `VITE_API_URL`: Your Railway backend URL
5. Click "Deploy"

## 📱 Using Your Deployed App

1. **Share the URL** with your girlfriend
2. **Both of you use the same credentials** to log in
3. **Your data is saved** on the backend server

## 💾 Data Persistence

Your data is stored in [backend/data.json](backend/data.json). On free hosting:
- **Render**: Files persist but may reset after inactivity
- **Railway**: Similar to Render
- **For permanent storage**: Consider adding a database (MongoDB Atlas free tier)

## 🔐 Make It More Secure (Optional)

### Add Environment Variables

Instead of hardcoding credentials in [server.js](backend/server.js):

1. Create `.env` file in backend:
   ```
   AUTH_USERNAME=your-username
   AUTH_PASSWORD=your-password
   PORT=5001
   ```

2. Install dotenv:
   ```bash
   cd backend
   npm install dotenv
   ```

3. Update [server.js](backend/server.js):
   ```javascript
   require('dotenv').config();

   const AUTH_USERNAME = process.env.AUTH_USERNAME || 'couple';
   const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'ourLove2024';
   const PORT = process.env.PORT || 5001;
   ```

4. Add environment variables in your hosting service

## 🌐 Custom Domain (Optional)

Both Render and Vercel allow custom domains:
1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In your hosting dashboard, add custom domain
3. Update DNS records as instructed

## 📝 Quick Deployment Checklist

- [ ] Change default credentials in [backend/server.js](backend/server.js)
- [ ] Push code to GitHub
- [ ] Deploy backend to Render/Railway
- [ ] Update API_URL in [frontend/src/App.jsx](frontend/src/App.jsx)
- [ ] Deploy frontend to Render/Vercel
- [ ] Test login with new credentials
- [ ] Share URL with your girlfriend
- [ ] Both log in and enjoy!

## 🆘 Troubleshooting

**"Failed to connect to server"**
- Check if backend URL is correct in [frontend/src/App.jsx](frontend/src/App.jsx)
- Ensure backend is deployed and running

**"Invalid credentials"**
- Make sure both of you use the same username/password
- Check that credentials match in [backend/server.js](backend/server.js)

**Data not saving**
- Free hosting may reset files after inactivity
- Consider upgrading to paid tier or adding a database

## 💡 Next Steps

1. Deploy and test
2. Share credentials with your girlfriend (use a secure method!)
3. Start adding your special dates!
4. Consider adding a database for permanent storage
5. Maybe add features like photo uploads or chat

---

Made with love for long-distance relationships ❤️
