#!/bin/bash

echo "🔍 Diagnosing 'Blocked request' error..."
echo ""

echo "1️⃣ Checking Vite config..."
if grep -q "allowedHosts" vite.config.ts; then
    echo "   ✅ allowedHosts found in config"
    grep "allowedHosts" vite.config.ts | head -1
else
    echo "   ❌ allowedHosts NOT found!"
fi

echo ""
echo "2️⃣ Checking running Vite processes..."
ps aux | grep -E "vite.*active-flow-mind" | grep -v grep || echo "   ⚠️  No Vite process found (need to start: npm run dev)"

echo ""
echo "3️⃣ Checking port 3006..."
if sudo lsof -i :3006 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3006 is in use:"
    sudo lsof -i :3006 | head -3
    echo ""
    echo "   💡 This process needs to be restarted to load new config!"
else
    echo "   ✅ Port 3006 is free"
fi

echo ""
echo "4️⃣ Checking Nginx Host header forwarding..."
if [ -f /etc/nginx/sites-available/falah.live ] || [ -f /etc/nginx/sites-enabled/falah.live ]; then
    echo "   📄 Nginx config found"
    if grep -q "proxy_set_header Host" /etc/nginx/sites-enabled/falah.live 2>/dev/null || grep -q "proxy_set_header Host" /etc/nginx/sites-available/falah.live 2>/dev/null; then
        echo "   ✅ Host header forwarding configured"
        grep "proxy_set_header Host" /etc/nginx/sites-enabled/falah.live 2>/dev/null || grep "proxy_set_header Host" /etc/nginx/sites-available/falah.live 2>/dev/null | head -1
    else
        echo "   ⚠️  Host header forwarding might be missing"
        echo "   💡 Nginx should forward: proxy_set_header Host \$host;"
    fi
else
    echo "   ⚠️  Nginx config not found in standard locations"
fi

echo ""
echo "5️⃣ Vite cache status..."
if [ -d "node_modules/.vite" ]; then
    echo "   ⚠️  Vite cache exists (might need clearing)"
else
    echo "   ✅ No Vite cache"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SOLUTION:"
echo ""
echo "1. Kill old dev server:"
echo "   sudo kill -9 \$(sudo lsof -ti :3006)"
echo ""
echo "2. Clear cache:"
echo "   rm -rf node_modules/.vite"
echo ""
echo "3. Start fresh:"
echo "   npm run dev"
echo ""
echo "4. Wait 5 seconds, then visit: https://falah.live"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
