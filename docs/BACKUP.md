# Database Backup & Restore Guide

## Neon PostgreSQL Backups

### Automatic Backups (Neon Free Tier)

Neon automatically creates backups for all projects. Free tier includes:

- **Point-in-time restore** (PITR): Available on paid plans only
- **Daily backups**: Retained for 7 days (free) or 30 days (paid)
- **Branch-level snapshots**: Each branch has its own backup

### Creating a Backup Branch

```bash
# Using Neon CLI
neon branches create --project-id <project-id> --name backup-$(date +%Y%m%d)

# Or via Neon Console:
# 1. Go to your project dashboard
# 2. Click "Branches" in the sidebar
# 3. Click "Create Branch"
# 4. Name it "backup-YYYYMMDD"
# 5. Select "From current main" as the source
```

### Point-in-Time Restore (Paid Plans Only)

```bash
# Restore to a specific timestamp
neon branches restore --project-id <project-id> \
  --branch <branch-id> \
  --timestamp "2025-06-15T10:30:00Z"

# Or via Neon Console:
# 1. Go to your project dashboard
# 2. Click "Branches"
# 3. Select the branch to restore
# 4. Click "Restore" → "Point-in-time restore"
# 5. Choose the timestamp
```

### pg_dump Export (Manual Backup)

```bash
# Full database dump
pg_dump $DATABASE_URL -f backup-$(date +%Y%m%d).sql

# Schema only (no data)
pg_dump --schema-only $DATABASE_URL -f schema-$(date +%Y%m%d).sql

# Data only (no schema)
pg_dump --data-only $DATABASE_URL -f data-$(date +%Y%m%d).sql

# Custom format (compressed, recommended for large databases)
pg_dump -Fc $DATABASE_URL -f backup-$(date +%Y%m%d).dump

# With specific tables
pg_dump $DATABASE_URL -t users -t orders -f partial-backup.sql
```

### Restoring from pg_dump

```bash
# Restore from SQL dump
psql $DATABASE_URL -f backup-20250615.sql

# Restore from custom format
pg_restore -d $DATABASE_URL backup-20250615.dump

# Restore specific tables
pg_restore -d $DATABASE_URL -t users backup-20250615.dump
```

### Backup Schedule Recommendation

| Frequency | Method | Retention |
|-----------|--------|-----------|
| Daily | Neon automatic | 7 days (free) / 30 days (paid) |
| Weekly | pg_dump to local | 4 weeks |
| Before migrations | pg_dump + branch | Keep until next backup |
| Monthly | pg_dump to cloud storage | 12 months |

### Automated Backup Script

Create a `scripts/backup.sh` file:

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" -f "$BACKUP_FILE" --verbose

echo "Compressing..."
gzip "$BACKUP_FILE"

echo "Backup complete: ${BACKUP_FILE}.gz"
echo "Size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"

# Keep only last 30 backups
cd "$BACKUP_DIR"
ls -t backup-*.sql.gz | tail -n +31 | xargs -r rm
echo "Cleanup complete. Remaining backups:"
ls -la backup-*.sql.gz 2>/dev/null || echo "  (none)"
```

Make it executable:
```bash
chmod +x scripts/backup.sh
```

Run manually or via cron:
```bash
# Weekly backup (every Sunday at 2 AM)
0 2 * * 0 cd /path/to/project && ./scripts/backup.sh
```
