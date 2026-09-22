const db = require('../config/db');

const ReferralModel = {
  /**
   * Get or create referral profile
   */
  async getOrCreateProfile(username, email = '') {
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = (email || `${cleanUser}@customer.store`).trim().toLowerCase();

    const queryText = `
      INSERT INTO referrals (username, email, last_active)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (username)
      DO UPDATE SET
        email = CASE WHEN EXCLUDED.email <> '' AND NOT EXCLUDED.email LIKE '%@customer.store' THEN EXCLUDED.email ELSE referrals.email END,
        last_active = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, [cleanUser, cleanEmail]);
    return rows[0];
  },

  /**
   * Record referral link click
   */
  async recordClick(username) {
    const cleanUser = username.trim().toLowerCase();
    await this.getOrCreateProfile(cleanUser);

    const queryText = `
      UPDATE referrals
      SET total_clicks = total_clicks + 1,
          last_active = CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, [cleanUser]);
    return rows[0];
  },

  /**
   * Process 30% commission when an order is cleared
   */
  async processCommission(order) {
    if (!order || !order.referrer_username) return null;
    const refUser = order.referrer_username.trim().toLowerCase();
    const orderTotal = parseFloat(order.total_amount) || 0.00;
    const commission = Math.round(orderTotal * 0.30 * 100) / 100;

    await this.getOrCreateProfile(refUser);

    const queryText = `
      UPDATE referrals
      SET successful_orders = successful_orders + 1,
          total_revenue_usd = total_revenue_usd + $1,
          total_commission_usd = total_commission_usd + $2,
          balance_usd = balance_usd + $2,
          last_active = CURRENT_TIMESTAMP
      WHERE username = $3
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, [orderTotal, commission, refUser]);
    return rows[0];
  },

  /**
   * Get referral statistics, milestones, orders, and payouts
   */
  async getStats(username) {
    const cleanUser = username.trim().toLowerCase();
    const profile = await this.getOrCreateProfile(cleanUser);

    // Fetch related referral orders
    const { rows: orders } = await db.query(
      `SELECT id, customer_email, total_amount, currency_code, referral_commission_usd, payment_status, created_at, cleared_at
       FROM orders
       WHERE LOWER(referrer_username) = $1
       ORDER BY created_at DESC`,
      [cleanUser]
    );

    // Fetch payout requests
    const { rows: payouts } = await db.query(
      'SELECT * FROM payout_requests WHERE LOWER(referrer_username) = $1 ORDER BY requested_at DESC',
      [cleanUser]
    );

    // Fetch claimed rewards
    const { rows: claims } = await db.query(
      'SELECT * FROM claimed_rewards WHERE LOWER(referrer_username) = $1',
      [cleanUser]
    );

    const successfulOrdersCount = parseInt(profile.successful_orders, 10) || 0;

    const milestones = [
      {
        id: 'm1_3apps',
        requiredInvites: 3,
        rewardTitle: '1 Free Premium App of Choice',
        unlocked: successfulOrdersCount >= 3,
        claimed: claims.some((c) => c.milestone_id === 'm1_3apps')
      },
      {
        id: 'm2_5apps',
        requiredInvites: 5,
        rewardTitle: '2 Free Premium Apps + VIP Badge',
        unlocked: successfulOrdersCount >= 5,
        claimed: claims.some((c) => c.milestone_id === 'm2_5apps')
      },
      {
        id: 'm3_10apps',
        requiredInvites: 10,
        rewardTitle: '5 Free Apps + Unlimited VIP Pass',
        unlocked: successfulOrdersCount >= 10,
        claimed: claims.some((c) => c.milestone_id === 'm3_10apps')
      }
    ];

    return {
      ...profile,
      clicks: profile.total_clicks || 0,
      totalOrders: profile.successful_orders || 0,
      totalEarnedUsd: profile.total_commission_usd || 0,
      balanceUsd: profile.balance_usd || 0,
      payouts,
      referralOrders: orders,
      milestones
    };
  },

  /**
   * Request payout of accumulated commission
   */
  async requestPayout(username, payoutData = {}) {
    const cleanUser = username.trim().toLowerCase();
    const profile = await this.getOrCreateProfile(cleanUser);

    const balance = parseFloat(profile.balance_usd) || 0;
    if (balance <= 0) {
      throw new Error('No available commission balance to withdraw.');
    }

    const payoutId = 'PAY-' + Math.floor(1000 + Math.random() * 9000);

    // Create payout record
    const insertPayout = `
      INSERT INTO payout_requests (id, referrer_username, email, amount_usd, payment_method, mpesa_number, account_details, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *;
    `;
    const { rows: payoutRows } = await db.query(insertPayout, [
      payoutId,
      cleanUser,
      profile.email,
      balance,
      payoutData.paymentMethod || 'mpesa',
      payoutData.mpesaNumber || payoutData.phone || '',
      payoutData.accountDetails || ''
    ]);

    // Deduct balance from profile
    await db.query(
      'UPDATE referrals SET balance_usd = 0, last_active = CURRENT_TIMESTAMP WHERE username = $1',
      [cleanUser]
    );

    return payoutRows[0];
  },

  /**
   * Claim free app reward milestone
   */
  async claimReward(username, milestoneId, appId, appTitle) {
    const cleanUser = username.trim().toLowerCase();

    const insertClaim = `
      INSERT INTO claimed_rewards (referrer_username, milestone_id, app_id, app_title)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const { rows } = await db.query(insertClaim, [cleanUser, milestoneId, appId, appTitle]);
    return rows[0];
  },

  /**
   * Get all affiliates (for Admin Dashboard)
   */
  async getAllAffiliates() {
    const queryText = `
      SELECT 
        r.*,
        COALESCE(json_agg(p.*) FILTER (WHERE p.id IS NOT NULL), '[]') AS payouts
      FROM referrals r
      LEFT JOIN payout_requests p ON p.referrer_username = r.username
      GROUP BY r.username, r.email, r.phone, r.total_clicks, r.successful_orders, r.total_revenue_usd, r.total_commission_usd, r.balance_usd, r.paid_payouts_usd, r.created_at, r.last_active
      ORDER BY r.total_commission_usd DESC;
    `;

    const { rows } = await db.query(queryText);
    return rows;
  },

  /**
   * Update payout status (admin approval/rejection)
   */
  async updatePayoutStatus(payoutId, status) {
    const { rows: payouts } = await db.query('SELECT * FROM payout_requests WHERE id = $1', [payoutId]);
    if (payouts.length === 0) throw new Error('Payout request not found.');

    const payout = payouts[0];
    const prevStatus = payout.status;
    const paidAt = (status === 'approved' || status === 'paid') ? 'CURRENT_TIMESTAMP' : 'NULL';

    const updatePayout = `
      UPDATE payout_requests
      SET status = $1,
          paid_at = ${paidAt}
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updated } = await db.query(updatePayout, [status, payoutId]);

    // If approved, add to paid_payouts_usd
    if ((status === 'approved' || status === 'paid') && prevStatus !== 'approved' && prevStatus !== 'paid') {
      await db.query(
        'UPDATE referrals SET paid_payouts_usd = paid_payouts_usd + $1 WHERE username = $2',
        [payout.amount_usd, payout.referrer_username]
      );
    } else if (status === 'rejected' && prevStatus === 'pending') {
      // Refund balance back to affiliate
      await db.query(
        'UPDATE referrals SET balance_usd = balance_usd + $1 WHERE username = $2',
        [payout.amount_usd, payout.referrer_username]
      );
    }

    return updated[0];
  }
};

module.exports = ReferralModel;
