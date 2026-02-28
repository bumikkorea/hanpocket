#!/bin/bash
# HanPocket 자동 시작 스크립트
# - npm run dev (포트 3000)
# - code tunnel (원격 접속)

PROJECT_DIR="$HOME/.openclaw/workspace/visa-app"
CODE_BIN="$PROJECT_DIR/hanpocket/visa-app/code"
LOG_DIR="$HOME/.hanpocket-logs"
mkdir -p "$LOG_DIR"

# npm run dev
if ! pgrep -f "vite.*--port 3000" > /dev/null 2>&1; then
  echo "[$(date)] Starting npm run dev..."
  cd "$PROJECT_DIR"
  nohup npm run dev > "$LOG_DIR/dev-server.log" 2>&1 &
  echo "[$(date)] Dev server started (PID: $!)"
else
  echo "[$(date)] Dev server already running"
fi

# code tunnel
if ! pgrep -f "code tunnel" > /dev/null 2>&1; then
  echo "[$(date)] Starting code tunnel..."
  cd "$(dirname "$CODE_BIN")"
  nohup "$CODE_BIN" tunnel > "$LOG_DIR/code-tunnel.log" 2>&1 &
  echo "[$(date)] Code tunnel started (PID: $!)"
else
  echo "[$(date)] Code tunnel already running"
fi

echo "[$(date)] ✅ All services started"
echo "  Dev server log: $LOG_DIR/dev-server.log"
echo "  Code tunnel log: $LOG_DIR/code-tunnel.log"
