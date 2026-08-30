#!/usr/bin/env bash
# ========================================================
#          AgriComply AI - Mac / Linux 1-Click Launcher
# ========================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "          AgriComply AI - Universal Launcher"
echo "========================================================"
echo ""

# Check dependencies
if [ ! -d "server/node_modules" ]; then
    echo "[Setup] Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "[Setup] Installing client dependencies..."
    cd client && npm install && cd ..
fi

# 1. Start Python ML microservice
echo "[1/3] Starting Python ML Microservice (Port 5001)..."
cd "$SCRIPT_DIR/ml_service" && python3 app.py &
ML_PID=$!
sleep 2

# 2. Start Node.js backend
echo "[2/3] Starting Node.js Backend Server (Port 5000)..."
cd "$SCRIPT_DIR/server" && npm start &
NODE_PID=$!
sleep 2

# 3. Start React frontend
echo "[3/3] Starting React Frontend Client (Port 3000)..."
cd "$SCRIPT_DIR/client" && npm run dev &
CLIENT_PID=$!

echo ""
echo "========================================================"
echo " All 3 Services Are Running!"
echo " -------------------------------------------------------"
echo " - Frontend Web UI:  http://localhost:3000"
echo " - Backend API:      http://localhost:5000"
echo " - Python ML Engine: http://localhost:5001"
echo "========================================================"
echo ""

# Open Browser (cross-platform)
if which xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif which open > /dev/null; then
    open http://localhost:3000
fi

# Trap cleanup on Ctrl+C
trap "kill $ML_PID $NODE_PID $CLIENT_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT
wait
