const db = require('../config/db');

const OrderModel = {
  /**
   * Create a new purchase order
   */
  async create(orderData) {
    const orderId = orderData.id || ('ORD-' + Math.floor(1000 + Math.random() * 9000));
    const token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    
    // Generate clean ref code
    let refNumber = orderData.mpesaRef || orderData.kcbRef;
    const method = orderData.paymentMethod || 'mpesa';
    if (!refNumber || refNumber.trim() === '') {
      if (method === 'mpesa' || method === 'kcb') {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        refNumber = 'MP-' + code;
      } else {
        refNumber = 'CARD-' + Math.floor(100000000 + Math.random() * 900000000);
      }
    }

    const cleanEmail = (orderData.customerEmail || '').trim().toLowerCase();
    const cleanUsername = (orderData.customerUsername || cleanEmail.split('@')[0] || 'customer').trim().toLowerCase();
    const totalAmount = parseFloat(orderData.totalAmount) || 0.00;
    const referrerUsername = orderData.referrerUsername ? orderData.referrerUsername.trim().toLowerCase() : null;
    const commissionUsd = referrerUsername ? Math.round(totalAmount * 0.30 * 100) / 100 : 0.00;
    const randHex = orderId.slice(-4).toUpperCase();
    const licenseKey = `PSTR-${randHex}-491A-882C-PRO`;
    const expiresAt = new Date(Date.now() + 86400000 * 2);

    const queryText = `
      INSERT INTO orders (
        id, customer_email, customer_username, customer_phone, items,
        total_amount, currency_code, formatted_total, payment_method,
        payment_status, mpesa_ref, kcb_ref, paybill_number, account_number,
        account_name, referrer_username, referral_commission_usd,
        download_token, download_url, license_key, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21
      ) RETURNING *;
    `;

    const params = [
      orderId,
      cleanEmail,
      cleanUsername,
      orderData.customerPhone || '',
      JSON.stringify(orderData.items || []),
      totalAmount,
      orderData.currencyCode || 'USD',
      orderData.formattedTotal || `$${totalAmount.toFixed(2)}`,
      method,
      'pending', // Universal review: strictly starts pending
      refNumber,
      refNumber,
      orderData.paybillNumber || '522533',
      orderData.accountNumber || '8106675',
      orderData.accountName || 'JASPER MARKETS',
      referrerUsername,
      commissionUsd,
      token,
      orderData.downloadUrl || (orderData.items && orderData.items[0] ? orderData.items[0].downloadUrl : 'https://vault-storage.app/packages/bundle.zip'),
      licenseKey,
      expiresAt
    ];

    const { rows } = await db.query(queryText, params);
    return rows[0];
  },

  /**
   * Find order by ID
   */
  async getById(id) {
    const { rows } = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows[0] || null;
  },

  /**
   * Find order by download token
   */
  async getByToken(token) {
    const { rows } = await db.query('SELECT * FROM orders WHERE download_token = $1', [token]);
    return rows[0] || null;
  },

  /**
   * Get all orders with optional filtering
   */
  async getAll({ status, customerEmail, referrer, limit = 100, offset = 0 }) {
    let queryText = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND payment_status = $${params.length}`;
    }

    if (customerEmail) {
      params.push(customerEmail.trim().toLowerCase());
      queryText += ` AND LOWER(customer_email) = $${params.length}`;
    }

    if (referrer) {
      params.push(referrer.trim().toLowerCase());
      queryText += ` AND LOWER(referrer_username) = $${params.length}`;
    }

    queryText += ' ORDER BY created_at DESC';

    params.push(parseInt(limit, 10));
    queryText += ` LIMIT $${params.length}`;

    params.push(parseInt(offset, 10));
    queryText += ` OFFSET $${params.length}`;

    const { rows } = await db.query(queryText, params);
    return rows;
  },

  /**
   * Get customer orders history
   */
  async getCustomerOrders(email) {
    if (!email) return [];
    const { rows } = await db.query(
      'SELECT * FROM orders WHERE LOWER(customer_email) = LOWER($1) ORDER BY created_at DESC',
      [email.trim()]
    );
    return rows;
  },

  /**
   * Get customer cleared digital vault library
   */
  async getCustomerLibrary(email) {
    if (!email) return [];
    const { rows } = await db.query(
      `SELECT * FROM orders 
       WHERE LOWER(customer_email) = LOWER($1) AND payment_status = 'cleared'
       ORDER BY created_at DESC`,
      [email.trim()]
    );

    const library = [];
    const seenAppIds = new Set();

    rows.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        if (!seenAppIds.has(item.id)) {
          seenAppIds.add(item.id);
          library.push({
            appId: item.id,
            title: item.title,
            tagline: item.tagline || '',
            category: item.category || 'App',
            coverImage: item.coverImage,
            version: item.version || '1.0.0',
            size: item.size || '25.0 MB',
            platform: item.platform || 'Cross-Platform',
            downloadUrl: order.download_url || item.downloadUrl,
            downloadToken: order.download_token,
            signedDownloadUrl: `https://vault-storage.app/dl/signed-${order.download_token}?expires=86400`,
            licenseKey: order.license_key,
            purchasedAt: order.created_at,
            orderId: order.id,
            orderRef: order.mpesa_ref || order.kcb_ref || order.id
          });
        }
      });
    });

    return library;
  },

  /**
   * Update payment status (e.g. approve / clear / reject)
   */
  async updateStatus(id, status) {
    const clearedAt = status === 'cleared' ? 'CURRENT_TIMESTAMP' : 'NULL';
    const queryText = `
      UPDATE orders
      SET payment_status = $1,
          cleared_at = ${clearedAt},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, [status, id]);
    return rows[0] || null;
  },

  /**
   * Get KPI Summary Statistics for Admin Dashboard
   */
  async getStats() {
    const queryText = `
      SELECT
        COALESCE(COUNT(*), 0) AS total_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'cleared' THEN 1 ELSE 0 END), 0) AS cleared_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'cleared' THEN total_amount ELSE 0 END), 0) AS total_revenue_usd,
        COALESCE(COUNT(DISTINCT customer_email), 0) AS total_customers
      FROM orders;
    `;

    const { rows } = await db.query(queryText);
    return rows[0];
  }
};

module.exports = OrderModel;
