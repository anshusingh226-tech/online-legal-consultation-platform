# Database Directory
## Online Legal Consultation & Lawyer Aggregation Platform

This directory contains database documentation, PostgreSQL migration scripts, and initialization resources.

### Contents:
- **`schema.sql`**: Full PostgreSQL DDL representing the platform database schema.
- **Prisma Migrations**: Stored in `backend/prisma/migrations/`.
- **Seed Script**: Stored in `backend/prisma/seed.ts`.

### Quick Setup:
```bash
# From the backend directory:
npx prisma migrate dev
npx tsx prisma/seed.ts
```
