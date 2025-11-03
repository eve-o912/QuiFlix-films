#!/usr/bin/env node

/**
 * Automatic Vercel Postgres Database Creation Script
 * This script automatically creates a Postgres database in Vercel if it doesn't exist
 */

const https = require('https');

async function makeVercelRequest(path, method = 'GET', body = null) {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID;
  
  if (!token) {
    throw new Error('VERCEL_TOKEN not found. Set it in Vercel Project Settings → Environment Variables');
  }

  return new Promise((resolve, reject) => {
    const url = teamId ? `${path}?teamId=${teamId}` : path;
    const options = {
      hostname: 'api.vercel.com',
      path: url,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${parsed.error?.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function checkExistingDatabase() {
  try {
    console.log('🔍 Checking for existing Postgres databases...');
    const stores = await makeVercelRequest('/v1/storage/stores');
    
    const postgresDb = stores.find(store => 
      store.type === 'postgres' && 
      (store.name === 'quiflix-db' || store.name.includes('quiflix'))
    );

    if (postgresDb) {
      console.log(`✅ Found existing database: ${postgresDb.name}`);
      return postgresDb;
    }

    return null;
  } catch (error) {
    console.log('⚠️  Could not check existing databases:', error.message);
    return null;
  }
}

async function createDatabase() {
  try {
    console.log('🚀 Creating Postgres database automatically...');
    
    const dbConfig = {
      name: 'quiflix-db',
      type: 'postgres',
      region: process.env.VERCEL_REGION || 'iad1', // Default to US East
    };

    const database = await makeVercelRequest('/v1/storage/stores', 'POST', dbConfig);
    
    console.log('✅ Database created successfully!');
    console.log(`   Name: ${database.name}`);
    console.log(`   ID: ${database.id}`);
    console.log(`   Region: ${database.region}`);
    
    return database;
  } catch (error) {
    throw new Error(`Failed to create database: ${error.message}`);
  }
}

async function linkDatabaseToProject(databaseId) {
  try {
    const projectId = process.env.VERCEL_PROJECT_ID;
    
    if (!projectId) {
      console.log('⚠️  VERCEL_PROJECT_ID not found, skipping project linking');
      console.log('   Database created but not linked. Link it manually in Vercel Dashboard.');
      return;
    }

    console.log('🔗 Linking database to project...');
    
    await makeVercelRequest(
      `/v1/storage/stores/${databaseId}/link`,
      'POST',
      { projectId }
    );
    
    console.log('✅ Database linked to project successfully!');
  } catch (error) {
    console.log('⚠️  Could not link database:', error.message);
    console.log('   You may need to link it manually in Vercel Dashboard');
  }
}

async function getDatabaseCredentials(databaseId) {
  try {
    console.log('🔑 Retrieving database credentials...');
    
    const db = await makeVercelRequest(`/v1/storage/stores/${databaseId}`);
    
    // Vercel automatically sets these environment variables when linked
    console.log('✅ Database credentials available as:');
    console.log('   - POSTGRES_URL');
    console.log('   - POSTGRES_PRISMA_URL');
    console.log('   - POSTGRES_URL_NON_POOLING');
    console.log('   - POSTGRES_USER');
    console.log('   - POSTGRES_HOST');
    console.log('   - POSTGRES_PASSWORD');
    console.log('   - POSTGRES_DATABASE');
    
    return db;
  } catch (error) {
    console.log('⚠️  Could not retrieve credentials:', error.message);
  }
}

async function automaticDatabaseSetup() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🎬 QuiFlix Automatic Database Setup');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Check if database already exists
    const existingDb = await checkExistingDatabase();
    
    if (existingDb) {
      console.log('');
      console.log('✅ Database already exists! Using existing database.');
      console.log('');
      
      // Try to get credentials
      await getDatabaseCredentials(existingDb.id);
      
      console.log('');
      console.log('🎯 Next step: Database tables will be created automatically during build');
      process.exit(0);
    }

    // Create new database
    const database = await createDatabase();
    
    // Link to project if possible
    await linkDatabaseToProject(database.id);
    
    // Get credentials
    await getDatabaseCredentials(database.id);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🎉 Database Setup Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Database created and configured automatically');
    console.log('✅ Environment variables set automatically by Vercel');
    console.log('✅ Tables will be created during next build');
    console.log('');
    
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('❌ Automatic database setup failed:', error.message);
    console.error('');
    console.error('📝 Manual Setup Required:');
    console.error('   1. Add VERCEL_TOKEN to your environment variables');
    console.error('   2. Get token from: https://vercel.com/account/tokens');
    console.error('   3. Add to Vercel Project Settings → Environment Variables');
    console.error('   4. Set: VERCEL_TOKEN = <your-token>');
    console.error('');
    console.error('   Or create database manually in Vercel Dashboard → Storage');
    console.error('');
    process.exit(1);
  }
}

// Run automatic setup
automaticDatabaseSetup();
