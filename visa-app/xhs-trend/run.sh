#!/bin/bash
# 샤오홍슈 트렌드 크롤링 + 분석 실행 스크립트
# 크론잡: 매일 새벽 3시 실행
# 0 3 * * * /home/theredboat_ai/.openclaw/workspace/visa-app/xhs-trend/run.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/.venv"

# venv 활성화
source "$VENV_DIR/bin/activate"

cd "$SCRIPT_DIR"

echo "$(date '+%Y-%m-%d %H:%M:%S') — 크롤링 시작"
python3 crawler.py

# 월요일이면 주간 리포트도 생성
if [ "$(date +%u)" -eq 1 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — 주간 리포트 생성"
    python3 analyze.py
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') — 완료"
