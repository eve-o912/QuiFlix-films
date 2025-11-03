# 🚀 Fully Automated Database Setup - Zero Manual Steps

## Overview

QuiFlix now has **100% automated database setup** - no manual database creation needed! The system automatically:

1. ✅ Creates Postgres database in Vercel (if doesn't exist)
2. ✅ Links database to your project
3. ✅ Configures all environment variables
4. ✅ Creates all database tables
5. ✅ Ready for film uploads immediately

## How It Works

### Deployment Flow

```
Push to Vercel
    ↓
Build starts
    ↓
npm run db:setup
    ↓
1. Check for database URL → Not found
    ↓
2. Run create-vercel-db.js
    ↓
3. Call Vercel API to create database
    ↓
4. Link database to project
    ↓
5. Vercel auto-injects environment variables:
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL
   - POSTGRES_USER
   - POSTGRES_HOST
   - POSTGRES_PASSWORD
   - POSTGRES_DATABASE
    ↓
6. Connect to database
    ↓
7. Check if tables exist → No
    ↓
8. Execute init-db.sql
    ↓
9. Create all 6 tables
    ↓
Build completes ✅
    ↓
Application ready with working database!
```

## One-Time Setup (Required)

To enable automatic database creation, you need to provide a Vercel API token:

### Step 1: Get Your Vercel API Token

1. Go to: https://vercel.com/account/tokens
2. Click **Create Token**
3. Name it: `QuiFlix Database Auto-Setup`
4. Set scope: **Full Account**
5. Copy the token (save it securely!)

### Step 2: Add Token to Vercel Project

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `VERCEL_TOKEN`
   - **Value**: `<paste your token>`
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**

### Step 3: (Optional) Add Project ID

For automatic linking, also add:
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: Get from project settings URL or run `vercel project ls`
- **Environments**: Check all

### Step 4: Deploy!

```bash
git add .
git commit -m "Add fully automated database setup"
git push origin paul
```

**That's it!** The database will be created automatically during deployment.

## What Gets Created Automatically

### Database Configuration
- **Name**: `quiflix-db`
- **Type**: PostgreSQL
- **Region**: US East (iad1) or specify via `VERCEL_REGION` env var
- **Connection**: Pooling enabled (max 20 connections)

### Database Tables (6 total)

| Table | Purpose | Auto-Created Fields |
|-------|---------|-------------------|
| `users` | User profiles | id (UUID), wallet_address, email, username, role, created_at |
| `films` | Film metadata | id (UUID), title, description, ipfs_hash, producer_id, price, created_at |
| `purchases` | Purchase records | id (UUID), user_id, film_id, price, transaction_hash, purchased_at |
| `views` | View tracking | id (UUID), user_id, film_id, duration, viewed_at |
| `nft_listings` | NFT marketplace | id (UUID), film_id, token_id, price, seller_address, created_at |
| `admin_actions` | Audit log | id (UUID), admin_id, action_type, target_id, details, created_at |

### Environment Variables (Auto-Injected by Vercel)
- `POSTGRES_URL` - Connection string with pooling
- `POSTGRES_PRISMA_URL` - Direct connection for migrations
- `POSTGRES_URL_NON_POOLING` - Non-pooled connection
- `POSTGRES_USER` - Database username
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

## Build Logs - What to Expect

### First Deployment (No Database)

```
🚀 Starting fully automated database setup...

🔧 Database URL not found. Attempting automatic creation...

═══════════════════════════════════════════════════════════
  🎬 QuiFlix Automatic Database Setup
═══════════════════════════════════════════════════════════

🔍 Checking for existing Postgres databases...
🚀 Creating Postgres database automatically...
✅ Database created successfully!
   Name: quiflix-db
   ID: store_abc123xyz
   Region: iad1

🔗 Linking database to project...
✅ Database linked to project successfully!

🔑 Retrieving database credentials...
✅ Database credentials available as:
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL
   - POSTGRES_URL_NON_POOLING
   - POSTGRES_USER
   - POSTGRES_HOST
   - POSTGRES_PASSWORD
   - POSTGRES_DATABASE

═══════════════════════════════════════════════════════════
  🎉 Database Setup Complete!
═══════════════════════════════════════════════════════════

✅ Database created and configured automatically
✅ Environment variables set automatically by Vercel
✅ Tables will be created during next build

✅ Database created successfully! Continuing with setup...

✅ Database URL already available
✅ Successfully connected to PostgreSQL database
📊 Found 0/6 tables. Creating missing tables...
🔨 Executing database schema...
✅ Database schema created successfully!

📋 Database tables:
   ✓ admin_actions
   ✓ films
   ✓ nft_listings
   ✓ purchases
   ✓ users
   ✓ views

🎉 Database initialization completed successfully!
```

### Second Deployment (Database Exists)

```
🚀 Starting fully automated database setup...

✅ Database URL already available
✅ Successfully connected to PostgreSQL database
⚠️  Database already initialized (all 6 tables exist)
   Skipping setup to avoid conflicts.

Existing tables:
   ✓ admin_actions
   ✓ films
   ✓ nft_listings
   ✓ purchases
   ✓ users
   ✓ views

🎉 Database initialization completed successfully!
```

## Local Development

For local development, you can pull the environment variables:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables (includes POSTGRES_URL)
vercel env pull

# Now you can run locally with database access
npm run dev
```

## Verifying the Setup

### Check Database in Vercel Dashboard

1. Go to your Vercel project
2. Click **Storage** tab
3. You should see `quiflix-db` listed
4. Click on it to see:
   - Connection details
   - Query interface
   - Usage metrics

### Test Database Connection

```bash
# Pull env vars
vercel env pull

# Test connection
node -e "require('@vercel/postgres').createPool({connectionString: process.env.POSTGRES_URL}).connect().then(() => console.log('✅ Connected!')).catch(e => console.error('❌ Failed:', e.message))"
```

### Verify Tables

In Vercel Dashboard → Storage → quiflix-db → Query tab:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should return 6 tables.

## Troubleshooting

### ❌ "VERCEL_TOKEN not found"

**Solution**: Add your Vercel API token to environment variables (see Step 2 above)

### ❌ "API Error: Invalid token"

**Solution**: 
1. Token might be expired - create a new one
2. Ensure token has correct permissions (Full Account scope)

### ⚠️ "Could not link database"

**Solution**: 
- Add `VERCEL_PROJECT_ID` environment variable
- Or link manually in Vercel Dashboard → Storage → Link to Project

### ❌ "Database creation failed"

**Possible causes**:
1. **Quota limit**: Check your Vercel plan limits
2. **Region unavailable**: Try different region by setting `VERCEL_REGION`
3. **API rate limit**: Wait a few minutes and redeploy

**Fallback**: Create database manually in Vercel Dashboard if automatic creation fails

## Manual Override (If Needed)

If automatic creation isn't working, you can still create manually:

1. Vercel Dashboard → Storage → Create Database → Postgres
2. Name it: `quiflix-db`
3. Select region
4. Click Create

The setup script will detect the existing database and skip creation.

## Environment Variables Reference

### Required for Auto-Creation
- `VERCEL_TOKEN` - Your Vercel API token (from account settings)

### Optional
- `VERCEL_PROJECT_ID` - For automatic database linking
- `VERCEL_REGION` - Preferred region (default: iad1)
- `VERCEL_TEAM_ID` - For team/organization accounts

### Auto-Generated by Vercel
- `POSTGRES_URL` - Main connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible URL
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `POSTGRES_USER` - Database user
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

## Security Best Practices

✅ **Token Security**
- Never commit tokens to Git
- Use Vercel's environment variables (encrypted at rest)
- Rotate tokens periodically

✅ **Database Security**
- SSL/TLS encryption enabled automatically
- Vercel-managed credentials
- No public access (Vercel network only)

✅ **Connection Security**
- Connection pooling (prevents exhaustion)
- 30-second idle timeout
- Max 20 concurrent connections

## Commands Reference

```bash
# Setup database (automatic creation + tables)
npm run db:setup

# Build with automatic setup
npm run build

# Manual database migration
npm run db:migrate

# Check if database exists
vercel env pull
echo $POSTGRES_URL  # Should show connection string

# Test local connection
npm run dev
```

## File Structure

```
QuiFlix-films/
├── scripts/
│   ├── create-vercel-db.js    ← Automatic database creation via Vercel API
│   ├── setup-db.js             ← Orchestrates creation + table initialization
│   └── init-db.sql             ← SQL schema (6 tables)
├── lib/
│   └── database.ts             ← Database service layer (auto-detects URL)
├── app/api/films/
│   └── route.ts                ← Film upload API (uses database)
└── package.json                ← Build script runs db:setup
```

## Summary

🎯 **Your database is now 100% automated:**

- ✅ No manual database creation needed
- ✅ No manual environment variable setup
- ✅ No manual table creation
- ✅ Works seamlessly on every deploy
- ✅ Self-healing (checks and creates what's missing)
- ✅ Idempotent (safe to run multiple times)

**Just add `VERCEL_TOKEN` once, then push and deploy!** 🚀

Everything else happens automatically.
