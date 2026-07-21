#!/usr/bin/env bash
# Auto-deploy: si main en GitHub cambió, corre deploy.sh
set -euo pipefail
APP_DIR=/opt/apps/18-59
LOCK=/tmp/1859-deploy.lock
LOG=/var/log/1859-autodeploy.log
exec 9>"$LOCK"
flock -n 9 || exit 0
cd "$APP_DIR"
git fetch --quiet origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
[ "$LOCAL" = "$REMOTE" ] && exit 0
echo "$(date -u +%FT%TZ) change $LOCAL -> $REMOTE" >>"$LOG"
git reset --hard origin/main
chmod +x deploy/deploy.sh deploy/auto-pull.sh
bash deploy/deploy.sh >>"$LOG" 2>&1
echo "$(date -u +%FT%TZ) done" >>"$LOG"
