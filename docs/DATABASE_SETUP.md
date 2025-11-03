# QuiFlix PostgreSQL Database Setup Guide

## Overview

This guide explains how to set up the automated PostgreSQL database for the QuiFlix platform on Vercel. The database will automatically initialize during deployment.

## Architecture

The QuiFlix platform uses PostgreSQL as its primary database with the following tables:

- **users**: Stores user accounts and wallet addresses
- **films**: Stores film metadata and IPFS hashes
- **purchases**: Tracks NFT purchases
- **views**: Tracks film viewing statistics
- **nft_listings**: Manages secondary market listings
- **admin_actions**: Logs administrative actions

## Setup Instructions

### 1. Create Vercel Postgres Database

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name for your database (e.g., `quiflix-db`)
7. Select your preferred region
8. Click **Create**

### 2. Environment Variables

Vercel will automatically add the `POSTGRES_URL` environment variable to your project. You can verify this:

1. Go to **Settings** > **Environment Variables**
2. Confirm `POSTGRES_URL` is present
3. It should look like: `postgres://user:password@host:port/database?sslmode=require`

**Additional Required Environment Variables:**

```env
# PostgreSQL (Auto-added by Vercel)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Backend URL
BACKEND_URL=https://your-backend-url.vercel.app

# Firebase (if still using for some features)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# IPFS/Pinata
PINATA_JWT=your-pinata-jwt
PINATA_GATEWAY=your-gateway-url

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
NEXT_PUBLIC_CHAIN_ID=your-chain-id
```

### 3. Automatic Database Initialization

The database will automatically initialize when you deploy to Vercel. The deployment process will:

1. Install dependencies (`npm install`)
2. Run `db:setup` script (creates tables and indexes)
3. Build the Next.js application
4. Deploy to Vercel

**Build Command (in Vercel):**
```bash
npm run build
```

This automatically runs `npm run db:setup && next build`

### 4. Manual Database Setup (Local Development)

For local development:

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
cp .env.example .env.local

# 3. Add your Vercel Postgres URL
POSTGRES_URL=postgres://...

# 4. Run database setup
npm run db:setup

# 5. Start development server
npm run dev
```

### 5. Database Schema

The database schema is defined in `scripts/init-db.sql` and includes:

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    username VARCHAR(100),
    is_producer BOOLEAN DEFAULT false,
    profile_image TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Films Table
```sql
CREATE TABLE films (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,
    release_date DATE NOT NULL,
    producer_id UUID REFERENCES users(id),
    ipfs_hash VARCHAR(255) NOT NULL,
    metadata_ipfs_hash VARCHAR(255),
    price VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT false,
    token_id INTEGER,
    total_views INTEGER DEFAULT 0,
    total_revenue VARCHAR(100) DEFAULT '0',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Usage in Code

### Importing the Database Service

```typescript
import db from '@/lib/database';

// User operations
const user = await db.users.create('user@example.com', '0x123...', 'username');
const existingUser = await db.users.findByWalletAddress('0x123...');

// Film operations
const film = await db.films.create({
  title: 'My Film',
  description: 'A great film',
  genre: 'Action',
  duration: 7200,
  releaseDate: new Date(),
  producerId: user.id,
  ipfsHash: 'Qm...',
  price: '0.01'
});

// Get all films
const films = await db.films.findAll({ limit: 10, offset: 0 });

// Purchase operations
const purchase = await db.purchases.create({
  buyerId: user.id,
  filmId: film.id,
  tokenId: 1,
  transactionHash: '0x...',
  price: '0.01'
});
```

### Example: Upload Film with Database

```typescript
// In your API route
import db from '@/lib/database';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const walletAddress = request.headers.get('x-wallet-address');
    
    // Find or create user
    let user = await db.users.findByWalletAddress(walletAddress);
    if (!user) {
      user = await db.users.create('', walletAddress, '', true);
    }
    
    // Upload to IPFS (your existing logic)
    const ipfsHash = await uploadToIPFS(formData.get('filmFile'));
    
    // Create film in database
    const film = await db.films.create({
      title: formData.get('title'),
      description: formData.get('description'),
      genre: formData.get('genre'),
      duration: parseInt(formData.get('duration')),
      releaseDate: new Date(formData.get('releaseDate')),
      producerId: user.id,
      ipfsHash: ipfsHash,
      price: formData.get('price'),
      thumbnailUrl: thumbnailUrl,
    });
    
    return Response.json({ success: true, film });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## Monitoring and Maintenance

### Check Database Connection

```typescript
import db from '@/lib/database';

const isConnected = await db.checkConnection();
console.log('Database connected:', isConnected);
```

### View Database in Vercel

1. Go to your Vercel project
2. Navigate to **Storage**
3. Click on your Postgres database
4. Use the **Data** tab to view tables
5. Use the **Query** tab to run SQL queries

### Common Queries

```sql
-- Count total films
SELECT COUNT(*) FROM films;

-- Get active films
SELECT * FROM films WHERE is_active = true ORDER BY created_at DESC LIMIT 10;

-- Get total revenue by producer
SELECT 
  u.username, 
  SUM(CAST(f.total_revenue AS NUMERIC)) as total_revenue
FROM films f
JOIN users u ON f.producer_id = u.id
GROUP BY u.id, u.username
ORDER BY total_revenue DESC;

-- Get film analytics
SELECT 
  f.title,
  f.total_views,
  COUNT(p.id) as purchases,
  f.total_revenue
FROM films f
LEFT JOIN purchases p ON f.id = p.film_id
GROUP BY f.id, f.title, f.total_views, f.total_revenue
ORDER BY f.total_views DESC;
```

## Troubleshooting

### Database Connection Issues

1. **Check environment variable**: Ensure `POSTGRES_URL` is set correctly
2. **Check SSL settings**: Production requires SSL, development might not
3. **Check connection pool**: Ensure the pool hasn't exceeded max connections

### Migration Issues

If the database setup fails during deployment:

1. Check Vercel deployment logs
2. Manually run the setup script:
   ```bash
   node scripts/setup-db.js
   ```
3. Check for SQL syntax errors in `scripts/init-db.sql`

### Performance Issues

1. **Add indexes**: Already included for common queries
2. **Use connection pooling**: Configured in `lib/database.ts`
3. **Optimize queries**: Use EXPLAIN ANALYZE in PostgreSQL

## Security Best Practices

1. ✅ **Never commit** `.env` or `.env.local` files
2. ✅ **Use environment variables** for all sensitive data
3. ✅ **Enable SSL** in production (automatic with Vercel Postgres)
4. ✅ **Sanitize inputs** to prevent SQL injection (using parameterized queries)
5. ✅ **Limit connection pool** to avoid overwhelming the database

## Next Steps

1. Deploy to Vercel - database will auto-initialize
2. Test film upload functionality
3. Monitor database performance in Vercel dashboard
4. Set up backups (automatic with Vercel Postgres)

## Support

For issues:
- Check Vercel deployment logs
- Review database query logs in Vercel dashboard
- Consult [Vercel Postgres documentation](https://vercel.com/docs/storage/vercel-postgres)
