# ⚡ Quick Fix for 403 Forbidden

## The Problem

**403 Forbidden** means Nginx is blocking access. Most common causes:

1. **Dev server not running** on port 3006
2. **Wrong Nginx proxy configuration**
3. **File permissions issue**

## ✅ Quick Fix (Run on Server)

### Option 1: Check Dev Server

```bash
# Check if dev server is running
netstat -tlnp | grep 3006

# If not running, start it:
cd /path/to/your/app
npm run dev
```

### Option 2: Check Nginx Config

```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Common error: "connect() failed (111: Connection refused)"
# This means dev server is not running on port 3006
```

### Option 3: Update Nginx Config

Make sure your Nginx config has correct proxy_pass:

```nginx
location / {
    proxy_pass http://localhost:3006;  # ← Make sure this is correct
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Most Likely Issue

**Dev server is not running on port 3006!**

**Fix:**
```bash
# SSH into your server
cd /path/to/your/app
npm run dev
```

The dev server must be running for Nginx to proxy to it.

## Alternative: Serve Built Files

If you want to serve built files instead:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Update Nginx to serve static files:**
   ```nginx
   root /path/to/your/app/dist;
   index index.html;
   
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

3. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

## Summary

**403 Forbidden** usually means:
- ❌ Dev server not running → **Start it: `npm run dev`**
- ❌ Wrong Nginx config → **Check proxy_pass path**
- ❌ Connection refused → **Dev server not listening on port 3006**

**Quick check:**
```bash
# Is dev server running?
netstat -tlnp | grep 3006

# If not, start it:
npm run dev
```
