# 🔧 EXACT FIX - Run This on Your Server

## Current Status
❌ Certificate still missing `falah.live`
- Certificate has: `agenthub.digital`, `www.agenthub.digital`
- Certificate missing: `falah.live` ← **THIS IS THE PROBLEM**

## ✅ The Fix (Run on Your Server)

### Step 1: SSH into Your Server
```bash
ssh your-user@your-server-ip
```

### Step 2: Run This Command
```bash
sudo certbot --nginx --expand -d agenthub.digital -d falah.live
```

**OR if that doesn't work:**
```bash
sudo certbot --nginx -d agenthub.digital -d falah.live
```

### Step 3: Restart Nginx
```bash
sudo systemctl restart nginx
```

### Step 4: Verify It's Fixed
```bash
openssl s_client -connect falah.live:443 -servername falah.live 2>/dev/null | openssl x509 -noout -text | grep "DNS:"
```

**You should see:**
```
DNS:agenthub.digital
DNS:www.agenthub.digital
DNS:falah.live          ← Should appear now!
```

### Step 5: Test in Browser
1. Clear browser cache (Ctrl+Shift+Delete)
2. Visit: `https://falah.live`
3. Should see: ✅ Padlock icon

## Alternative: Use the Script

I've created `FIX_NOW.sh` - you can run it on your server:

```bash
# Copy the script to your server, then:
chmod +x FIX_NOW.sh
sudo ./FIX_NOW.sh
```

## If You Don't Have Server Access

Use Cloudflare (free, 10 minutes):
1. https://dash.cloudflare.com/sign-up
2. Add `falah.live`
3. Update nameservers
4. Enable SSL → "Full"
5. Done!

## ⚠️ Important

- **This MUST be done on your server** - cannot be fixed in code
- **Certificate changes take effect immediately** after restarting nginx
- **Browser cache** may need to be cleared
- **Wait 1-2 minutes** after restart for changes to propagate

## Still Not Working?

1. Check nginx config includes both domains:
   ```bash
   sudo nginx -t
   cat /etc/nginx/sites-available/default | grep server_name
   ```

2. Verify certificate file exists:
   ```bash
   ls -la /etc/letsencrypt/live/agenthub.digital/
   ```

3. Check nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```
