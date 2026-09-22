const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/referralController');

// Record referral link click
router.post('/click', ReferralController.recordClick);

// Referral profile stats & milestones
router.get('/stats/:username', ReferralController.getStats);

// Request payout
router.post('/payout', ReferralController.requestPayout);

// Claim free app reward milestone
router.post('/claim-reward', ReferralController.claimReward);

// Admin: Get all affiliates & update payout statuses
router.get('/affiliates', ReferralController.getAllAffiliates);
router.patch('/payouts/:id/status', ReferralController.updatePayoutStatus);

module.exports = router;
