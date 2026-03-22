# 🔴 403 Forbidden - Fix Now

## The Problem

Nginx is returning **403 Forbidden** when accessing `https://falah.live/`

## ✅ Most Likely Fix (90% of cases)

**The dev server is not running on port 3006!**

### Quick Fix:

```bash
# SSH into your server
ssh your-user@your-server

# Navigate to your app directory
cd /path/to/active-flow-mind

# Start the dev server
npm run dev
```

**Keep this terminal open** - the dev server must keep running!

## If Dev Server is Running

### Check Nginx Configuration

```bash
# 1. Check if Nginx can connect to dev server
curl http://localhost:3006

# 2. Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# 3. Check Nginx config
sudo nginx -t
```

### Update Nginx Config

Make sure your `/etc/nginx/sites-available/falah.live` has:

```nginx
server {
    listen 443 ssl http2;
    server_name falah.live www.falah.live;
    
    ssl_certificate /etc/letsencrypt/live/falah.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/falah.live/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3006;  # ← CRITICAL: Must point to dev server
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Diagnostic Script

I've created a diagnostic script. Run it on your server:

```bash
# Copy script to server
scp DIAGNOSE_403.sh your-user@your-server:/tmp/

# Run on server
ssh your-user@your-server
sudo /tmp/DIAGNOSE_403.sh
```

This will tell you exactly what's wrong!

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Dev server not running | `npm run dev` |
| Wrong proxy_pass | Update to `http://localhost:3006` |
| Site not enabled | `sudo ln -s /etc/nginx/sites-available/falah.live /etc/nginx/sites-enabled/` |
| Nginx config error | `sudo nginx -t` to see errors |
| Port 3006 blocked | Check firewall: `sudo ufw status` |

## Quick Test

```bash
# On your server, test if dev server responds:
curl http://localhost:3006

# If this works but https://falah.live doesn't, it's an Nginx config issue
```

## Summary

**403 Forbidden** = Nginx can't access the backend (dev server)

**Fix:**
1. ✅ Start dev server: `npm run dev`
2. ✅ Check Nginx config has `proxy_pass http://localhost:3006;`
3. ✅ Reload Nginx: `sudo systemctl reload nginx`

**The dev server MUST be running for the site to work!** 🚀
