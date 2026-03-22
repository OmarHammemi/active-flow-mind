#!/bin/bash

# Script to completely restart the dev server with new config

echo "🛑 Stopping all processes on port 3006..."

# Kill all processes on port 3006
sudo kill -9 $(sudo lsof -ti :3006) 2>/dev/null || true

# Kill any PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Kill any remaining vite/node processes for this project
pkill -f "vite.*active-flow-mind" 2>/dev/null || true

# Wait a moment
sleep 2

echo "🧹 Clearing Vite cache..."
cd /home/omar/Habit/active-flow-mind
rm -rf node_modules/.vite
rm -rf dist

echo "✅ Port 3006 should be free now"
echo "📊 Checking port status:"
sudo lsof -i :3006 || echo "   Port 3006 is free ✅"

echo ""
echo "🚀 Starting dev server..."
echo "   Run: npm run dev"
echo ""
echo "⚠️  IMPORTANT: After starting, wait 5 seconds then visit: https://falah.live"
