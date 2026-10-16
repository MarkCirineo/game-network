#!/bin/sh
# ============================================================
# ArcadeKit — Nightly Postgres backups
# Runs in the "backup" container (docker/docker-compose.yml).
# Dumps the database right away, then every day at BACKUP_HOUR
# (UTC), and deletes dumps older than BACKUP_KEEP_DAYS.
#
#   sh backup-db.sh        loop forever (the container's default)
#   sh backup-db.sh once   one dump, then exit
#
# Connection comes from the standard PGHOST / PGUSER / PGPASSWORD /
# PGDATABASE variables. Restore steps are in README.md.
# ============================================================
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-3}"

dump() {
  stamp=$(date -u +%Y-%m-%dT%H%MZ)
  file="$BACKUP_DIR/arcadekit-$stamp.dump"
  # Write to a temp name first so a half-written dump never looks complete
  if pg_dump --format=custom --file="$file.partial"; then
    mv "$file.partial" "$file"
    echo "[backup] wrote $file ($(du -h "$file" | cut -f1))"
  else
    rm -f "$file.partial"
    echo "[backup] pg_dump failed" >&2
    return 1
  fi
  find "$BACKUP_DIR" -name 'arcadekit-*.dump' -mtime +"$KEEP_DAYS" -print -delete
}

mkdir -p "$BACKUP_DIR"

if [ "${1:-}" = "once" ]; then
  dump
  exit
fi

# A failed dump is logged and retried the next day rather than
# stopping the container
dump || true
while true; do
  now=$(date -u +%s)
  next=$(( now - now % 86400 + HOUR * 3600 ))
  [ "$next" -le "$now" ] && next=$(( next + 86400 ))
  sleep $(( next - now ))
  dump || true
done
