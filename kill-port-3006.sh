#!/bin/bash
# Kill all processes on port 3006

echo "Killing all processes on port 3006..."

# Find all PIDs using port 3006
PIDS=$(sudo lsof -ti :3006 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ No processes found on port 3006"
    exit 0
fi

echo "Found processes: $PIDS"

# Kill them all
for PID in $PIDS; do
    echo "Killing PID: $PID"
    sudo kill -9 $PID 2>/dev/null
done

# Wait a moment
sleep 2

# Verify
REMAINING=$(sudo lsof -ti :3006 2>/dev/null)
if [ -z "$REMAINING" ]; then
    echo "✅ Port 3006 is now FREE"
    echo ""
    echo "You can now start the dev server:"
    echo "  cd /home/omar/Habit/active-flow-mind"
    echo "  npm run dev"
else
    echo "❌ Some processes still running: $REMAINING"
    echo "Try: sudo kill -9 $REMAINING"
fi
