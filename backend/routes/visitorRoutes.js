const express = require('express');
const router = express.Router();
const VisitorController = require('../controllers/visitorController');

// Record live visitor telemetry hit
router.post('/hit', VisitorController.recordHit);

// Get visitor list and traffic statistics
router.get('/', VisitorController.getVisitors);
router.get('/stats', VisitorController.getVisitorStats);

module.exports = router;
