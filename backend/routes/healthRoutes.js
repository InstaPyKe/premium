const express = require('express');
const router = express.Router();
const { getHealthStatus, getDbHealthStatus } = require('../controllers/healthController');

// GET /api/health - Server health check
router.get('/', getHealthStatus);

// GET /api/health/db - Database connection check
router.get('/db', getDbHealthStatus);

module.exports = router;
