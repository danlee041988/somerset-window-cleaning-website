#!/bin/bash

# Persistent Dev Server Script
# Automatically restarts Astro dev server if it crashes

echo "🚀 Starting persistent Astro dev server..."
echo "Press Ctrl+C to stop"
echo "----------------------------------------"

while true; do
    echo -e "\n📦 Starting Astro dev server..."
    npm run dev
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\n✅ Dev server stopped normally"
    else
        echo -e "\n❌ Dev server crashed with exit code $EXIT_CODE"
    fi
    
    echo -e "\n🔄 Restarting in 2 seconds..."
    sleep 2
done