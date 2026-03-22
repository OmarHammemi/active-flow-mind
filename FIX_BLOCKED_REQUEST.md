# 🔧 Fix "Blocked request" Error

## ✅ Code Fixed

I've updated `vite.config.ts`:
- Changed `allowedHosts` to `"all"` (most permissive)
- This allows all hosts including `falah.live`

## ⚠️ CRITICAL: Restart Dev Server

**The config change won't work until you restart the dev server!**

### Step 1: Kill Current Dev Server

```bash
# Kill all processes on port 3006
sudo kill -9 $(sudo lsof -ti :3006)

# Verify port is free
sudo lsof -i :3006
# Should return nothing
```

### Step 2: Start Dev Server Fresh

```bash
cd /home/omar/Habit/active-flow-mind
npm run dev
```

### Step 3: Verify Config is Loaded

The dev server should start without errors. Check the terminal output - it should show:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3006/
➜  Network: http://0.0.0.0:3006/
```

### Step 4: Test

Visit: `https://falah.live`

Should work now! ✅ (No more "Blocked request" error)

## If Still Getting Error

### Check 1: Verify Config File

```bash
# Check the config file has "all"
grep allowedHosts vite.config.ts
# Should show: allowedHosts: "all",
```

### Check 2: Clear Vite Cache

```bash
# Delete Vite cache
rm -rf node_modules/.vite
rm -rf dist

# Restart dev server
npm run dev
```

### Check 3: Check Dev Server Logs

Look at the terminal where `npm run dev` is running. It should show:
- No errors about blocked hosts
- Server listening on port 3006

## Current Configuration

```typescript
server: {
  host: "0.0.0.0",
  port: 3006,
  allowedHosts: "all",  // ← Allows all hosts
  // ...
}
```

## Summary

✅ **Config updated**: `allowedHosts: "all"`  
⚠️ **Must restart dev server** for changes to take effect  
🔄 **Kill and restart**: `sudo kill -9 $(sudo lsof -ti :3006) && npm run dev`

**After restarting, the "Blocked request" error should be gone!** 🎉
