# 🔧 Fix 502 Bad Gateway Error

## Problem

**502 Bad Gateway** = Nginx can't connect to the dev server on port 3006.

**Root Cause**: The dev server is **NOT running**.

Nginx is trying to proxy to `http://localhost:3006`, but nothing is listening there.

## ✅ Solution: Start the Dev Server

Run this command:

```bash
cd /home/omar/Habit/active-flow-mind
npm run dev
```

**Wait 5-10 seconds** for the server to start, then visit: `https://falah.live`

The 502 error should be **GONE**! ✅

## Verification

After starting, verify the server is running:

```bash
# Check if port 3006 is in use
sudo lsof -i :3006

# Should show something like:
# COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# node    12345 omar   19u  IPv4 ...      0t0  TCP *:3006 (LISTEN)
```

## Quick Start Script

You can also use:

```bash
./START_FRESH.sh
```

## Why This Happened

We stopped the old PM2 process to load the new `allowedHosts` config. The dev server needs to be manually started now.

## Summary

- ✅ **Nginx config**: Correct (proxying to port 3006)
- ❌ **Dev server**: Not running
- 🔧 **Fix**: Run `npm run dev`
- ⏱️ **Wait**: 5-10 seconds
- 🌐 **Test**: Visit `https://falah.live`

---

**Status**: Ready to start  
**Action**: `npm run dev` in the project directory
