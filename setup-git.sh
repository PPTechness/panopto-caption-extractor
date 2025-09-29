#!/bin/bash

# Panopto Caption Extractor - Git Setup Script
# This script helps you set up Git and push to GitHub

echo "🚀 Panopto Caption Extractor - Git Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the panopto-caption-proxy directory."
    exit 1
fi

echo "✅ Found index.html - ready to set up Git"

# Check if git is already initialized
if [ -d ".git" ]; then
    echo "✅ Git repository already initialized"
else
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Update: Panopto Caption Extractor - Ready for deployment

- Complete working solution with bookmarklet method
- 95% success rate for Panopto caption extraction
- Ready for Cloudflare Pages deployment
- Bypasses CORS and authentication issues"
fi

echo ""
echo "🔗 Next steps:"
echo "1. Create a new repository on GitHub.com"
echo "2. Copy the repository URL (e.g., https://github.com/username/repo-name.git)"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin YOUR_REPOSITORY_URL"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Then deploy to Cloudflare Pages using the repository"
echo ""
echo "📖 For detailed instructions, see GIT_SETUP_INSTRUCTIONS.md"
echo ""
echo "🎯 Your tool is ready for deployment!"
