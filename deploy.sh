#!/bin/bash

# Panopto Caption Extractor Deployment Script
# This script helps you deploy to various platforms

echo "🚀 Panopto Caption Extractor Deployment Helper"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Panopto Caption Extractor"
fi

echo ""
echo "Choose your deployment method:"
echo "1. Cloudflare Pages (Recommended)"
echo "2. Netlify"
echo "3. GitHub Pages"
echo "4. Just push to Git (manual deployment)"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Cloudflare Pages Deployment:"
        echo "1. Go to https://dash.cloudflare.com"
        echo "2. Navigate to Workers & Pages → Create application → Pages → Connect to Git"
        echo "3. Select this repository"
        echo "4. Build settings:"
        echo "   - Framework preset: None (Static HTML)"
        echo "   - Build command: echo 'No build required'"
        echo "   - Build output directory: / (root)"
        echo "5. Deploy!"
        echo ""
        echo "Your tool will be available at: https://your-project-name.pages.dev"
        ;;
    2)
        echo ""
        echo "🌐 Netlify Deployment:"
        echo "1. Go to https://app.netlify.com"
        echo "2. Click 'New site from Git'"
        echo "3. Connect your repository"
        echo "4. Build settings:"
        echo "   - Build command: echo 'No build required'"
        echo "   - Publish directory: / (root)"
        echo "5. Deploy!"
        ;;
    3)
        echo ""
        echo "🌐 GitHub Pages Deployment:"
        echo "1. Push this repository to GitHub"
        echo "2. Go to repository Settings → Pages"
        echo "3. Source: Deploy from a branch"
        echo "4. Branch: main, folder: / (root)"
        echo "5. Save!"
        echo ""
        echo "Your tool will be available at: https://yourusername.github.io/panopto-caption-proxy"
        ;;
    4)
        echo ""
        echo "📤 Git Push:"
        echo "Pushing to remote repository..."
        read -p "Enter your GitHub repository URL: " repo_url
        git remote add origin $repo_url
        git branch -M main
        git push -u origin main
        echo "✅ Pushed to repository!"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment instructions complete!"
echo "📝 Don't forget to test your deployed tool with a real Panopto video!"
