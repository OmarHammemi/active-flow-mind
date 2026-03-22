# ✅ HMR Configuration Updated

## What Changed

Updated `vite.config.ts` with your HMR configuration:

```typescript
hmr: {
  protocol: 'wss',      // Secure WebSocket
  host: 'falah.live',
  port: 443,             // HTTPS port (Nginx proxy)
  clientPort: 443        // Client connects to port 443
}
```

## How It Works

1. **Browser** connects to `wss://falah.live:443/` (secure WebSocket)
2. **Nginx** (port 443) receives the WebSocket connection
3. **Nginx** upgrades the connection and proxies to `ws://localhost:3006/` (HTTP WebSocket)
4. **Vite dev server** (port 3006) handles the HMR connection

## ⚠️ Important: Nginx Must Be Configured

For this to work, Nginx **MUST** have WebSocket proxy configuration:

```nginx
location / {
    proxy_pass http://localhost:3006;
    proxy_http_version 1.1;
    
    # CRITICAL: WebSocket upgrade headers
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
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

## Next Steps

1. **Restart dev server** (config change requires restart):
   ```bash
   # Kill current process
   sudo kill -9 $(sudo lsof -ti :3006)
   
   # Start fresh
   npm run dev
   ```

2. **Verify Nginx has WebSocket config** (see above)

3. **Reload Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Test**:
   - Visit: `https://falah.live`
   - Check browser console - should see WebSocket connected ✅
   - HMR should work (hot reload)

## If Still Not Working

1. **Check Nginx error log**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Test WebSocket connection**:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Host: falah.live" -H "Origin: https://falah.live" https://falah.live/
   ```

3. **Verify dev server is running**:
   ```bash
   netstat -tlnp | grep 3006
   ```

## Summary

✅ **HMR config updated** - uses `wss://` on port 443  
⚠️ **Nginx must proxy WebSocket** - add upgrade headers  
🔄 **Restart dev server** - for changes to take effect  

Once Nginx is configured with WebSocket support, HMR will work! 🎉
