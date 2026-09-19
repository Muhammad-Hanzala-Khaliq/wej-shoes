# Backup & Recovery

## Database (Neon)

- Neon free tier provides automatic backups with a 6-hour history window
- 1 snapshot available — create before major migrations
- To create snapshot: Neon Console → Project → Snapshots → Create
- To restore: Neon Console → Snapshots → Restore to branch

## Images (Cloudinary)

- All product images stored in Cloudinary (not local)
- Cloudinary free tier: 25 GB credits
- Images recoverable via Cloudinary Media Library
- No local uploads exist in codebase

## Seed Data

- Run: `npx prisma db seed`
- Seeds: categories, sample admin user, sample products, sample order
- Safe to re-run (uses upsert)

## Disaster Recovery Steps

1. **DB corrupted**: Restore from Neon snapshot or re-seed
2. **Images missing**: Re-upload via Cloudinary dashboard
3. **Full rebuild**: Clone repo → `npm install` → copy `.env` → `npx prisma migrate deploy` → `npx prisma db seed`
