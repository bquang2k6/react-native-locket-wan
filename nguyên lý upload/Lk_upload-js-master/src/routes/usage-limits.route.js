const express = require('express');
const router = express.Router();
const { getUsageStats } = require('../middlewares/usage-limits.middleware');
const { logInfo, logError } = require('../services/logger.service');

/**
 * GET /usage/stats/:userId
 * Lấy thông tin usage stats của user
 */
router.get('/stats/:userId', getUsageStats);

/**
 * POST /usage/check
 * Kiểm tra giới hạn sử dụng
 */
router.post('/check', (req, res) => {
  try {
    const { userId, limitType, userPlan } = req.body;
    
    if (!userId || !limitType) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }
    
    const { validateWithSecurityCheck } = require('../services/usage-limits.service');
    const validation = validateWithSecurityCheck(userId, userPlan || { plan_id: 'free' }, limitType);
    
    logInfo("usage-check", `Usage check for user: ${userId}, type: ${limitType}, valid: ${validation.valid}`);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logError("usage-check", `Error checking usage: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * POST /usage/record
 * Ghi lại usage
 */
router.post('/record', (req, res) => {
  try {
    const { userId, limitType } = req.body;
    
    if (!userId || !limitType) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }
    
    const { recordGifCaptionUsage } = require('../services/usage-limits.service');
    
    if (limitType === 'gif_caption') {
      recordGifCaptionUsage(userId);
      logInfo("usage-record", `Recorded GIF caption usage for user: ${userId}`);
    }
    
    res.json({
      success: true,
      message: "Usage recorded successfully"
    });
  } catch (error) {
    logError("usage-record", `Error recording usage: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * GET /usage/limits
 * Lấy thông tin giới hạn của các gói
 */
router.get('/limits', (req, res) => {
  try {
    const { getPlanDetails } = require('../services/usage-limits.service');
    
    const plans = ['free', 'premium_lite', 'premium', 'pro_plus'];
    const limits = {};
    
    plans.forEach(planId => {
      limits[planId] = getPlanDetails(planId);
    });
    
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    logError("usage-limits", `Error getting usage limits: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
