const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/ratingController');

// Check if device already rated an app
router.get('/check', RatingController.checkDeviceRating);

// Get ratings for an app
router.get('/app/:appId', RatingController.getAppRatings);

// Submit rating
router.post('/', RatingController.submitRating);

module.exports = router;
