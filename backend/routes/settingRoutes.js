const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/settingController');

// Get current system settings
router.get('/', SettingController.getSettings);

// Update system settings
router.put('/', SettingController.updateSettings);

module.exports = router;
