#!/usr/bin/env node

/**
 * Automated Database Setup Script for Vercel Deployment
 * This script runs automatically during Vercel build to initialize PostgreSQL database
 * It handles both database creation AND table initialization
 */

const { createPool } = require('@vercel/postgres');
const { spawn } = require('child_process');
const path = require('path');

async function ensureDatabaseExists() {
  // Check if database URL is already available
  const databaseUrl = process.env.POSTGRES_URL || 
                      process.env.DATABASE_URL || 
                      process.env.POSTGRES_PRISMA_URL;

  if (databaseUrl) {
    console.log('✅ Database URL already available');
    return true;
  }

  // Database doesn't exist - try to create it automatically
  console.log('🔧 Database URL not found. Attempting automatic creation...');
  console.log('');

  return new Promise((resolve) => {
    const createDbScript = path.join(__dirname, 'create-vercel-db.js');
    const child = spawn('node', [createDbScript], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('');
        console.log('✅ Database created successfully! Continuing with setup...');
        console.log('');
        resolve(true);
      } else {
        console.log('');
        console.log('⚠️  Automatic database creation not available');
        console.log('   This is normal for local development');
        console.log('');
        resolve(false);
      }
    });
  });
}

async function initializeDatabase() {
  console.log('🚀 Starting fully automated database setup...');
  console.log('');

  // Step 1: Ensure database exists (create if needed)
  await ensureDatabaseExists();

  // Step 2: Auto-detect database URL from Vercel environment variables
  const databaseUrl = process.env.POSTGRES_URL || 
                      process.env.DATABASE_URL || 
                      process.env.POSTGRES_PRISMA_URL;

  if (!databaseUrl) {
    console.error('❌ Could not find or create database');
    console.error('');
    console.error('   For Vercel deployment:');
    console.error('   - Add VERCEL_TOKEN to environment variables');
    console.error('   - Get token from: https://vercel.com/account/tokens');
    console.error('');
    console.error('   For local development:');
    console.error('   - Run: vercel env pull');
    console.error('   - Or set POSTGRES_URL in .env.local');
    console.error('');
    process.exit(1);
  }

  console.log('✅ Database URL detected automatically from Vercel');
  console.log('');
  let client;
  
  try {
    // Create a connection to the database using available URL
    const pool = createPool({
      connectionString: databaseUrl,
    });

    client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');

    // Check if tables already exist
    const checkTablesQuery = `
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'films', 'purchases', 'views', 'nft_listings', 'admin_actions');
    `;
    
    const existingTables = await client.query(checkTablesQuery);
    const tableCount = parseInt(existingTables.rows[0].count);
    
    if (tableCount === 6) {
      console.log('⚠️  Database already initialized (all 6 tables exist)');
      console.log('   Skipping setup to avoid conflicts.');
      
      // List existing tables
      const listTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      const result = await client.query(listTablesQuery);
      console.log('Existing tables:');
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      
      process.exit(0);
    }

    // Database exists but tables are missing - create them
    console.log(`📊 Found ${tableCount}/6 tables. Creating missing tables...`);

    // Read and execute the SQL schema
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'init-db.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Error: init-db.sql file not found');
      process.exit(1);
    }

    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔨 Executing database schema...');
    await client.query(sqlScript);
    console.log('✅ Database schema created successfully!');

    // Verify all tables were created
    const verifyTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await client.query(verifyTablesQuery);
    console.log('📋 Database tables:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Database initialization failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Run the initialization
initializeDatabase();
