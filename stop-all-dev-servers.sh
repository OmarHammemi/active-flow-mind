#!/bin/bash
# Stop all dev server processes (including PM2)

echo "=========================================="
echo "Stopping All Dev Server Processes"
echo "=========================================="
echo ""

# Check for PM2
if command -v pm2 &> /dev/null; then
    echo "Step 1: Stopping PM2 processes..."
    pm2 stop all 2>/dev/null
    pm2 delete all 2>/dev/null
    echo "✅ PM2 processes stopped"
else
    echo "Step 1: PM2 not found (skipping)"
fi
echo ""

# Kill all node processes on port 3006
echo "Step 2: Killing all processes on port 3006..."
PIDS=$(sudo lsof -ti :3006 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "Found PIDs: $PIDS"
    for PID in $PIDS; do
        sudo kill -9 $PID 2>/dev/null
    done
    sleep 2
    echo "✅ Processes killed"
else
    echo "✅ No processes found"
fi
echo ""

# Kill all node processes (if needed)
echo "Step 3: Checking for other node processes..."
NODE_PIDS=$(pgrep -f "vite|node.*3006" 2>/dev/null)
if [ -n "$NODE_PIDS" ]; then
    echo "Found node processes: $NODE_PIDS"
    sudo kill -9 $NODE_PIDS 2>/dev/null
    sleep 2
    echo "✅ Node processes killed"
else
    echo "✅ No other node processes found"
fi
echo ""

# Final check
echo "Step 4: Verifying port 3006 is free..."
if sudo lsof -i :3006 2>/dev/null | grep -q "LISTEN"; then
    echo "❌ Port 3006 is still in use!"
    sudo lsof -i :3006
    echo ""
    echo "Try manually:"
    echo "  sudo kill -9 \$(sudo lsof -ti :3006)"
else
    echo "✅ Port 3006 is FREE"
    echo ""
    echo "You can now start the dev server:"
    echo "  cd /home/omar/Habit/active-flow-mind"
    echo "  npm run dev"
fi
