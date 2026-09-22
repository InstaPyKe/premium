const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configure PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'bravin',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'whatsapp',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Pool error event listener (safe logging)
pool.on('error', (err) => {
  console.error('❌ Database pool connection error:', err.message);
});

/**
 * Parameterized query executor
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Connectivity test with sanitized logging
 */
const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL Database connected successfully.');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Database connection error.');
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
