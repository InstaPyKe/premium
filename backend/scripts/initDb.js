const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * Reads and executes schema.sql to initialize PostgreSQL tables and seed data
 */
const initDatabase = async () => {
  try {
    console.log('🔄 Initializing PostgreSQL database tables and seeds...');
    const schemaPath = path.resolve(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await db.query(sql);

    console.log('--------------------------------------------------');
    console.log('✅ All PostgreSQL database tables created successfully!');
    console.log('📊 Tables: apps, users, orders, ratings, referrals, payout_requests, claimed_rewards, settings, visitors');
    console.log('📦 Initial catalog & settings seeded successfully!');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
};

initDatabase();
