#!/bin/bash
# SSL Certificate Fix Script
# Run this on your server (where Nginx/Apache is running)

echo "=== Fixing SSL Certificate to include falah.live ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Try to expand existing certificate
echo "Attempting to expand certificate to include falah.live..."
certbot --nginx --expand -d agenthub.digital -d falah.live --non-interactive --agree-tos --email admin@falah.live

# If expand fails, get new certificate
if [ $? -ne 0 ]; then
    echo "Expand failed, getting new certificate with both domains..."
    certbot --nginx -d agenthub.digital -d falah.live --non-interactive --agree-tos --email admin@falah.live
fi

# Restart nginx
echo "Restarting Nginx..."
systemctl restart nginx

# Verify certificate
echo ""
echo "=== Verifying certificate ==="
openssl s_client -connect falah.live:443 -servername falah.live 2>/dev/null | openssl x509 -noout -text | grep "DNS:"

echo ""
echo "=== Done! ==="
echo "If you see 'DNS:falah.live' above, the certificate is fixed!"
echo "Clear your browser cache and visit https://falah.live"
