# 🚀 Apply Nginx Fix - Step by Step

## Quick Fix (Automated Script)

I've created an automated script that will fix everything for you.

### Step 1: Copy Script to Your Server

```bash
# From your local machine, copy the script to your server:
scp fix-nginx-ssl.sh your-user@your-server:/tmp/

# OR if you're already on the server, the script is in your project directory
```

### Step 2: Run the Script on Your Server

```bash
# SSH into your server
ssh your-user@your-server

# Make script executable (if not already)
chmod +x /tmp/fix-nginx-ssl.sh

# Run the script
sudo /tmp/fix-nginx-ssl.sh
```

The script will:
1. ✅ Install certbot (if needed)
2. ✅ Get SSL certificate for falah.live
3. ✅ Create Nginx configuration with SNI
4. ✅ Enable the site
5. ✅ Test configuration
6. ✅ Reload Nginx
7. ✅ Verify certificate

---

## Manual Fix (If You Prefer)

### Step 1: Get SSL Certificate

```bash
sudo certbot --nginx -d falah.live -d www.falah.live
```

### Step 2: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/falah.live
```

Copy the configuration from `nginx-fix.conf` (I've created this file for you).

### Step 3: Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/falah.live /etc/nginx/sites-enabled/
```

### Step 4: Test and Reload

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

---

## Verify It's Fixed

```bash
# Check certificate includes falah.live
openssl s_client -connect falah.live:443 -servername falah.live 2>/dev/null | openssl x509 -noout -text | grep "DNS:"
```

Should show:
```
DNS:falah.live
DNS:www.falah.live
```

Then:
1. Clear browser cache
2. Visit: `https://falah.live`
3. Should see: ✅ Padlock icon

---

## Files Created

1. **`fix-nginx-ssl.sh`** - Automated fix script (run on server)
2. **`nginx-fix.conf`** - Complete Nginx configuration
3. **`APPLY_NGINX_FIX.md`** - This guide

---

## Troubleshooting

### If script fails:

1. **Check Nginx is installed**:
   ```bash
   nginx -v
   ```

2. **Check certificate files exist**:
   ```bash
   ls -la /etc/letsencrypt/live/falah.live/
   ```

3. **Check Nginx error logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Verify DNS points to your server**:
   ```bash
   nslookup falah.live
   ```

---

## Important Notes

- ⚠️ **Run script as root** (use `sudo`)
- ⚠️ **Make sure port 80 and 443 are open** in firewall
- ⚠️ **DNS must point falah.live to your server** before getting certificate
- ✅ **SNI is enabled automatically** in modern Nginx
- ✅ **Each domain gets its own certificate** with separate server blocks

---

## After Fixing

The certificate error should be gone! The server will now:
- ✅ Present correct certificate for falah.live
- ✅ Use SNI to distinguish between domains
- ✅ Redirect HTTP to HTTPS
- ✅ Show padlock icon in browser
