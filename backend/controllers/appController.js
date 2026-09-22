const AppModel = require('../models/appModel');

/**
 * Controller for application catalog management
 */
const AppController = {
  // GET /api/apps
  async getAllApps(req, res, next) {
    try {
      const { category, search, featured, status, limit, offset } = req.query;
      const apps = await AppModel.getAll({ category, search, featured, status, limit, offset });
      res.status(200).json({
        success: true,
        count: apps.length,
        data: apps
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/apps/:id
  async getAppById(req, res, next) {
    try {
      const { id } = req.params;
      const app = await AppModel.getById(id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      res.status(200).json({
        success: true,
        data: app
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/apps
  async createApp(req, res, next) {
    try {
      const newApp = await AppModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: newApp
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/apps/:id
  async updateApp(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await AppModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/apps/:id
  async deleteApp(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await AppModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/apps/:id/download
  async recordDownload(req, res, next) {
    try {
      const { id } = req.params;
      const downloads = await AppModel.incrementDownloads(id);
      res.status(200).json({
        success: true,
        downloads
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AppController;
