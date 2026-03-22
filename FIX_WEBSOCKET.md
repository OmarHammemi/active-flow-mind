# 🔧 Fix WebSocket Connection Errors

## The Problem

When you access the site over HTTPS (`https://falah.live`), the browser tries to connect to the Vite dev server on port 3006 using secure connections (`wss://` and `https://`), but port 3006 is HTTP only. Browsers block this "mixed content" for security.

## ✅ Solution: Configure Nginx to Proxy WebSocket

Nginx can proxy the WebSocket connection, allowing HTTPS pages to connect to HTTP WebSocket through the proxy.

### Step 1: Update Nginx Configuration

Add this to your Nginx config (`/etc/nginx/sites-available/falah.live`):

```nginx
server {
    listen 443 ssl http2;
    server_name falah.live www.falah.live;
    
    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/falah.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/falah.live/privkey.pem;
    
    # WebSocket proxy configuration
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        
        # WebSocket upgrade headers (CRITICAL)
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
        
        # Disable buffering
        proxy_buffering off;
    }
}
```

### Step 2: Update Vite Config

The Vite config should use the same host (falah.live) but through the Nginx proxy:

```typescript
hmr: {
  host: "falah.live",
  port: 443,  // Use HTTPS port (Nginx will proxy to 3006)
  protocol: "ws",  // Nginx handles the upgrade
}
```

Actually, wait - if Nginx is proxying, the HMR should work through the proxy. Let me check the current config...

### Step 3: Reload Nginx

```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

## Alternative: Access Dev Server Directly via HTTP

For development, you can access the dev server directly:

- Use: `http://falah.live:3006` (not HTTPS)
- Or: `http://localhost:3006` locally

This bypasses the HTTPS issue entirely.

## For Production

In production, you should:
1. Build the app: `npm run build`
2. Serve the built files (not the dev server)
3. HMR is disabled in production, so no WebSocket needed

## Quick Fix

**For now, to stop the errors:**

1. **Access dev server via HTTP**: `http://falah.live:3006` (not HTTPS)
2. **Or build for production**: `npm run build` and serve the built files
3. **Or configure Nginx** to proxy WebSocket (see above)

The errors are harmless in production (HMR is disabled), but annoying in development.
