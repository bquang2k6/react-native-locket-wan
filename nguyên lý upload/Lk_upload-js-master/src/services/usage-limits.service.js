const { logInfo, logError } = require("./logger.service");
const fs = require('fs');
const path = require('path');

// Plan definitions with proper limits
const PLAN_LIMITS = {
  'free': {
    gif_caption_daily: 2,
    caption_daily: 1,
    max_image_size: 3,
    max_video_size: 7
  },
  'premium_lite': {
    gif_caption_daily: 4,
    caption_daily: 3,
    max_image_size: 5,
    max_video_size: 10
  },
  'premium': {
    gif_caption_daily: Infinity, // Không giới hạn
    caption_daily: 5,
    max_image_size: 7,
    max_video_size: 20
  },
  'pro_plus': {
    gif_caption_daily: Infinity, // Không giới hạn
    caption_daily: 5,
    max_image_size: 10,
    max_video_size: 25
  },
  'basic': {
    gif_caption_daily: 5,
    caption_daily: 3,
    max_image_size: 5,
    max_video_size: 10
  },
  'pro': {
    gif_caption_daily: Infinity, // Unlimited
    caption_daily: 25,
    max_image_size: 15,
    max_video_size: 30
  }
};

// Storage file path
const STORAGE_DIR = path.join(__dirname, '../../storage');
const USAGE_FILE = path.join(STORAGE_DIR, 'usage_data.json');
const ACTIVITY_FILE = path.join(STORAGE_DIR, 'activity_log.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Initialize storage files if they don't exist
if (!fs.existsSync(USAGE_FILE)) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify({}));
}

if (!fs.existsSync(ACTIVITY_FILE)) {
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify([]));
}

/**
 * Get current date in YYYY-MM-DD format for tracking daily usage
 */
const getCurrentDateKey = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Read usage data from file
 */
const readUsageData = () => {
  try {
    const data = fs.readFileSync(USAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logError("readUsageData", `Error reading usage data: ${error.message}`);
    return {};
  }
};

/**
 * Write usage data to file
 */
const writeUsageData = (data) => {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    logError("writeUsageData", `Error writing usage data: ${error.message}`);
  }
};

/**
 * Read activity log from file
 */
