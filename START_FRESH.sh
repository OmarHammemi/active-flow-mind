#!/bin/bash

# Script to start dev server with new config

cd /home/omar/Habit/active-flow-mind

echo "🚀 Starting dev server with new config..."
echo ""
echo "⚠️  Make sure PM2 is stopped:"
echo "   pm2 stop all"
echo "   pm2 delete all"
echo ""
echo "✅ Starting with: npm run dev"
echo ""
echo "📋 After it starts:"
echo "   1. Wait 5 seconds"
echo "   2. Visit: https://falah.live"
echo "   3. The 'Blocked request' error should be GONE! ✅"
echo ""

npm run dev
