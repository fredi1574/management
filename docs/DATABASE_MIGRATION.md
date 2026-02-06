# Database Migration Guide

## Overview

This application currently uses SQLite for development. For production deployment, you should migrate to a robust database system like PostgreSQL. This guide covers migration options and best practices.

## Current Setup (Development)

- **Database**: SQLite (`dev.db`)
- **ORM**: Prisma
- **Schema**: See `prisma/schema.prisma`

## Production Recommendations

### Option 1: PostgreSQL (Recommended)

#### Benefits
- Scalability
- Advanced features (JSON, full-text search, etc.)
- Superior concurrent access handling
- Better performance for large datasets
- Production-ready

#### Hosting Options
1. **Neon** (Serverless PostgreSQL)
   - URL: https://neon.tech
   - Setup time: 5 minutes
   - Perfect for Next.js + Vercel deployment

2. **Supabase** (PostgreSQL + Auth)
   - URL: https://supabase.com
   - Includes built-in authentication
   - Great for rapid development

3. **AWS RDS** (Managed PostgreSQL)
   - URL: https://aws.amazon.com/rds/
   - Enterprise-grade
   - More configuration required

4. **DigitalOcean** (Managed Databases)
   - URL: https://www.digitalocean.com/products/managed-databases
   - Good price/performance ratio

#### Migration Steps

##### Step 1: Create PostgreSQL Database

For Neon:
```bash
# Visit https://neon.tech and create a new project
# Copy the connection string from Neon dashboard
DATABASE_URL="postgresql://user:password@host/database"
```

##### Step 2: Update .env
```bash
# Update .env.local with PostgreSQL connection string
DATABASE_URL="postgresql://user:password@your-neon-host/database"
```

##### Step 3: Install Dependencies
```bash
npm install
```

##### Step 4: Run Prisma Migrations
```bash
# Generate Prisma client
npx prisma generate

# Create migration from current schema
npx prisma migrate dev --name init

# Apply migrations
npx prisma db push
```

##### Step 5: Seed Data (Optional)
```bash
# If you have seed script
npm run db:seed
```

##### Step 6: Verify Connection
```bash
# Test database connection
npx prisma studio

# This opens interactive database browser
```

##### Step 7: Deploy to Production
```bash
# When ready to deploy to Vercel
vercel env add DATABASE_URL
# Enter your production PostgreSQL connection string

# Deploy
vercel deploy
```

### Option 2: Neon Serverless PostgreSQL (Step-by-Step)

**Recommended for Vercel deployment**

1. **Create Neon Account**
   - Visit https://console.neon.tech
   - Sign up with GitHub or Email
   - Create a new project

2. **Get Connection String**
   - Navigate to Connection Details
   - Select "Node.js" (for Prisma)
   - Copy the full connection string

3. **Update Environment Variables**
   ```bash
   # .env.local (development)
   DATABASE_URL="postgresql://user:password@project.neon.tech/database"
   
   # Vercel (production)
   # Use Vercel dashboard Settings > Environment Variables
   ```

4. **Run Migration**
   ```bash
   # Make sure you have updated .env.local with Neon URL
   npx prisma migrate dev --name init
   ```

5. **Verify in Neon Console**
   - Visit Neon dashboard
   - See tables appear in your database

### Option 3: Supabase PostgreSQL

**Best if you need authentication too**

1. **Create Supabase Project**
   - Visit https://app.supabase.com
   - Create new project
   - Wait for database initialization

2. **Get Connection String**
   - Project Settings > Database
   - Connection string section
   - Copy for Node.js

3. **Same migration steps as Neon**

## Schema Compatibility

The current Prisma schema is compatible with PostgreSQL without changes. The schema includes:

- **Category** - Transaction categories
- **Expense** - Expense transactions
- **Income** - Income transactions  
- **StockPurchase** - Stock portfolio tracking

All tables have proper indexes and constraints defined.

## Data Migration from SQLite

If you have existing data in SQLite that you want to migrate:

### Option A: Using Prisma Migrate

```bash
# Backup SQLite first
cp dev.db dev.db.backup

# Update DATABASE_URL to PostgreSQL
# Then run:
npx prisma migrate deploy

# Data will be migrated automatically if using same schema
```

### Option B: Manual Export/Import

```bash
# Export from SQLite
sqlite3 dev.db ".dump" > data_export.sql

# This creates SQL commands that can be partially adapted for PostgreSQL
# (Some syntax changes may be needed)
```

## Environment Variables

### Development (.env.local)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/management"
NODE_ENV="development"
```

### Production (Vercel Dashboard)
```bash
DATABASE_URL="postgresql://user:password@your-production-host/database"
NODE_ENV="production"
```

## Performance Optimization

### Create Indexes
The schema includes common indexes. For additional optimization:

```sql
-- Full-text search on notes
CREATE INDEX idx_expense_notes_fts ON expense USING GIN (to_tsvector('english', notes));

-- Date range queries
CREATE INDEX idx_expense_date_range ON expense(date DESC);
CREATE INDEX idx_income_date_range ON income(date DESC);

-- Category lookups
CREATE INDEX idx_expense_category ON expense(categoryId);
CREATE INDEX idx_income_category ON income(categoryId);
```

### Connection Pooling

For better performance with serverless, use Prisma's built-in pooling:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pooling
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

## Monitoring

### Check Database Health
```bash
# Using Prisma Studio
npx prisma studio

# Using psql (if PostgreSQL local)
psql postgresql://user:password@host/database
```

### Monitor Connections (Neon)
- Dashboard > Monitoring
- Check active connections
- Review query performance

## Troubleshooting

### Connection Issues
```bash
# Test connection
npx prisma db execute --stdin < test.sql

# Check environment variable
echo $DATABASE_URL
```

### Migration Conflicts
```bash
# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# Or manually fix:
npx prisma migrate resolve --rolled-back init
```

### Performance Problems
1. Check indexes: `SELECT * FROM pg_indexes;`
2. Analyze slow queries: Enable `query_log` in PostgreSQL
3. Scale connection pool if needed

## Cost Estimates (as of 2026)

| Provider | Cost | Best For |
|----------|------|----------|
| Neon Free | $0 (5GB) | Development/hobby |
| Neon Pro | $7/month | Small projects |
| Supabase | $25/month | With auth |
| AWS RDS | $15-50/month | Enterprise |
| DigitalOcean | $12-96/month | High reliability |

## Rolling Back to SQLite

If you need to revert:

```bash
# Update .env
DATABASE_URL="file:./dev.db"

# Reset schema
npx prisma migrate reset
```

## Next Steps

1. Choose your database provider
2. Update DATABASE_URL environment variable
3. Run `npx prisma migrate dev`
4. Test the application
5. Deploy to production

For detailed Prisma documentation: https://www.prisma.io/docs/

## Support

For migration issues:
- Neon Support: https://support.neon.tech
- Supabase Support: https://supabase.com/support
- Prisma Docs: https://www.prisma.io/docs/
