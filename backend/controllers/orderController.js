const OrderModel = require('../models/orderModel');
const UserModel = require('../models/userModel');
const ReferralModel = require('../models/referralModel');

/**
 * Controller for order processing, payments, reviews & digital library vault
 */
const OrderController = {
  // POST /api/orders
  async createOrder(req, res, next) {
    try {
      const orderData = req.body;

      // Auto-upsert user profile if email is present
      if (orderData.customerEmail) {
        await UserModel.upsertCustomer({
          email: orderData.customerEmail,
          username: orderData.customerUsername,
          phone: orderData.customerPhone
        });
      }

      // Record referral link attribution if present
      if (orderData.referrerUsername) {
        await ReferralModel.getOrCreateProfile(orderData.referrerUsername);
      }

      const order = await OrderModel.create(orderData);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully and queued for review.',
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders
  async getAllOrders(req, res, next) {
    try {
      const { status, customerEmail, referrer, limit, offset } = req.query;
      const orders = await OrderModel.getAll({ status, customerEmail, referrer, limit, offset });
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderModel.getById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/vault/:email
  async getCustomerLibrary(req, res, next) {
    try {
      const { email } = req.params;
      const library = await OrderModel.getCustomerLibrary(email);
      res.status(200).json({
        success: true,
        count: library.length,
        data: library
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/customer/:email
  async getCustomerOrders(req, res, next) {
    try {
      const { email } = req.params;
      const orders = await OrderModel.getCustomerOrders(email);
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/orders/:id/status
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'cleared', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, cleared, or rejected.' });
      }

      const order = await OrderModel.updateStatus(id, status);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // If cleared, credit 30% affiliate commission
      if (status === 'cleared' && order.referrer_username) {
        await ReferralModel.processCommission(order);
      }

      res.status(200).json({
        success: true,
        message: `Order #${id} marked as ${status}`,
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/stats/summary
  async getOrderStats(req, res, next) {
    try {
      const stats = await OrderModel.getStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = OrderController;
