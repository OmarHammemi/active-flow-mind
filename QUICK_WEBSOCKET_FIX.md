# ⚡ Quick WebSocket Fix

## The Problem

When accessing `https://falah.live`, Vite HMR tries to connect to `wss://falah.live:3006`, but port 3006 doesn't have SSL → **ERR_SSL_PROTOCOL_ERROR**

## ✅ Solution: Configure Nginx to Proxy WebSocket

**This MUST be done on your server.** The code changes alone won't fix it.

### Step 1: Update Nginx Config

Add WebSocket proxy headers to your Nginx config:

```bash
sudo nano /etc/nginx/sites-available/falah.live
```

Add these lines to the `location /` block:

```nginx
location / {
    proxy_pass http://localhost:3006;
    proxy_http_version 1.1;
    
    # CRITICAL: WebSocket upgrade headers
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Standard headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket timeouts
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
    proxy_buffering off;
}
```

### Step 2: Test and Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Restart Vite Dev Server

```bash
# Stop current dev server (Ctrl+C)
# Restart it
npm run dev
```

## Alternative: Access Dev Server via HTTP

For development, use HTTP instead of HTTPS:

- **Use**: `http://falah.live:3006` (not HTTPS)
- **Or**: `http://localhost:3006` locally

This bypasses the SSL issue entirely.

## For Production

In production:
- Build: `npm run build`
- Serve built files (not dev server)
- HMR is disabled, so no WebSocket needed

## Why This Happens

- Page loads over **HTTPS** (port 443)
- Browser tries to connect to dev server using **secure WebSocket** (`wss://`)
- Dev server is **HTTP only** (port 3006)
- Browser blocks **mixed content** (HTTPS → HTTP)

**Solution**: Nginx proxies the WebSocket connection, so browser connects to HTTPS, Nginx upgrades to WebSocket and forwards to HTTP backend.

---

**The errors are harmless** - your app still works, HMR just can't connect. But fixing Nginx will make HMR work properly! ✅
