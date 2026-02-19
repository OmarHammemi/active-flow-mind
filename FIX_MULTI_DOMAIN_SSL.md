# Fix SSL Certificate for Multiple Domains (falah.live + agenthub.digital)

## 🔴 Current Problem

Your SSL certificate is only for `agenthub.digital`, but you're accessing the site via `falah.live`. The certificate needs to include **both domains**.

## ✅ Solution: Add Both Domains to SSL Certificate

### Option 1: Let's Encrypt with Multiple Domains (Recommended)

If you're using your own server with Let's Encrypt:

```bash
# Remove old certificate
sudo certbot delete --cert-name agenthub.digital

# Get new certificate with BOTH domains
sudo certbot --nginx -d agenthub.digital -d www.agenthub.digital -d falah.live -d www.falah.live

# Or for Apache
sudo certbot --apache -d agenthub.digital -d www.agenthub.digital -d falah.live -d www.falah.live
```

This will create a certificate that works for **both domains**.

### Option 2: Update Existing Certificate

If you want to add `falah.live` to an existing certificate:

```bash
# Expand existing certificate to include falah.live
sudo certbot --nginx --expand -d agenthub.digital -d www.agenthub.digital -d falah.live -d www.falah.live

# Or for Apache
sudo certbot --apache --expand -d agenthub.digital -d www.agenthub.digital -d falah.live -d www.falah.live
```

### Option 3: Use Cloudflare (Easiest - Handles Multiple Domains)

Cloudflare can handle multiple domains easily:

1. **Add both domains to Cloudflare**:
   - Add `agenthub.digital` to Cloudflare
   - Add `falah.live` to Cloudflare (as an additional site or alias)

2. **Update DNS for both domains**:
   - Point both domains' nameservers to Cloudflare
   - Or use CNAME records to point `falah.live` to `agenthub.digital`

3. **Enable SSL for both**:
   - SSL/TLS → Overview → Set to "Full" or "Full (strict)"
   - SSL/TLS → Edge Certificates → Enable "Always Use HTTPS"

4. **Cloudflare will automatically provide SSL for both domains**

### Option 4: Use a Wildcard Certificate

If you want to support multiple subdomains:

```bash
# Get wildcard certificate (requires DNS validation)
sudo certbot certonly --manual --preferred-challenges dns -d "*.agenthub.digital" -d "*.falah.live" -d agenthub.digital -d falah.live
```

## 🔧 Server Configuration (Nginx Example)

After getting the certificate, configure your server to handle both domains:

```nginx
# HTTP to HTTPS redirect for both domains
server {
    listen 80;
    server_name agenthub.digital www.agenthub.digital falah.live www.falah.live;
    return 301 https://$host$request_uri;
}

# HTTPS server block for both domains
server {
    listen 443 ssl http2;
    server_name agenthub.digital www.agenthub.digital falah.live www.falah.live;
    
    # SSL certificate (includes both domains)
    ssl_certificate /etc/letsencrypt/live/agenthub.digital/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agenthub.digital/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Your app configuration
    location / {
        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Server Configuration (Apache Example)

```apache
# HTTP to HTTPS redirect
<VirtualHost *:80>
    ServerName agenthub.digital
    ServerAlias www.agenthub.digital falah.live www.falah.live
    Redirect permanent / https://agenthub.digital/
</VirtualHost>

# HTTPS server block
<VirtualHost *:443>
    ServerName agenthub.digital
    ServerAlias www.agenthub.digital falah.live www.falah.live
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/agenthub.digital/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/agenthub.digital/privkey.pem
    
    # Your app configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:3006/
    ProxyPassReverse / http://localhost:3006/
</VirtualHost>
```

## ✅ Verify Certificate Includes Both Domains

After setting up, verify the certificate:

```bash
# Check certificate details
openssl s_client -connect falah.live:443 -servername falah.live | openssl x509 -noout -text | grep -A 5 "Subject Alternative Name"

# Should show both domains:
# DNS:agenthub.digital
# DNS:www.agenthub.digital
# DNS:falah.live
# DNS:www.falah.live
```

## 🚀 Quick Fix Steps

1. **Get certificate with both domains**:
   ```bash
   sudo certbot --nginx -d agenthub.digital -d falah.live
   ```

2. **Update server config** to handle both domains (see examples above)

3. **Restart web server**:
   ```bash
   sudo systemctl restart nginx  # or apache2
   ```

4. **Test both domains**:
   - Visit: `https://agenthub.digital` ✅
   - Visit: `https://falah.live` ✅

5. **Clear browser cache** and test again

## 🌐 Using Cloudflare (Recommended for Multiple Domains)

**Easiest solution** - Cloudflare handles multiple domains automatically:

1. Add both `agenthub.digital` and `falah.live` to Cloudflare
2. Update nameservers for both domains
3. Enable SSL/TLS → "Full" mode
4. Enable "Always Use HTTPS"
5. Cloudflare provides SSL for both automatically

**Or use CNAME**:
- Point `falah.live` DNS to `agenthub.digital` via CNAME
- Cloudflare will handle SSL for both

## 📝 Important Notes

- **Certificate must include both domains** in Subject Alternative Names (SAN)
- **DNS must point both domains** to the same server
- **Server config must accept both domains** in server_name/serveralias
- **Auto-renewal**: Certbot will renew certificates automatically if both domains are included
- **Wait 5-30 minutes** after changes for DNS/SSL propagation

## 🔍 Troubleshooting

If still getting errors:

1. **Check certificate includes falah.live**:
   ```bash
   openssl s_client -connect falah.live:443 -servername falah.live | openssl x509 -noout -text | grep "DNS:"
   ```

2. **Verify DNS**:
   ```bash
   nslookup falah.live
   dig falah.live
   ```

3. **Check server logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log  # or apache2/error.log
   ```

4. **Test certificate**:
   ```bash
   sudo certbot certificates  # List all certificates
   ```

## ✅ Expected Result

After fixing:
- ✅ `https://agenthub.digital` works with padlock
- ✅ `https://falah.live` works with padlock
- ✅ No certificate errors
- ✅ Both domains show valid SSL
