const VisitorModel = require('../models/visitorModel');

/**
 * Controller for real-time live visitor telemetry & cart monitoring
 */
const VisitorController = {
  // POST /api/visitors/hit
  async recordHit(req, res, next) {
    try {
      const visitor = await VisitorModel.recordHit(req.body);
      res.status(200).json({
        success: true,
        data: visitor
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/visitors
  async getVisitors(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const visitors = await VisitorModel.getVisitors(limit);
      res.status(200).json({
        success: true,
        count: visitors.length,
        data: visitors
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/visitors/stats
  async getVisitorStats(req, res, next) {
    try {
      const stats = await VisitorModel.getVisitorStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = VisitorController;
