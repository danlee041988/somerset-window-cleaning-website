#!/bin/bash

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
echo "Enter your GitHub username:"
read GITHUB_USERNAME

# Add remote origin
git remote add origin https://github.com/$GITHUB_USERNAME/somerset-window-cleaning-website-v3.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "Repository pushed to GitHub!"
echo "Now you can:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Set the environment variables from .env.example"
echo "4. Deploy!"