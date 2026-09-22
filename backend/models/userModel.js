const crypto = require('crypto');
const db = require('../config/db');

/**
 * Hash password using crypto PBKDF2 with unique salt
 */
function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

/**
 * Auto-ensure table columns exist without disrupting data
 */
async function ensureAuthColumns() {
  try {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';
    `);
  } catch (e) {
    // Graceful check
  }
}
ensureAuthColumns();

const UserModel = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    if (!email) return null;
    const { rows } = await db.query(
      'SELECT id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return rows[0] || null;
  },

  /**
   * Find user by username
   */
  async findByUsername(username) {
    if (!username) return null;
    const { rows } = await db.query(
      'SELECT id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active FROM users WHERE LOWER(username) = LOWER($1)',
      [username.trim()]
    );
    return rows[0] || null;
  },

  /**
   * Sign up a new customer with password
   */
  async signupCustomer({ email, password, username, phone = '', deviceId = '' }) {
    const cleanEmail = email.trim().toLowerCase();
    let cleanUsername = (username || cleanEmail.split('@')[0].replace(/[^a-z0-9_-]/gi, '')).toLowerCase();
    if (cleanUsername.length < 3) cleanUsername = `user_${Math.random().toString(36).substring(2, 6)}`;
    cleanUsername = cleanUsername.slice(0, 20);

    const existing = await this.findByEmail(cleanEmail);
    const passwordHash = hashPassword(password);

    if (existing) {
      if (existing.password_hash && existing.password_hash.length > 10) {
        throw new Error('An account with this email address already exists. Please sign in.');
      }
      // Upgrade existing guest user with password
      const updateQuery = `
        UPDATE users 
        SET password_hash = $1,
            username = CASE WHEN users.username LIKE 'user_%' AND $2 <> '' THEN $2 ELSE users.username END,
            phone = CASE WHEN $3 <> '' THEN $3 ELSE users.phone END,
            device_id = CASE WHEN $4 <> '' THEN $4 ELSE users.device_id END,
            last_active = CURRENT_TIMESTAMP
        WHERE LOWER(email) = LOWER($5)
        RETURNING id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active;
      `;
      const { rows } = await db.query(updateQuery, [passwordHash, cleanUsername, phone, deviceId, cleanEmail]);
      return rows[0];
    }

    const insertQuery = `
      INSERT INTO users (email, username, password_hash, phone, device_id, auth_provider, last_active)
      VALUES ($1, $2, $3, $4, $5, 'local', CURRENT_TIMESTAMP)
      RETURNING id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active;
    `;

    const { rows } = await db.query(insertQuery, [cleanEmail, cleanUsername, passwordHash, phone, deviceId]);
    return rows[0];
  },

  /**
   * Sign in customer with email and password
   */
  async signinCustomer({ email, password, deviceId = '' }) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(cleanEmail);

    if (!user) {
      throw new Error('No account found with this email. Please sign up first.');
    }

    if (!user.password_hash) {
      if (user.auth_provider === 'google' || user.google_id) {
        throw new Error('This account was created with Google. Please use Continue with Google.');
      }
      throw new Error('No password is set for this account. Please sign up or reset.');
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Update last active
    const updateQuery = `
      UPDATE users 
      SET last_active = CURRENT_TIMESTAMP,
          device_id = CASE WHEN $1 <> '' THEN $1 ELSE users.device_id END
      WHERE id = $2
      RETURNING id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active;
    `;
    const { rows } = await db.query(updateQuery, [deviceId, user.id]);
    return rows[0];
  },

  /**
   * Google OAuth / Google Sign-In user handler
   */
  async upsertGoogleUser({ email, name, picture = '', googleId = '', deviceId = '' }) {
    const cleanEmail = email.trim().toLowerCase();
    let cleanUsername = (name ? name.replace(/[^a-z0-9_-]/gi, '') : cleanEmail.split('@')[0].replace(/[^a-z0-9_-]/gi, '')).toLowerCase();
    if (cleanUsername.length < 3) cleanUsername = `user_${Math.random().toString(36).substring(2, 6)}`;
    cleanUsername = cleanUsername.slice(0, 20);

    const queryText = `
      INSERT INTO users (email, username, avatar, google_id, auth_provider, device_id, last_active)
      VALUES ($1, $2, $3, $4, 'google', $5, CURRENT_TIMESTAMP)
      ON CONFLICT (email)
      DO UPDATE SET
        avatar = CASE WHEN EXCLUDED.avatar <> '' THEN EXCLUDED.avatar ELSE users.avatar END,
        google_id = CASE WHEN EXCLUDED.google_id <> '' THEN EXCLUDED.google_id ELSE users.google_id END,
        auth_provider = CASE WHEN users.auth_provider = 'local' THEN users.auth_provider ELSE 'google' END,
        device_id = CASE WHEN EXCLUDED.device_id <> '' THEN EXCLUDED.device_id ELSE users.device_id END,
        last_active = CURRENT_TIMESTAMP
      RETURNING id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active;
    `;

    const { rows } = await db.query(queryText, [cleanEmail, cleanUsername, picture, googleId, deviceId]);
    return rows[0];
  },

  /**
   * Upsert customer user profile (auto-register or update activity)
   */
  async upsertCustomer({ email, username, phone = '', deviceId = '' }) {
    const cleanEmail = email.trim().toLowerCase();
    let cleanUsername = (username || cleanEmail.split('@')[0].replace(/[^a-z0-9_-]/gi, '')).toLowerCase();
    if (cleanUsername.length < 3) cleanUsername = `user_${Math.random().toString(36).substring(2, 6)}`;
    cleanUsername = cleanUsername.slice(0, 20);

    const queryText = `
      INSERT INTO users (email, username, phone, device_id, last_active)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (email)
      DO UPDATE SET
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE users.phone END,
        device_id = CASE WHEN EXCLUDED.device_id <> '' THEN EXCLUDED.device_id ELSE users.device_id END,
        last_active = CURRENT_TIMESTAMP
      RETURNING id, email, username, phone, avatar, google_id, auth_provider, device_id, role, created_at, last_active;
    `;

    const { rows } = await db.query(queryText, [cleanEmail, cleanUsername, phone, deviceId]);
    return rows[0];
  },

  /**
   * Get all customers with aggregated statistics
   */
  async getAllCustomers() {
    const queryText = `
      SELECT 
        u.id,
        u.email,
        u.username,
        u.phone,
        u.avatar,
        u.auth_provider,
        u.device_id,
        u.created_at,
        u.last_active,
        COALESCE(COUNT(o.id), 0) AS total_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'cleared' THEN 1 ELSE 0 END), 0) AS cleared_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'cleared' THEN o.total_amount ELSE 0 END), 0) AS total_spend
      FROM users u
      LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(u.email)
      GROUP BY u.id, u.email, u.username, u.phone, u.avatar, u.auth_provider, u.device_id, u.created_at, u.last_active
      ORDER BY u.last_active DESC;
    `;

    const { rows } = await db.query(queryText);
    return rows;
  }
};

module.exports = UserModel;
