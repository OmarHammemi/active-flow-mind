#!/bin/bash
# Diagnose 403 Forbidden Error
# Run this on your server to find the problem

echo "=========================================="
echo "Diagnosing 403 Forbidden Error"
echo "=========================================="
echo ""

# Check 1: Is dev server running?
echo "1. Checking if dev server is running on port 3006..."
if netstat -tlnp 2>/dev/null | grep -q ":3006 " || ss -tlnp 2>/dev/null | grep -q ":3006 "; then
    echo "   ✅ Dev server IS running on port 3006"
    PID=$(netstat -tlnp 2>/dev/null | grep ":3006 " | awk '{print $7}' | cut -d'/' -f1 | head -1)
    if [ -n "$PID" ]; then
        echo "   Process ID: $PID"
        ps aux | grep $PID | grep -v grep | head -1
    fi
else
    echo "   ❌ Dev server is NOT running on port 3006"
    echo "   → Fix: Run 'npm run dev' in your app directory"
fi
echo ""

# Check 2: Can we connect to localhost:3006?
echo "2. Testing connection to localhost:3006..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/ | grep -q "200\|404"; then
    echo "   ✅ Can connect to localhost:3006"
else
    echo "   ❌ Cannot connect to localhost:3006"
    echo "   → Dev server is not running or not accessible"
fi
echo ""

# Check 3: Nginx configuration
echo "3. Checking Nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration has errors:"
    nginx -t
fi
echo ""

# Check 4: Nginx error log
echo "4. Recent Nginx errors:"
if [ -f /var/log/nginx/error.log ]; then
    echo "   Last 10 errors:"
    tail -10 /var/log/nginx/error.log | grep -i "403\|forbidden\|connect\|refused" || echo "   No relevant errors found"
else
    echo "   ⚠️  Error log not found"
fi
echo ""

# Check 5: Nginx access log
echo "5. Recent access attempts:"
if [ -f /var/log/nginx/access.log ]; then
    tail -5 /var/log/nginx/access.log | awk '{print $9, $7}'
elif [ -f /var/log/nginx/falah.live.access.log ]; then
    tail -5 /var/log/nginx/falah.live.access.log | awk '{print $9, $7}'
else
    echo "   ⚠️  Access log not found"
fi
echo ""

# Check 6: Nginx site configuration
echo "6. Checking Nginx site configuration for falah.live..."
if [ -f /etc/nginx/sites-available/falah.live ]; then
    echo "   ✅ Config file exists: /etc/nginx/sites-available/falah.live"
    echo "   Checking proxy_pass..."
    if grep -q "proxy_pass.*3006" /etc/nginx/sites-available/falah.live; then
        echo "   ✅ proxy_pass to port 3006 found"
        grep "proxy_pass" /etc/nginx/sites-available/falah.live
    else
        echo "   ❌ proxy_pass to port 3006 NOT found"
        echo "   → Need to add: proxy_pass http://localhost:3006;"
    fi
else
    echo "   ❌ Config file not found"
    echo "   → Need to create Nginx config for falah.live"
fi
echo ""

# Check 7: Is site enabled?
echo "7. Checking if site is enabled..."
if [ -L /etc/nginx/sites-enabled/falah.live ]; then
    echo "   ✅ Site is enabled"
else
    echo "   ❌ Site is NOT enabled"
    echo "   → Fix: sudo ln -s /etc/nginx/sites-available/falah.live /etc/nginx/sites-enabled/"
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Most likely issues:"
echo "1. Dev server not running → Start: npm run dev"
echo "2. Nginx not configured → Add proxy_pass to localhost:3006"
echo "3. Site not enabled → Enable: sudo ln -s /etc/nginx/sites-available/falah.live /etc/nginx/sites-enabled/"
echo ""
echo "Next steps:"
echo "1. Fix the issues above"
echo "2. Reload Nginx: sudo systemctl reload nginx"
echo "3. Test: curl http://localhost:3006"
echo "4. Visit: https://falah.live"
echo ""
