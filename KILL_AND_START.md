# 🔧 Kill Processes and Start Dev Server

## Commands to Run

### Step 1: Kill All Processes on Port 3006

```bash
# Find all processes using port 3006
sudo lsof -ti :3006

# Kill them all at once
sudo kill -9 $(sudo lsof -ti :3006)

# Or kill specific PIDs
sudo kill -9 2366652 2643781 2644688
```

### Step 2: Verify Port is Free

```bash
sudo lsof -i :3006
# Should return nothing (port is free)
```

### Step 3: Start Dev Server

```bash
cd /home/omar/Habit/active-flow-mind
npm run dev
```

### Step 4: Verify It's Working

```bash
# In another terminal, test:
curl http://localhost:3006

# Should return HTML, not 403
```

### Step 5: Test from Browser

Visit: `https://falah.live`

Should work now! ✅

## One-Line Kill and Start

```bash
# Kill all processes on port 3006 and start dev server
sudo kill -9 $(sudo lsof -ti :3006) 2>/dev/null; sleep 2; cd /home/omar/Habit/active-flow-mind && npm run dev
```

## Keep Dev Server Running

**Important**: The dev server must keep running. Options:

### Option 1: Run in Background

```bash
nohup npm run dev > /tmp/vite.log 2>&1 &
```

### Option 2: Use Screen

```bash
screen -S vite
npm run dev
# Press Ctrl+A then D to detach
```

### Option 3: Use PM2 (Best)

```bash
npm install -g pm2
pm2 start npm --name "falah" -- run dev
pm2 save
pm2 startup  # Run this once to auto-start on reboot
```

## After Starting

1. ✅ Dev server running on port 3006
2. ✅ Nginx proxying to localhost:3006
3. ✅ Visit https://falah.live
4. ✅ Should work! (no more 403)
