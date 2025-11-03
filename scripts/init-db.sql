-- QuiFlix PostgreSQL Database Schema
-- This script will be automatically executed on Vercel deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    username VARCHAR(100),
    is_producer BOOLEAN DEFAULT false,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Films Table
CREATE TABLE IF NOT EXISTS films (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    release_date DATE NOT NULL,
    producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ipfs_hash VARCHAR(255) NOT NULL,
    metadata_ipfs_hash VARCHAR(255),
    price VARCHAR(100) NOT NULL, -- stored as string to handle BigInt
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT false,
    token_id INTEGER,
    total_views INTEGER DEFAULT 0,
    total_revenue VARCHAR(100) DEFAULT '0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    price VARCHAR(100) NOT NULL,
    gas_used VARCHAR(100) DEFAULT '0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Views Table (for tracking film views)
CREATE TABLE IF NOT EXISTS views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    duration INTEGER DEFAULT 0, -- watched duration in seconds
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Actions Log Table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'approve_film', 'reject_film', 'ban_user', etc.
    target_id UUID, -- ID of the affected entity (film, user, etc.)
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NFT Listings Table (for secondary market)
CREATE TABLE IF NOT EXISTS nft_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL,
    price VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_films_producer_id ON films(producer_id);
CREATE INDEX IF NOT EXISTS idx_films_is_active ON films(is_active);
CREATE INDEX IF NOT EXISTS idx_films_genre ON films(genre);
CREATE INDEX IF NOT EXISTS idx_films_token_id ON films(token_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_film_id ON purchases(film_id);
CREATE INDEX IF NOT EXISTS idx_purchases_token_id ON purchases(token_id);
CREATE INDEX IF NOT EXISTS idx_views_viewer_id ON views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_views_film_id ON views(film_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_nft_listings_seller_id ON nft_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_nft_listings_film_id ON nft_listings(film_id);
CREATE INDEX IF NOT EXISTS idx_nft_listings_is_active ON nft_listings(is_active);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_films_updated_at BEFORE UPDATE ON films
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
