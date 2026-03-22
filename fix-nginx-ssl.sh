#!/bin/bash
# Nginx SSL Certificate Fix Script
# This script fixes the SNI configuration for falah.live

set -e  # Exit on error

echo "=========================================="
echo "Nginx SSL Certificate Fix for falah.live"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Step 1: Get SSL certificate for falah.live
echo "Step 1: Getting SSL certificate for falah.live..."
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "❌ certbot is not installed. Installing..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Get certificate for falah.live
echo "Requesting SSL certificate for falah.live..."
certbot certonly --nginx -d falah.live -d www.falah.live --non-interactive --agree-tos --email admin@falah.live --keep-until-expiring

if [ $? -ne 0 ]; then
    echo "⚠️  Certificate request failed. Trying to expand existing certificate..."
    certbot --nginx --expand -d agenthub.digital -d falah.live --non-interactive --agree-tos --email admin@falah.live
fi

echo ""
echo "✅ Certificate obtained!"
echo ""

# Step 2: Create Nginx configuration
echo "Step 2: Creating Nginx configuration..."
echo ""

NGINX_CONF="/etc/nginx/sites-available/falah.live"
NGINX_CONF_ENABLED="/etc/nginx/sites-enabled/falah.live"

# Check if config file exists
if [ -f "$NGINX_CONF" ]; then
    echo "⚠️  Configuration file already exists. Creating backup..."
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create configuration file
cat > "$NGINX_CONF" << 'EOF'
# Nginx Configuration for falah.live with SNI
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name falah.live www.falah.live;
    return 301 https://$host$request_uri;
}

# HTTPS server block for falah.live (with SNI)
server {
    listen 443 ssl http2;
    server_name falah.live www.falah.live;
    
    # SSL Certificate for falah.live
    ssl_certificate /etc/letsencrypt/live/falah.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/falah.live/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Your app configuration
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ Configuration file created: $NGINX_CONF"
echo ""

# Step 3: Enable the site
echo "Step 3: Enabling the site..."
if [ ! -L "$NGINX_CONF_ENABLED" ]; then
    ln -s "$NGINX_CONF" "$NGINX_CONF_ENABLED"
    echo "✅ Site enabled"
else
    echo "✅ Site already enabled"
fi
echo ""

# Step 4: Test Nginx configuration
echo "Step 4: Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
echo ""

# Step 5: Reload Nginx
echo "Step 5: Reloading Nginx..."
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

# Step 6: Verify certificate
echo "Step 6: Verifying certificate..."
echo ""
echo "Checking certificate for falah.live..."
CERT_CHECK=$(openssl s_client -connect falah.live:443 -servername falah.live 2>/dev/null | openssl x509 -noout -text 2>/dev/null | grep -A 1 "Subject Alternative Name" | grep "DNS:")

if echo "$CERT_CHECK" | grep -q "falah.live"; then
    echo "✅ Certificate includes falah.live!"
    echo "Certificate domains:"
    echo "$CERT_CHECK"
else
    echo "⚠️  Certificate verification failed. Please check manually:"
    echo "   openssl s_client -connect falah.live:443 -servername falah.live"
fi
echo ""

echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Clear your browser cache"
echo "2. Visit: https://falah.live"
echo "3. You should see a padlock icon ✅"
echo ""
echo "If you still see errors, wait 1-2 minutes for changes to propagate."
