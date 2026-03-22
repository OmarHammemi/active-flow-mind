# 🔄 Complete Dev Server Restart Guide

## The Problem

Process keeps restarting on port 3006. This is likely because:
- PM2 is managing the process (auto-restart)
- Multiple dev server instances running
- Process manager keeping it alive

## ✅ Complete Fix

### Step 1: Stop All Processes

```bash
# Option A: Use the script I created
sudo ./stop-all-dev-servers.sh

# Option B: Manual commands
# Stop PM2 (if using)
pm2 stop all
pm2 delete all

# Kill all processes on port 3006
sudo kill -9 $(sudo lsof -ti :3006)

# Kill all node processes (nuclear option)
pkill -f "vite|node.*3006"
```

### Step 2: Verify Port is Free

```bash
sudo lsof -i :3006
# Should return nothing
```

### Step 3: Start Dev Server Fresh

```bash
cd /home/omar/Habit/active-flow-mind
npm run dev
```

## If Process Keeps Restarting

### Check for PM2

```bash
# List PM2 processes
pm2 list

# Stop all
pm2 stop all
pm2 delete all

# Disable PM2 startup (if enabled)
pm2 unstartup
```

### Check for systemd service

```bash
# Check if there's a systemd service
systemctl list-units | grep -i vite
systemctl list-units | grep -i node

# Stop it
sudo systemctl stop vite.service  # or whatever it's called
```

### Check for screen/tmux sessions

```bash
# List screen sessions
screen -ls

# Kill all screen sessions
screen -X -S $(screen -ls | grep Detached | awk '{print $1}') quit

# List tmux sessions
tmux ls

# Kill tmux session
tmux kill-session -t session-name
```

## One-Line Complete Restart

```bash
# Kill everything and start fresh
pm2 stop all 2>/dev/null; pm2 delete all 2>/dev/null; sudo kill -9 $(sudo lsof -ti :3006) 2>/dev/null; pkill -f "vite|node.*3006" 2>/dev/null; sleep 3; cd /home/omar/Habit/active-flow-mind && npm run dev
```

## After Starting

1. ✅ Port 3006 is free
2. ✅ Dev server started
3. ✅ Test: `curl http://localhost:3006`
4. ✅ Visit: `https://falah.live`
5. ✅ Should work! (no more 403)

## Keep It Running

Use PM2 to keep it running properly:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "falah-app" -- run dev

# Save PM2 config
pm2 save

# Enable PM2 startup
pm2 startup
```

Now PM2 will manage it properly and you can control it with `pm2` commands.
