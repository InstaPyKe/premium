const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// Summary KPIs & stats
router.get('/stats/summary', OrderController.getOrderStats);

// Customer digital library vault & order history
router.get('/vault/:email', OrderController.getCustomerLibrary);
router.get('/customer/:email', OrderController.getCustomerOrders);

// Orders query & details
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);

// Create checkout purchase order
router.post('/', OrderController.createOrder);

// Update status (e.g. approve / clear / reject)
router.patch('/:id/status', OrderController.updateOrderStatus);

module.exports = router;
