# 🔴 Fix 403 Forbidden Error

## The Problem

**Error**: `403 Forbidden` when accessing `https://falah.live/`

This means Nginx is blocking access. Common causes:

1. **Wrong file permissions** - Nginx can't read the files
2. **Incorrect Nginx configuration** - Wrong paths or permissions
3. **Missing index file** - Nginx can't find index.html
4. **SELinux/AppArmor blocking** - Security policies blocking access

## ✅ Quick Fixes

### Fix 1: Check File Permissions

```bash
# On your server, check permissions
ls -la /path/to/your/app/dist  # or wherever your built files are

# Fix permissions (if needed)
sudo chown -R www-data:www-data /path/to/your/app/dist
sudo chmod -R 755 /path/to/your/app/dist
```

### Fix 2: Check Nginx Configuration

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx config
sudo nginx -t

# Common issues in config:
# - Wrong root path
# - Missing index directive
# - Permission denied errors
```

### Fix 3: Update Nginx Config

Make sure your Nginx config has:

```nginx
server {
    listen 443 ssl http2;
    server_name falah.live www.falah.live;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/falah.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/falah.live/privkey.pem;
    
    # Root directory - point to your built files
    root /path/to/your/app/dist;  # ← UPDATE THIS PATH
    index index.html;
    
    # Allow access
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Or if proxying to dev server:
    location / {
        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Fix 4: Check SELinux (if enabled)

```bash
# Check if SELinux is blocking
sudo getenforce

# If enabled, check audit logs
sudo ausearch -m avc -ts recent

# Temporarily disable to test (not recommended for production)
sudo setenforce 0
```

## For Development (Dev Server)

If you're running the dev server:

```nginx
location / {
    proxy_pass http://localhost:3006;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## For Production (Built Files)

If serving built files:

```nginx
root /var/www/falah.live/dist;  # Path to your dist folder
index index.html;

location / {
    try_files $uri $uri/ /index.html;
}
```

## Most Common Issue

**Wrong root path or missing files:**

1. **Check where your files are:**
   ```bash
   # If using dev server
   ps aux | grep vite
   
   # If using built files
   ls -la /var/www/falah.live/dist/
   ```

2. **Update Nginx root path** to match actual file location

3. **Ensure files exist:**
   ```bash
   # Build the app first
   npm run build
   
   # Check dist folder exists
   ls -la dist/
   ```

## Quick Diagnostic

Run these on your server:

```bash
# 1. Check Nginx error log
sudo tail -20 /var/log/nginx/error.log

# 2. Check file permissions
ls -la /path/to/your/files

# 3. Test Nginx config
sudo nginx -t

# 4. Check if dev server is running
netstat -tlnp | grep 3006
```

## Summary

**403 Forbidden** usually means:
- ❌ Wrong file path in Nginx config
- ❌ Missing files (need to build first)
- ❌ Wrong permissions
- ❌ Nginx can't access the directory

**Fix**: Update Nginx config with correct paths and permissions!
