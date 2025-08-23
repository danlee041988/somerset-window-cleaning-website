#!/bin/bash
echo "🚀 Auto-deploying changes..."
git add .
if ! git diff --cached --quiet; then
  git commit -m "🔄 Auto-deploy: $(date '+%H:%M:%S') 

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
  git push origin main
  echo "✅ Changes pushed to production"
else
  echo "ℹ️  No changes to deploy"
fi