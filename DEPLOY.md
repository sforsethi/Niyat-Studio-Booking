# Deployment Guide - Niyat Studio Booking System

## 🚀 Deploy to Vercel (Frontend)

### Option 1: Automatic GitHub Deployment (Recommended)

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. **Import Repository**: Click "New Project" → "Import Git Repository"
3. **Select Repository**: Choose `sforsethi/Niyat-Studio-Booking`
4. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **frontend** (IMPORTANT!)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Environment Variables** (Add in Vercel dashboard):
   ```
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_demo_key_id
   REACT_APP_API_URL=http://localhost:5001
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   REACT_APP_GOOGLE_API_KEY=your_google_api_key_here
   ```

6. **Deploy**: Click "Deploy" - Your site will be live in 2-3 minutes!

### Option 2: Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: niyat-studio-booking
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

## 🚂 Deploy Backend to Railway

1. **Visit Railway**: Go to [railway.app](https://railway.app) and sign up/login
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose `sforsethi/Niyat-Studio-Booking`
4. **Configure**:
   - Root Directory: **backend**
   - Start Command: `npm start`

5. **Environment Variables** (Add in Railway dashboard):
   ```
   RAZORPAY_KEY_ID=your_real_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_real_razorpay_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_PROJECT_ID=your_project_id
   PORT=5001
   ```

6. **Domain**: Railway will provide a URL like `https://your-app.railway.app`

## 🔗 Connect Frontend to Backend

After backend deployment:

1. **Update Frontend Environment**: In Vercel dashboard, update:
   ```
   REACT_APP_API_URL=https://your-actual-backend.railway.app
   ```

2. **Redeploy Frontend**: Vercel will auto-redeploy with new environment variables

## 🔑 Get Real API Keys

### Razorpay Setup
1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Navigate to Settings → API Keys
3. Generate Test/Live keys
4. Replace demo keys in environment variables

### Google Calendar API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Calendar API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Use the client ID and API key in environment variables

## 🌐 Custom Domain (Optional)

### Vercel Custom Domain
1. In Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., `booking.niyatstudio.com`)
3. Configure DNS records as shown

## ✅ Final Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Real Razorpay keys added
- [ ] Google Calendar API configured
- [ ] Frontend connected to backend
- [ ] Test complete booking flow
- [ ] Custom domain configured (optional)

## 🎯 Your Live URLs

- **Frontend**: `https://niyat-studio-booking.vercel.app`
- **Backend**: `https://your-backend.railway.app`

## 📞 Support

If you encounter issues:
1. Check Vercel/Railway deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check browser console for errors

Your studio booking system is now live and ready for customers! 🎉