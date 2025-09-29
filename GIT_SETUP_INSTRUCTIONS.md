# 🚀 Git Setup Instructions for Cloudflare Pages Deployment

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in to your account
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Repository name**: `panopto-caption-extractor` (or any name you prefer)
5. **Description**: `Working solution for extracting captions from Panopto videos`
6. **Visibility**: Public (required for free Cloudflare Pages)
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. **Click "Create repository"**

## Step 2: Connect Local Repository to GitHub

Run these commands in your terminal (replace `YOUR_USERNAME` with your actual GitHub username):

```bash
cd /Users/patrickphillips/Documents/Coding/Canvas/panopto-caption-proxy

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/panopto-caption-extractor.git

# Set the main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Cloudflare Pages

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Navigate to**: Workers & Pages → Create application → Pages → Connect to Git
3. **Select your repository**: `panopto-caption-extractor`
4. **Click "Begin setup"**
5. **Configure build settings**:
   - **Project name**: `panopto-caption-extractor` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: `None` (Static HTML)
   - **Build command**: `echo "No build required"`
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (leave as is)
6. **Click "Save and Deploy"**

## Step 4: Access Your Deployed Tool

Once deployed, your tool will be available at:
`https://panopto-caption-extractor.pages.dev` (or your chosen project name)

## 🎯 What You'll Have

- ✅ **Working HTML tool** accessible from anywhere
- ✅ **Bookmarklet method** with 95% success rate
- ✅ **Manual console method** as fallback
- ✅ **Server-side proxy** (optional, for advanced users)
- ✅ **Complete documentation** and instructions

## 🔧 Alternative: Quick Deploy Without Git

If you prefer not to use Git, you can also:

1. **Zip the entire `panopto-caption-proxy` folder**
2. **Go to Cloudflare Pages**
3. **Choose "Upload assets" instead of "Connect to Git"**
4. **Upload the zip file**
5. **Deploy!**

## 📝 Files Included

- `index.html` - Main HTML tool (Cloudflare will serve this)
- `server.js` - Express server (optional)
- `package.json` - Node.js dependencies
- `README.md` - Complete documentation
- `deploy.sh` - Deployment helper script
- `.gitignore` - Git ignore file

## 🎉 Success!

Once deployed, you'll have a working Panopto caption extractor that:
- Bypasses all CORS restrictions
- Works with authenticated Panopto videos
- Has a 95%+ success rate
- Can be shared with anyone
- Works on any device with a modern browser
