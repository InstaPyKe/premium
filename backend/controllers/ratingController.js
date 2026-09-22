const RatingModel = require('../models/ratingModel');

/**
 * Controller for application rating and reviews engine
 */
const RatingController = {
  // POST /api/ratings
  async submitRating(req, res, next) {
    try {
      const { appId, deviceId, score, userEmail, reviewText } = req.body;

      if (!appId || !deviceId || score === undefined) {
        return res.status(400).json({ success: false, message: 'appId, deviceId, and score are required.' });
      }

      // Check if device already rated
      const existing = await RatingModel.hasDeviceRated(appId, deviceId);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already rated this application from this device.',
          existingScore: existing.score
        });
      }

      const result = await RatingModel.rateApp(appId, deviceId, score, userEmail, reviewText);

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/ratings/check
  async checkDeviceRating(req, res, next) {
    try {
      const { appId, deviceId } = req.query;
      if (!appId || !deviceId) {
        return res.status(400).json({ success: false, message: 'appId and deviceId query parameters are required.' });
      }

      const existing = await RatingModel.hasDeviceRated(appId, deviceId);
      res.status(200).json({
        success: true,
        hasRated: !!existing,
        rating: existing ? existing.score : null
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/ratings/app/:appId
  async getAppRatings(req, res, next) {
    try {
      const { appId } = req.params;
      const ratings = await RatingModel.getByAppId(appId);
      res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = RatingController;
