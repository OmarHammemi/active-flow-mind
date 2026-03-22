#!/bin/bash
# Restart Dev Server Script

echo "=========================================="
echo "Restarting Dev Server"
echo "=========================================="
echo ""

# Kill any processes on port 3006
echo "Step 1: Killing processes on port 3006..."
PIDS=$(sudo lsof -ti :3006 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "Found processes: $PIDS"
    sudo kill -9 $PIDS 2>/dev/null
    sleep 2
    echo "✅ Processes killed"
else
    echo "✅ No processes found on port 3006"
fi

# Verify port is free
echo ""
echo "Step 2: Verifying port 3006 is free..."
if sudo lsof -i :3006 2>/dev/null | grep -q "LISTEN"; then
    echo "❌ Port 3006 is still in use!"
    sudo lsof -i :3006
    exit 1
else
    echo "✅ Port 3006 is free"
fi

# Navigate to app directory
echo ""
echo "Step 3: Starting dev server..."
cd /home/omar/Habit/active-flow-mind || exit 1

# Start dev server
echo "Running: npm run dev"
echo ""
echo "⚠️  Keep this terminal open - dev server must keep running!"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
