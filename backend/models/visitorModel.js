const db = require('../config/db');

const VisitorModel = {
  /**
   * Record or update live visitor telemetry hit
   */
  async recordHit(visitorData) {
    const deviceId = visitorData.deviceId || ('dev_' + Math.random().toString(36).substring(2, 11));
    const visitorId = visitorData.id || ('vis_' + Math.random().toString(36).substring(2, 9));
    const page = visitorData.currentPage || 'Marketplace Storefront';

    const queryText = `
      INSERT INTO visitors (
        id, device_id, email, username, phone, current_page,
        page_views, country, flag, currency, device_type,
        browser, os, referrer, cart_count, cart_value,
        first_seen, last_seen
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        1, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        email = CASE WHEN EXCLUDED.email <> '' THEN EXCLUDED.email ELSE visitors.email END,
        username = CASE WHEN EXCLUDED.username <> 'Anonymous Guest' THEN EXCLUDED.username ELSE visitors.username END,
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE visitors.phone END,
        current_page = EXCLUDED.current_page,
        page_views = visitors.page_views + 1,
        cart_count = EXCLUDED.cart_count,
        cart_value = EXCLUDED.cart_value,
        last_seen = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    // Also look up if this deviceId has an existing visitor
    const existing = await db.query('SELECT id FROM visitors WHERE device_id = $1 LIMIT 1', [deviceId]);
    const finalId = existing.rows[0] ? existing.rows[0].id : visitorId;

    const params = [
      finalId,
      deviceId,
      visitorData.email || '',
      visitorData.username || 'Anonymous Guest',
      visitorData.phone || '',
      page,
      visitorData.country || 'Global',
      visitorData.flag || '🌐',
      visitorData.currency || 'USD',
      visitorData.deviceType || 'Desktop',
      visitorData.browser || 'Chrome',
      visitorData.os || 'Windows',
      visitorData.referrer || 'Direct Search / Bookmark',
      parseInt(visitorData.cartCount, 10) || 0,
      parseFloat(visitorData.cartValue) || 0.00
    ];

    const { rows } = await db.query(queryText, params);
    return rows[0];
  },

  /**
   * Get latest visitors
   */
  async getVisitors(limit = 100) {
    const { rows } = await db.query(
      'SELECT * FROM visitors ORDER BY last_seen DESC LIMIT $1',
      [limit]
    );
    return rows;
  },

  /**
   * Get visitor aggregated telemetry statistics
   */
  async getVisitorStats() {
    const queryText = `
      SELECT
        COUNT(*) AS total_visitors,
        COUNT(CASE WHEN last_seen >= (CURRENT_TIMESTAMP - INTERVAL '3 minutes') THEN 1 END) AS online_now,
        COUNT(CASE WHEN last_seen >= (CURRENT_TIMESTAMP - INTERVAL '15 minutes') AND last_seen < (CURRENT_TIMESTAMP - INTERVAL '3 minutes') THEN 1 END) AS idle_recent,
        COUNT(CASE WHEN cart_count > 0 THEN 1 END) AS active_carts,
        COALESCE(SUM(cart_value), 0) AS total_cart_value,
        COUNT(CASE WHEN email <> '' THEN 1 END) AS identified_visitors
      FROM visitors;
    `;

    const { rows } = await db.query(queryText);
    return rows[0];
  }
};

module.exports = VisitorModel;
