const db = require('../config/db');

const RatingModel = {
  /**
   * Check if a device has already rated an app
   */
  async hasDeviceRated(appId, deviceId) {
    const { rows } = await db.query(
      'SELECT id, score FROM ratings WHERE app_id = $1 AND device_id = $2',
      [appId, deviceId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Submit an app rating
   */
  async rateApp(appId, deviceId, score, userEmail = '', reviewText = '') {
    const parsedScore = Math.min(5, Math.max(1, parseFloat(score) || 5));

    // 1. Insert rating (prevent duplicate per device)
    const insertQuery = `
      INSERT INTO ratings (app_id, device_id, user_email, score, review_text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows: inserted } = await db.query(insertQuery, [appId, deviceId, userEmail, parsedScore, reviewText]);

    // 2. Recalculate average rating & rating count on the app
    const avgQuery = `
      SELECT 
        COUNT(*) AS total_count,
        ROUND(AVG(score)::numeric, 1) AS avg_score
      FROM ratings
      WHERE app_id = $1;
    `;
    const { rows: stats } = await db.query(avgQuery, [appId]);
    const newRating = parseFloat(stats[0].avg_score) || 5.0;
    const ratingCount = parseInt(stats[0].total_count, 10) || 1;

    // 3. Update apps table
    await db.query(
      'UPDATE apps SET rating = $1, rating_count = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newRating, ratingCount, appId]
    );

    return {
      rating: inserted[0],
      newRating,
      ratingCount
    };
  },

  /**
   * Get all ratings/reviews for an application
   */
  async getByAppId(appId) {
    const { rows } = await db.query(
      'SELECT id, app_id, score, review_text, created_at FROM ratings WHERE app_id = $1 ORDER BY created_at DESC',
      [appId]
    );
    return rows;
  }
};

module.exports = RatingModel;
