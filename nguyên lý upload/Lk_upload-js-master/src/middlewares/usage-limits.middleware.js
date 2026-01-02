const { validateGifCaptionCreation, recordGifCaptionUsage: recordUsage } = require("../services/usage-limits.service");
const { logInfo, logError } = require("../services/logger.service");

/**
 * Middleware để kiểm tra giới hạn GIF caption
 */
const checkGifCaptionLimit = (req, res, next) => {
  try {
    const { userId } = req.body;
    const options = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body.options;
    
    // Chỉ kiểm tra nếu là GIF caption
    if (options?.type === 'image_gif') {
      logInfo("checkGifCaptionLimit", `Checking GIF caption limit for user: ${userId}`);
      
      // Mock user plan (trong thực tế sẽ lấy từ database)
      const userPlan = {
        plan_id: 'free' // Default to free plan
      };
      
      const validation = validateGifCaptionCreation(userId, userPlan);
      
      if (!validation.valid) {
        logError("checkGifCaptionLimit", `GIF caption limit exceeded for user: ${userId}`);
        return res.status(429).json({
          success: false,
          message: validation.message,
          error: "GIF_CAPTION_LIMIT_EXCEEDED"
        });
      }
      
      logInfo("checkGifCaptionLimit", `GIF caption limit check passed for user: ${userId}`);
      
      // Thêm thông tin validation vào request để sử dụng sau
      req.gifCaptionValidation = validation;
    }
    
    next();
  } catch (error) {
    logError("checkGifCaptionLimit", `Error checking GIF caption limit: ${error.message}`);
    next(error);
  }
};

/**
 * Middleware để ghi lại usage sau khi upload thành công
 */
const recordGifCaptionUsageMiddleware = (req, res, next) => {
  try {
    const { userId } = req.body;
    const options = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body.options;
    
    // Chỉ ghi lại nếu là GIF caption và upload thành công
    if (options?.type === 'image_gif' && res.statusCode === 200) {
      logInfo("recordGifCaptionUsageMiddleware", `Recording GIF caption usage for user: ${userId}`);
      const { recordGifCaptionUsage } = require("../services/usage-limits.service");
      recordGifCaptionUsage(userId);
    }
    
    next();
  } catch (error) {
    logError("recordGifCaptionUsageMiddleware", `Error recording GIF caption usage: ${error.message}`);
    next(error);
  }
};

/**
 * Middleware để lấy thông tin usage stats
 */
const getUsageStats = (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Lấy user plan từ query parameters hoặc request body
    let userPlan = { plan_id: 'free' }; // Default to free plan
    
    // Thử lấy từ query parameters trước
    if (req.query.plan_id) {
      userPlan.plan_id = req.query.plan_id;
    }
    
    // Nếu không có trong query, thử lấy từ request body
    if (req.body && req.body.plan_id) {
      userPlan.plan_id = req.body.plan_id;
    }
    
    // Nếu không có trong body, thử lấy từ headers
    if (req.headers['x-user-plan']) {
      userPlan.plan_id = req.headers['x-user-plan'];
    }
    
    logInfo("getUsageStats", `Getting usage stats for user: ${userId}, plan: ${userPlan.plan_id}`);
    
    const { getUserUsageStats } = require("../services/usage-limits.service");
    const stats = getUserUsageStats(userId, userPlan);
    
    if (stats) {
      res.json({
        success: true,
        data: stats
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Usage stats not found"
      });
    }
  } catch (error) {
    logError("getUsageStats", `Error getting usage stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  checkGifCaptionLimit,
  recordGifCaptionUsage: recordGifCaptionUsageMiddleware,
  getUsageStats
};