const readActivityLog = () => {
  try {
    const data = fs.readFileSync(ACTIVITY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logError("readActivityLog", `Error reading activity log: ${error.message}`);
    return [];
  }
};

/**
 * Write activity log to file
 */
const writeActivityLog = (data) => {
  try {
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    logError("writeActivityLog", `Error writing activity log: ${error.message}`);
  }
};

/**
 * Reset daily usage if it's a new day
 */
const resetDailyUsageIfNeeded = () => {
  const today = getCurrentDateKey();
  const usageData = readUsageData();
  const lastReset = usageData.lastReset || '';
  
  if (lastReset !== today) {
    // New day, reset all daily counters
    const newUsageData = {
      lastReset: today,
      usage: {}
    };
    
    // Keep only today's usage
    Object.keys(usageData.usage || {}).forEach(key => {
      if (key.includes(today)) {
        newUsageData.usage[key] = usageData.usage[key];
      }
    });
    
    writeUsageData(newUsageData);
    logInfo("resetDailyUsageIfNeeded", `Reset daily usage for date: ${today}`);
  }
};

/**
 * Get current daily usage for a specific type
 */
const getDailyUsage = (userId, type) => {
  resetDailyUsageIfNeeded();
  const today = getCurrentDateKey();
  const usageData = readUsageData();
  
  const key = `${userId}_${type}_${today}`;
  return parseInt(usageData.usage?.[key] || '0');
};

/**
 * Increment daily usage for a specific type
 */
const incrementDailyUsage = (userId, type) => {
  resetDailyUsageIfNeeded();
  const today = getCurrentDateKey();
  const current = getDailyUsage(userId, type);
  const usageData = readUsageData();
  
  const key = `${userId}_${type}_${today}`;
  usageData.usage = usageData.usage || {};
  usageData.usage[key] = current + 1;
  
  writeUsageData(usageData);
  
  // Log activity để detect suspicious behavior
  const activityLog = readActivityLog();
  activityLog.push({
    userId,
    type,
    timestamp: Date.now(),
    userAgent: 'Node.js Backend'
  });
  
  // Keep only last 50 activities
  if (activityLog.length > 50) {
    activityLog.splice(0, activityLog.length - 50);
  }
  
  writeActivityLog(activityLog);
  logInfo("incrementDailyUsage", `Incremented usage for user: ${userId}, type: ${type}, new count: ${current + 1}`);
};

/**
 * Get plan details by plan ID
 */
const getPlanDetails = (planId) => {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
};

/**
 * Validate GIF caption creation against daily limits
 */
const validateGifCaptionCreation = (userId, userPlan) => {
  if (!userId || !userPlan) {
    return { valid: false, message: 'User ID hoặc plan không hợp lệ' };
  }

  const planDetails = getPlanDetails(userPlan.plan_id || 'free');
  const dailyLimit = planDetails.gif_caption_daily;
  
  if (dailyLimit === 0) {
    return { valid: false, message: 'Gói của bạn không hỗ trợ gif caption' };
  }
  
  if (dailyLimit === Infinity) {
    return { valid: true, message: 'Không giới hạn gif caption' };
  }

  const currentUsage = getDailyUsage(userId, 'gif_caption');
  
  if (currentUsage >= dailyLimit) {
    return {
      valid: false,
      message: `Bạn đã đạt giới hạn ${dailyLimit} gif caption/ngày của gói ${userPlan.plan_id || 'free'}. Còn lại: 0`
    };
  }

  return {
    valid: true,
    message: `Còn lại ${dailyLimit - currentUsage}/${dailyLimit} gif caption hôm nay`
  };
};

/**
 * Record successful GIF caption creation
 */
const recordGifCaptionUsage = (userId, planId) => {
  if (!userId) return;
  incrementDailyUsage(userId, 'gif_caption');
  logInfo("recordGifCaptionUsage", `Recorded GIF caption usage for user: ${userId}, plan: ${planId || 'unknown'}`);
};

/**
 * Get current usage stats for display
 */
const getUserUsageStats = (userId, userPlan) => {
  if (!userId || !userPlan) return null;

  const planDetails = getPlanDetails(userPlan.plan_id || 'free');
  
  const today = new Date().toISOString().split('T')[0];
  
  return {
    caption: {
      used: getDailyUsage(userId, 'caption'),
      limit: planDetails.caption_daily,
      unlimited: planDetails.caption_daily === Infinity
    },
    gif_caption: {
      used: getDailyUsage(userId, 'gif_caption'),
      limit: planDetails.gif_caption_daily,
      unlimited: planDetails.gif_caption_daily === Infinity
    },
    fileSize: {
      maxImageSize: planDetails.max_image_size,
      maxVideoSize: planDetails.max_video_size
    },
    reset_time: `${today}T00:00:00+00:00`
  };
};

/**
 * Detect suspicious activity (multiple cache clears)
 */
const detectSuspiciousActivity = (userId) => {
  const activityLog = readActivityLog();
  const recentActivity = activityLog.filter(log => 
    log.userId === userId && 
    Date.now() - log.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
  );
  
  // Check for signs of cache clearing
  const suspiciousPatterns = {
    tooManyActivities: recentActivity.length > 20,
    rapidSuccession: recentActivity.some((log, index) => {
      const nextLog = recentActivity[index + 1];
      return nextLog && (nextLog.timestamp - log.timestamp) < 60000; // Less than 1 minute apart
    }),
    differentUserAgents: new Set(recentActivity.map(log => log.userAgent)).size > 2
  };
  
  return Object.values(suspiciousPatterns).some(Boolean);
};

/**
 * Enhanced validation với suspicious activity detection
 */
const validateWithSecurityCheck = (userId, userPlan, limitType) => {
  // Check for suspicious activity first
  if (detectSuspiciousActivity(userId)) {
    return {
      valid: false,
      message: '⚠️ Phát hiện hoạt động bất thường. Để bảo mật, vui lòng liên hệ hỗ trợ hoặc thử lại sau 1 giờ.'
    };
  }
  
  // Proceed with normal validation
  if (limitType === 'gif_caption') {
    return validateGifCaptionCreation(userId, userPlan);
  }
  
  return { valid: false, message: 'Unknown limit type' };
};

module.exports = {
  validateGifCaptionCreation,
  recordGifCaptionUsage,
  getUserUsageStats,
  validateWithSecurityCheck,
  getPlanDetails,
  getDailyUsage,
  incrementDailyUsage
};
