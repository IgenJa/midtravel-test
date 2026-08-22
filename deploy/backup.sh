#!/usr/bin/env bash
# MidTravel backup — Postgres (pg_dump custom format) + uploads tarball.
#
# Usage (from the repo root, or anywhere; the script cds to the repo):
#   ./deploy/backup.sh
#   BACKUP_MODE=local ./deploy/backup.sh
#   BACKUP_DIR=/var/backups/midtravel BACKUP_RETENTION_DAYS=14 ./deploy/backup.sh
#
# Modes:
#   compose  docker compose exec into `db` + `app` (default if the db service is up)
#   local    host pg_dump + tar of UPLOAD_DIR (PM2 / bare-metal)
#
# Cron (daily 03:15, after TLS/app are quiet):
#   15 3 * * * /var/www/midtravel/deploy/backup.sh >> /var/log/midtravel-backup.log 2>&1
#
# Restore (destructive — stop the app first, confirm you have the right dump):
#   # Compose:
#   docker compose exec -T db pg_restore --clean --if-exists --no-owner --no-acl \
#     -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backups/<stamp>/db.dump
#   docker compose exec -T app sh -c 'rm -rf /app/uploads/*'
#   docker compose exec -T app tar -C /app/uploads -xzf - < backups/<stamp>/uploads.tar.gz
#   # Local:
#   pg_restore --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" backups/<stamp>/db.dump
#   tar -C "$UPLOAD_DIR" -xzf backups/<stamp>/uploads.tar.gz

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
POSTGRES_USER="${POSTGRES_USER:-midtravel}"
POSTGRES_DB="${POSTGRES_DB:-midtravel}"
UPLOAD_DIR="${UPLOAD_DIR:-$ROOT/uploads}"

if [[ -n "${UPLOAD_DIR}" && "${UPLOAD_DIR}" != /* ]]; then
  UPLOAD_DIR="$ROOT/$UPLOAD_DIR"
fi

detect_mode() {
  if [[ -n "${BACKUP_MODE:-}" ]]; then
    echo "$BACKUP_MODE"
    return
  fi
  if command -v docker >/dev/null 2>&1 \
    && docker compose ps --status running --services 2>/dev/null | grep -qx db; then
    echo compose
    return
  fi
  echo local
}

BACKUP_MODE="$(detect_mode)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$BACKUP_DIR/$STAMP"

mkdir -p "$DEST"

echo "==> MidTravel backup $STAMP (mode=$BACKUP_MODE)"
echo "    dest=$DEST"

dump_compose() {
  docker compose exec -T \
    -e PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}" \
    db \
    pg_dump \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      --no-owner \
      --no-acl \
      --format=custom \
      --compress=9 \
    > "$DEST/db.dump"
}

dump_local() {
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "pg_dump not found. Install postgresql-client, or use BACKUP_MODE=compose." >&2
    exit 1
  fi

  local uri="${DATABASE_URL:-}"
  if [[ -z "$uri" ]]; then
    echo "DATABASE_URL is not set." >&2
    exit 1
  fi
  uri="${uri%%\?*}"

  pg_dump \
    --dbname="$uri" \
    --no-owner \
    --no-acl \
    --format=custom \
    --compress=9 \
    --file="$DEST/db.dump"
}

uploads_compose() {
  docker compose exec -T app tar -C /app/uploads -czf - . > "$DEST/uploads.tar.gz"
}

uploads_local() {
  if [[ ! -d "$UPLOAD_DIR" ]]; then
    echo "    uploads: $UPLOAD_DIR missing — writing empty archive"
    mkdir -p "$UPLOAD_DIR"
  fi
  tar -C "$UPLOAD_DIR" -czf "$DEST/uploads.tar.gz" .
}

case "$BACKUP_MODE" in
  compose)
    dump_compose
    uploads_compose
    ;;
  local)
    dump_local
    uploads_local
    ;;
  *)
    echo "Unknown BACKUP_MODE=$BACKUP_MODE (use compose or local)" >&2
    exit 1
    ;;
esac

if [[ ! -s "$DEST/db.dump" ]]; then
  echo "pg_dump produced an empty file" >&2
  rm -rf "$DEST"
  exit 1
fi

if [[ ! -s "$DEST/uploads.tar.gz" ]]; then
  echo "uploads archive is empty or missing" >&2
  rm -rf "$DEST"
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  (cd "$DEST" && sha256sum db.dump uploads.tar.gz > SHA256SUMS)
elif command -v shasum >/dev/null 2>&1; then
  (cd "$DEST" && shasum -a 256 db.dump uploads.tar.gz > SHA256SUMS)
fi

echo "    db.dump $(wc -c < "$DEST/db.dump" | tr -d ' ') bytes"
echo "    uploads.tar.gz $(wc -c < "$DEST/uploads.tar.gz" | tr -d ' ') bytes"

if [[ "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ ]] && [[ "$BACKUP_RETENTION_DAYS" -gt 0 ]]; then
  echo "==> Pruning backups older than ${BACKUP_RETENTION_DAYS} days"
  find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*' \
    -mtime +"$BACKUP_RETENTION_DAYS" -print -exec rm -rf {} +
fi

echo "==> Done"
