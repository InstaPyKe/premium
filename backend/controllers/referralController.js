const ReferralModel = require('../models/referralModel');
const OrderModel = require('../models/orderModel');
const AppModel = require('../models/appModel');

/**
 * Controller for 30% affiliate referrals, rewards, and payout requests
 */
const ReferralController = {
  // POST /api/referrals/click
  async recordClick(req, res, next) {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ success: false, message: 'Referrer username is required.' });
      }

      const updated = await ReferralModel.recordClick(username);
      res.status(200).json({
        success: true,
        message: 'Referral hit recorded',
        data: { username: updated.username, totalClicks: updated.total_clicks }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/referrals/stats/:username
  async getStats(req, res, next) {
    try {
      const { username } = req.params;
      const stats = await ReferralModel.getStats(username);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/referrals/payout
  async requestPayout(req, res, next) {
    try {
      const { username, paymentMethod, mpesaNumber, phone, accountDetails } = req.body;
      if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
      }

      const payout = await ReferralModel.requestPayout(username, {
        paymentMethod,
        mpesaNumber,
        phone,
        accountDetails
      });

      res.status(201).json({
        success: true,
        message: `Payout request #${payout.id} submitted successfully!`,
        data: payout
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/referrals/claim-reward
  async claimReward(req, res, next) {
    try {
      const { username, milestoneId, appId } = req.body;
      if (!username || !milestoneId || !appId) {
        return res.status(400).json({ success: false, message: 'username, milestoneId, and appId are required.' });
      }

      const app = await AppModel.getById(appId);
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found in catalog.' });
      }

      const profile = await ReferralModel.getOrCreateProfile(username);
      const claim = await ReferralModel.claimReward(username, milestoneId, appId, app.title);

      // Create cleared free order in customer's vault
      const freeOrder = await OrderModel.create({
        customerEmail: profile.email,
        customerUsername: username,
        items: [{
          id: app.id,
          title: app.title,
          price: 0,
          coverImage: app.cover_image,
          category: app.category,
          downloadUrl: app.download_url
        }],
        totalAmount: 0,
        paymentMethod: 'reward_claim',
        mpesaRef: 'FREE-REWARD-' + milestoneId.toUpperCase(),
        downloadUrl: app.download_url
      });
      await OrderModel.updateStatus(freeOrder.id, 'cleared');

      res.status(201).json({
        success: true,
        message: `🎉 "${app.title}" unlocked for free and added to your Digital Vault!`,
        data: { claim, order: freeOrder }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/referrals/affiliates (Admin)
  async getAllAffiliates(req, res, next) {
    try {
      const affiliates = await ReferralModel.getAllAffiliates();
      res.status(200).json({
        success: true,
        count: affiliates.length,
        data: affiliates
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/referrals/payouts/:id/status (Admin)
  async updatePayoutStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected.' });
      }

      const updated = await ReferralModel.updatePayoutStatus(id, status);
      res.status(200).json({
        success: true,
        message: `Payout request #${id} updated to ${status}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ReferralController;
