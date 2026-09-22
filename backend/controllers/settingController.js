const SettingModel = require('../models/settingModel');

/**
 * Controller for store settings & gateway configurations
 */
const SettingController = {
  // GET /api/settings
  async getSettings(req, res, next) {
    try {
      const settings = await SettingModel.getSettings();
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/settings
  async updateSettings(req, res, next) {
    try {
      const updated = await SettingModel.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: 'System settings updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = SettingController;
