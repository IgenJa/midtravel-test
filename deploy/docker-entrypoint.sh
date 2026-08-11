#!/bin/sh
set -eu

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting MidTravel..."
exec node server.js
