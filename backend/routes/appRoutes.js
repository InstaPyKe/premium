const express = require('express');
const router = express.Router();
const AppController = require('../controllers/appController');

// Catalog query & details
router.get('/', AppController.getAllApps);
router.get('/:id', AppController.getAppById);

// Application creation & modifications
router.post('/', AppController.createApp);
router.put('/:id', AppController.updateApp);
router.delete('/:id', AppController.deleteApp);

// Download tracking
router.post('/:id/download', AppController.recordDownload);

module.exports = router;
