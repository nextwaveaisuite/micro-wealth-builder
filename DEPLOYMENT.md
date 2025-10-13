# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Step 1: Upload to GitHub

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Name it `micro-wealth-builder`
   - Make it Public or Private (your choice)
   - **Do NOT** initialize with README (we already have one)

2. **Upload your code**
   - Extract the zip file to a folder on your computer
   - Open terminal/command prompt in that folder
   - Run these commands:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Micro Wealth Builder"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/micro-wealth-builder.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Click "Sign Up" and use your GitHub account
   - Authorize Vercel to access your GitHub

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your `micro-wealth-builder` repository
   - Click "Import"

3. **Configure Build Settings** (Auto-detected)
   - Framework Preset: **Vite**
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
   
   ✅ These should be auto-detected from `vercel.json`

4. **Add Environment Variables** (Optional - only if using Supabase)
   - Click "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` → Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` → Your Supabase anon key
   
   ⚠️ Skip this step if you're not using Supabase yet

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - 🎉 Your app is live!

### Step 3: Access Your App

- Vercel will give you a URL like: `https://micro-wealth-builder.vercel.app`
- Share this URL with anyone
- It works on all devices (phone, tablet, desktop)

---

## 📱 Add to Phone Home Screen (Optional)

### iPhone (iOS)
1. Open the Vercel URL in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name it "Wealth Builder"
5. Tap "Add"

### Android
1. Open the Vercel URL in Chrome
2. Tap the three dots menu
3. Tap "Add to Home Screen"
4. Name it "Wealth Builder"
5. Tap "Add"

Now it works like a native app! 📲

---

## 🔄 Update Your App

Whenever you make changes:

1. **Commit changes to GitHub**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. **Vercel auto-deploys**
   - Vercel automatically detects the push
   - Rebuilds and deploys in 1-2 minutes
   - Your live site updates automatically

---

## 🗄️ Optional: Add Supabase (User Accounts)

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Click "New Project"
5. Choose organization and name it `micro-wealth-builder`
6. Set a strong database password (save it!)
7. Choose region closest to you
8. Click "Create new project"

### 2. Get Your Credentials

1. In Supabase dashboard, click "Settings" (gear icon)
2. Click "API"
3. Copy:
   - **Project URL** (under "Project URL")
   - **anon public key** (under "Project API keys")

### 3. Add to Vercel

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add:
   - Name: `VITE_SUPABASE_URL`, Value: (paste your Project URL)
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: (paste your anon key)
5. Click "Save"
6. Go to "Deployments" tab
7. Click "..." on latest deployment → "Redeploy"

### 4. Create Database Tables

1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Copy and paste the SQL from `README.md` (under "Create Database Tables")
4. Click "Run"

✅ Now your app has user accounts and data persistence!

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Problem:** Build fails with "command not found: pnpm"

**Solution:** 
1. Go to Vercel project settings
2. Change Install Command to: `npm install`
3. Change Build Command to: `npm run build`
4. Redeploy

### App Shows Blank Page

**Problem:** White screen after deployment

**Solution:**
1. Check Vercel deployment logs for errors
2. Make sure `dist` folder is set as Output Directory
3. Check browser console (F12) for JavaScript errors

### Environment Variables Not Working

**Problem:** Supabase connection fails

**Solution:**
1. Make sure variable names start with `VITE_`
2. Redeploy after adding environment variables
3. Check that values don't have quotes or extra spaces

---

## 📊 Monitor Your App

### Vercel Analytics (Free)

1. Go to your Vercel project
2. Click "Analytics" tab
3. See visitor stats, page views, performance

### Supabase Dashboard

1. Go to Supabase project
2. Click "Table Editor" to see user data
3. Click "Authentication" to see user accounts

---

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test on your phone
3. ✅ Share with friends
4. 📈 Add Supabase when you need user accounts
5. 🎨 Customize colors and branding
6. 📱 Consider building native app later (optional)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create an issue in your repo

**Built with ❤️ for micro-investors**

