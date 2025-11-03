/**
 * PostgreSQL Database Service
 * Handles all database operations for the QuiFlix platform
 */

import { Pool, QueryResult } from 'pg';

// Automatically detect database URL from Vercel environment variables
const getDatabaseUrl = () => {
  return process.env.POSTGRES_URL || 
         process.env.DATABASE_URL || 
         process.env.POSTGRES_PRISMA_URL ||
         process.env.POSTGRES_URL_NON_POOLING;
};

// Create a connection pool
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// User operations
export const dbUsers = {
  async create(email: string, walletAddress?: string, username?: string, isProducer: boolean = false) {
    const query = `
      INSERT INTO users (email, wallet_address, username, is_producer)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [email, walletAddress, username, isProducer]);
    return result.rows[0];
  },

  async findByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async findByWalletAddress(walletAddress: string) {
    const query = 'SELECT * FROM users WHERE wallet_address = $1';
    const result = await pool.query(query, [walletAddress]);
    return result.rows[0];
  },

  async findById(id: string) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async update(id: string, updates: any) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  },
};

// Film operations
export const dbFilms = {
  async create(filmData: any) {
    const query = `
      INSERT INTO films (
        title, description, genre, duration, release_date, 
        producer_id, ipfs_hash, metadata_ipfs_hash, price, 
        thumbnail_url, is_active, token_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      filmData.title,
      filmData.description,
      filmData.genre,
      filmData.duration,
      filmData.releaseDate,
      filmData.producerId,
      filmData.ipfsHash,
      filmData.metadataIpfsHash,
      filmData.price,
      filmData.thumbnailUrl,
      filmData.isActive || false,
      filmData.tokenId || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id: string) {
    const query = `
      SELECT f.*, u.username as producer_username, u.wallet_address as producer_wallet
      FROM films f
      LEFT JOIN users u ON f.producer_id = u.id
      WHERE f.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async findByTokenId(tokenId: number) {
    const query = 'SELECT * FROM films WHERE token_id = $1';
    const result = await pool.query(query, [tokenId]);
    return result.rows[0];
  },

  async findAll(filters: any = {}) {
    let query = `
      SELECT f.*, u.username as producer_username, u.wallet_address as producer_wallet
      FROM films f
      LEFT JOIN users u ON f.producer_id = u.id
      WHERE f.is_active = true
    `;
    const values: any[] = [];
    let paramCount = 1;

    if (filters.genre) {
      query += ` AND f.genre = $${paramCount}`;
      values.push(filters.genre);
      paramCount++;
    }

    if (filters.producerId) {
      query += ` AND f.producer_id = $${paramCount}`;
      values.push(filters.producerId);
      paramCount++;
    }

    query += ' ORDER BY f.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  async update(id: string, updates: any) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    
    const query = `
      UPDATE films 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  },

  async incrementViews(id: string) {
    const query = `
      UPDATE films 
      SET total_views = total_views + 1
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async updateRevenue(id: string, additionalRevenue: string) {
    const query = `
      UPDATE films 
      SET total_revenue = (CAST(total_revenue AS NUMERIC) + CAST($2 AS NUMERIC))::TEXT
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, additionalRevenue]);
    return result.rows[0];
  },

  async getProducerFilms(producerId: string) {
    const query = `
      SELECT * FROM films 
      WHERE producer_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [producerId]);
    return result.rows;
  },
};

// Purchase operations
export const dbPurchases = {
  async create(purchaseData: any) {
    const query = `
      INSERT INTO purchases (
        buyer_id, film_id, token_id, transaction_hash, 
        price, gas_used
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      purchaseData.buyerId,
      purchaseData.filmId,
      purchaseData.tokenId,
      purchaseData.transactionHash,
      purchaseData.price,
      purchaseData.gasUsed || '0',
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByBuyer(buyerId: string) {
    const query = `
      SELECT p.*, f.title as film_title, f.thumbnail_url
      FROM purchases p
      LEFT JOIN films f ON p.film_id = f.id
      WHERE p.buyer_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [buyerId]);
    return result.rows;
  },

  async findByFilm(filmId: string) {
    const query = `
      SELECT p.*, u.username, u.wallet_address
      FROM purchases p
      LEFT JOIN users u ON p.buyer_id = u.id
      WHERE p.film_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [filmId]);
    return result.rows;
  },

  async countByFilm(filmId: string) {
    const query = 'SELECT COUNT(*) as count FROM purchases WHERE film_id = $1';
    const result = await pool.query(query, [filmId]);
    return parseInt(result.rows[0].count);
  },
};

// View operations
export const dbViews = {
  async create(viewData: any) {
    const query = `
      INSERT INTO views (viewer_id, film_id, duration, completed)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      viewData.viewerId,
      viewData.filmId,
      viewData.duration || 0,
      viewData.completed || false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async update(id: string, duration: number, completed: boolean) {
    const query = `
      UPDATE views 
      SET duration = $2, completed = $3
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, duration, completed]);
    return result.rows[0];
  },

  async findByFilm(filmId: string) {
    const query = `
      SELECT v.*, u.username, u.wallet_address
      FROM views v
      LEFT JOIN users u ON v.viewer_id = u.id
      WHERE v.film_id = $1
      ORDER BY v.created_at DESC
    `;
    const result = await pool.query(query, [filmId]);
    return result.rows;
  },

  async getStats(filmId: string) {
    const query = `
      SELECT 
        COUNT(*) as total_views,
        AVG(duration) as avg_duration,
        COUNT(*) FILTER (WHERE completed = true) as completed_views
      FROM views 
      WHERE film_id = $1
    `;
    const result = await pool.query(query, [filmId]);
    return result.rows[0];
  },
};

// NFT Listing operations
export const dbListings = {
  async create(listingData: any) {
    const query = `
      INSERT INTO nft_listings (seller_id, film_id, token_id, price, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      listingData.sellerId,
      listingData.filmId,
      listingData.tokenId,
      listingData.price,
      true,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findActive() {
    const query = `
      SELECT l.*, f.title, f.thumbnail_url, u.username as seller_username
      FROM nft_listings l
      LEFT JOIN films f ON l.film_id = f.id
      LEFT JOIN users u ON l.seller_id = u.id
      WHERE l.is_active = true
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async markSold(id: string) {
    const query = `
      UPDATE nft_listings 
      SET is_active = false, sold_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

// Admin operations
export const dbAdmin = {
  async logAction(adminId: string, actionType: string, targetId: string, details: any) {
    const query = `
      INSERT INTO admin_actions (admin_id, action_type, target_id, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [adminId, actionType, targetId, JSON.stringify(details)]);
    return result.rows[0];
  },

  async getActions(limit: number = 100) {
    const query = `
      SELECT a.*, u.username as admin_username
      FROM admin_actions a
      LEFT JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },
};

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    return !!result;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  await pool.end();
  console.log('Database connection pool closed');
}

export default {
  users: dbUsers,
  films: dbFilms,
  purchases: dbPurchases,
  views: dbViews,
  listings: dbListings,
  admin: dbAdmin,
  checkConnection: checkDatabaseConnection,
  close: closeDatabaseConnection,
};
