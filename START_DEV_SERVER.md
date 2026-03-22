# 🚀 Start Dev Server - Step by Step

## After Killing Old Processes

You've killed the old processes. Now:

### Step 1: Verify Port is Free

```bash
sudo lsof -i :3006
# Should return nothing (port is free)
```

### Step 2: Start Dev Server

```bash
# Navigate to app directory
cd /home/omar/Habit/active-flow-mind

# Start dev server
npm run dev
```

The dev server should start on port 3006.

### Step 3: Verify Dev Server is Running

```bash
# In another terminal, check:
curl http://localhost:3006

# Should return HTML (not 403 or connection refused)
```

### Step 4: Test from Browser

Visit: `https://falah.live`

Should work now! ✅

## If Still Getting 403

### Check Nginx Configuration

```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check if Nginx can connect
curl http://localhost:3006
```

### Update Nginx Config

Make sure `/etc/nginx/sites-available/falah.live` has:

```nginx
location / {
    proxy_pass http://localhost:3006;
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

## Keep Dev Server Running

**Important**: The dev server must keep running. Use one of these:

### Option 1: Run in Background

```bash
nohup npm run dev > /tmp/vite.log 2>&1 &
```

### Option 2: Use Screen

```bash
screen -S vite
npm run dev
# Press Ctrl+A then D to detach
# Reattach: screen -r vite
```

### Option 3: Use PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "falah-app" -- run dev

# PM2 will keep it running even if you disconnect
```

## Summary

1. ✅ Kill old processes (you did this)
2. ✅ Verify port is free
3. ⏭️ Start dev server: `npm run dev`
4. ⏭️ Test: `curl http://localhost:3006`
5. ⏭️ Visit: `https://falah.live`

The 403 error should be gone once the dev server is running! 🎉
