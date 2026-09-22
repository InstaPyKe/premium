const db = require('../config/db');

/**
 * Basic API Health Check
 */
const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PremiumStore API service is operational',
    timestamp: new Date().toISOString(),
  });
};

/**
 * PostgreSQL Database Connection Health Check (Sanitized)
 */
const getDbHealthStatus = async (req, res, next) => {
  try {
    const startTime = Date.now();
    await db.query('SELECT 1');
    const latency = Date.now() - startTime;

    res.status(200).json({
      success: true,
      message: 'Database connection is operational',
      latency: `${latency}ms`,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable',
    });
  }
};

module.exports = {
  getHealthStatus,
  getDbHealthStatus,
};
