# 🔧 SNI Configuration Fix Guide

## The Problem (As You Identified)

On a shared server, **SNI (Server Name Indication)** must be properly configured so the server knows which SSL certificate to present for each domain. Currently, your server is showing the certificate for `agenthub.digital` when someone visits `falah.live`.

## ✅ Solution: Configure SNI Properly

You have **two options**:

### Option 1: Separate Certificates (Recommended for Different Sites)

Each domain gets its own certificate and virtual host block.

### Option 2: One Certificate for Both Domains

Get a single certificate that includes both `agenthub.digital` and `falah.live`.

---

## 🚀 Quick Fix Steps

### Step 1: Get Certificate for falah.live

```bash
# SSH into your server, then:
sudo certbot --nginx -d falah.live -d www.falah.live

# OR for Apache:
sudo certbot --apache -d falah.live -d www.falah.live
```

### Step 2: Configure SNI in Your Web Server

**For Nginx:**

1. Edit your Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/falah.live
   ```

2. Use the configuration from `nginx-sni-config.conf` (I've created this file)

3. Test configuration:
   ```bash
   sudo nginx -t
   ```

4. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

**For Apache:**

1. Edit your Apache config:
   ```bash
   sudo nano /etc/apache2/sites-available/falah.live.conf
   ```

2. Use the configuration from `apache-sni-config.conf` (I've created this file)

3. Enable the site:
   ```bash
   sudo a2ensite falah.live.conf
   ```

4. Test configuration:
   ```bash
   sudo apache2ctl configtest
   ```

5. Reload Apache:
   ```bash
   sudo systemctl reload apache2
   ```

### Step 3: Verify SNI is Working

```bash
# Check certificate for falah.live
openssl s_client -connect falah.live:443 -servername falah.live 2>/dev/null | openssl x509 -noout -text | grep "DNS:"

# Should show:
# DNS:falah.live
# DNS:www.falah.live

# Check certificate for agenthub.digital
openssl s_client -connect agenthub.digital:443 -servername agenthub.digital 2>/dev/null | openssl x509 -noout -text | grep "DNS:"

# Should show:
# DNS:agenthub.digital
# DNS:www.agenthub.digital
```

---

## 🔍 Alternative: One Certificate for Both Domains

If both domains point to the same application, you can use one certificate:

### Step 1: Get Certificate with Both Domains

```bash
sudo certbot --nginx -d agenthub.digital -d falah.live
```

### Step 2: Configure Single Virtual Host

**Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name agenthub.digital www.agenthub.digital falah.live www.falah.live;
    
    ssl_certificate /etc/letsencrypt/live/agenthub.digital/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agenthub.digital/privkey.pem;
    
    # ... rest of config
}
```

**Apache:**
```apache
<VirtualHost *:443>
    ServerName agenthub.digital
    ServerAlias www.agenthub.digital falah.live www.falah.live
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/agenthub.digital/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/agenthub.digital/privkey.pem
    
    # ... rest of config
</VirtualHost>
```

---

## ✅ Verification Checklist

After configuring SNI:

- [ ] Certificate obtained for falah.live (or both domains)
- [ ] Virtual host configured with correct `server_name`/`ServerName`
- [ ] SSL certificate paths point to correct certificate files
- [ ] Web server config tested (`nginx -t` or `apache2ctl configtest`)
- [ ] Web server reloaded
- [ ] Certificate verified with openssl command
- [ ] Browser cache cleared
- [ ] Tested `https://falah.live` - shows padlock ✅

---

## 🐛 Troubleshooting

### SNI Not Working?

1. **Check Nginx version** (SNI supported since 0.5.23):
   ```bash
   nginx -v
   ```

2. **Check Apache version** (SNI supported since 2.2.12):
   ```bash
   apache2 -v
   ```

3. **Verify virtual host order** - The first matching `server_name`/`ServerName` is used

4. **Check for default/fallback server blocks** - Make sure there's no catch-all that's intercepting

5. **Check server logs**:
   ```bash
   # Nginx
   sudo tail -f /var/log/nginx/error.log
   
   # Apache
   sudo tail -f /var/log/apache2/error.log
   ```

### Still Getting Wrong Certificate?

1. **Verify certificate files exist**:
   ```bash
   ls -la /etc/letsencrypt/live/falah.live/
   ```

2. **Check certificate includes correct domain**:
   ```bash
   openssl x509 -in /etc/letsencrypt/live/falah.live/fullchain.pem -noout -text | grep "DNS:"
   ```

3. **Test SNI directly**:
   ```bash
   openssl s_client -connect falah.live:443 -servername falah.live
   ```
   Look for the certificate details in the output.

---

## 📝 Files Created

I've created configuration files for you:

1. **`nginx-sni-config.conf`** - Nginx SNI configuration
2. **`apache-sni-config.conf`** - Apache SNI configuration
3. **`SNI_FIX_GUIDE.md`** - This guide

Copy the relevant configuration to your server and adjust as needed.

---

## 🎯 Summary

**The Issue**: Server doesn't know which certificate to show for `falah.live` (SNI misconfiguration)

**The Fix**: 
1. Get certificate for `falah.live`
2. Configure separate virtual host with correct `server_name`/`ServerName`
3. Point SSL certificate to correct files
4. Reload web server

**Result**: Server will use SNI to present the correct certificate for each domain! ✅
