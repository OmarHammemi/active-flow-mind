#!/bin/bash
# Fix 403 Forbidden Error
# Run this on your server

set -e

echo "=========================================="
echo "Fixing 403 Forbidden Error"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

echo "Step 1: Checking if dev server is running on port 3006..."
if netstat -tlnp | grep -q ":3006 "; then
    echo "✅ Dev server is running on port 3006"
else
    echo "⚠️  Dev server is NOT running on port 3006"
    echo "   Make sure to run: npm run dev"
    echo ""
fi

echo ""
echo "Step 2: Checking Nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors:"
    nginx -t
    exit 1
fi

echo ""
echo "Step 3: Checking Nginx error log..."
echo "Recent errors:"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"

echo ""
echo "Step 4: Checking file permissions..."
# Find where the app is running from
APP_PATH=$(pwd)
echo "Current directory: $APP_PATH"

# Check if dist folder exists (for production)
if [ -d "dist" ]; then
    echo "✅ dist folder found"
    chown -R www-data:www-data dist/ 2>/dev/null || chown -R nginx:nginx dist/ 2>/dev/null
    chmod -R 755 dist/
    echo "✅ Fixed dist folder permissions"
fi

echo ""
echo "Step 5: Reloading Nginx..."
systemctl reload nginx
echo "✅ Nginx reloaded"

echo ""
echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Make sure dev server is running: npm run dev"
echo "2. Check Nginx error log: sudo tail -f /var/log/nginx/error.log"
echo "3. Visit: https://falah.live"
echo ""
