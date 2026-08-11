#!/usr/bin/env bash
# Bare-metal / PM2 deploy helper for a Rackhost VPS (no Docker).
# Usage on the server, from the app directory:
#   ./deploy/pm2-deploy.sh

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client + building"
npm run build

echo "==> Running migrations"
npx prisma migrate deploy

echo "==> Restarting PM2 process"
if pm2 describe midtravel >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --update-env
else
  pm2 start deploy/ecosystem.config.cjs
fi

pm2 save
echo "==> Done"
