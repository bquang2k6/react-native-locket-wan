/**
 * Test file để kiểm tra giới hạn GIF caption
 * Chạy từ console để test các chức năng
 */

const { 
  validateGifCaptionCreation, 
  recordGifCaptionUsage, 
  getUserUsageStats,
  getPlanDetails 
} = require('./src/services/usage-limits.service');

// Mock user và plan để test
const mockUsers = {
  freeUser: {
    uid: 'test_free_user',
    localId: 'test_free_user'
  },
  premiumUser: {
    uid: 'test_premium_user', 
    localId: 'test_premium_user'
  }
};

const mockPlans = {
  free: {
    plan_id: 'free',
    plan_info: {
      id: 'free',
      name: 'Free'
    }
  },
  premium: {
    plan_id: 'premium',
    plan_info: {
      id: 'premium', 
      name: 'Premium'
    }
  },
  proPlus: {
    plan_id: 'pro_plus',
    plan_info: {
      id: 'pro_plus',
      name: 'Pro Plus'
    }
  }
};

/**
 * Test GIF caption daily limits
 */
const testGifCaptionLimits = () => {
  console.log('\n=== Testing GIF Caption Daily Limits ===');
  
  const freeUser = mockUsers.freeUser;
  const freePlan = mockPlans.free;
  
  console.log('\n--- Free Plan GIF Caption Tests (2/day) ---');
  
  // First gif caption should pass
  const first = validateGifCaptionCreation(freeUser.uid, freePlan);
  console.log('First GIF caption (should pass):', first);
  
  if (first.valid) {
    recordGifCaptionUsage(freeUser.uid);
  }
  
  // Second gif caption should pass
  const second = validateGifCaptionCreation(freeUser.uid, freePlan);
  console.log('Second GIF caption (should pass):', second);
  
  if (second.valid) {
    recordGifCaptionUsage(freeUser.uid);
  }
  
  // Third gif caption should fail
  const third = validateGifCaptionCreation(freeUser.uid, freePlan);
  console.log('Third GIF caption (should fail):', third);
  
  // Test usage stats
  const stats = getUserUsageStats(freeUser.uid, freePlan);
  console.log('Usage stats after 2 GIF captions:', stats);
};

/**
 * Test premium plan unlimited features
 */
const testPremiumUnlimited = () => {
  console.log('\n=== Testing Premium Unlimited Features ===');
  
  const premiumUser = mockUsers.premiumUser;
  const premiumPlan = mockPlans.premium;
  
  console.log('\n--- Premium Plan GIF Caption Tests (10/day) ---');
  
  // Should pass multiple times
  for (let i = 1; i <= 5; i++) {
    const result = validateGifCaptionCreation(premiumUser.uid, premiumPlan);
    console.log(`GIF Caption attempt ${i}:`, result);
    if (result.valid) {
      recordGifCaptionUsage(premiumUser.uid);
    }
  }
  
  const stats = getUserUsageStats(premiumUser.uid, premiumPlan);
  console.log('Premium usage stats after 5 GIF captions:', stats);
};

/**
 * Test pro plus plan unlimited features
 */
const testProPlusUnlimited = () => {
  console.log('\n=== Testing Pro Plus Unlimited Features ===');
  
  const proPlusUser = mockUsers.premiumUser;
  const proPlusPlan = mockPlans.proPlus;
  
  console.log('\n--- Pro Plus Plan GIF Caption Tests (unlimited) ---');
  
  // Should pass multiple times (unlimited)
  for (let i = 1; i <= 10; i++) {
    const result = validateGifCaptionCreation(proPlusUser.uid, proPlusPlan);
    console.log(`GIF Caption attempt ${i}:`, result);
    if (result.valid) {
      recordGifCaptionUsage(proPlusUser.uid);
    }
  }
  
  const stats = getUserUsageStats(proPlusUser.uid, proPlusPlan);
  console.log('Pro Plus usage stats after 10 GIF captions:', stats);
};

/**
 * Test plan limits configuration
 */
const testPlanLimits = () => {
  console.log('\n=== Testing Plan Limits Configuration ===');
  
  const plans = ['free', 'premium_lite', 'premium', 'pro_plus'];
  
  plans.forEach(planId => {
    const limits = getPlanDetails(planId);
    console.log(`${planId} plan limits:`, limits);
  });
};

/**
 * Test file system storage
 */
const testFileStorage = () => {
  console.log('\n=== Testing File System Storage ===');
  
  const testUserId = 'test_storage_user';
  const testPlan = mockPlans.free;
  
  // Test initial state
  const initialStats = getUserUsageStats(testUserId, testPlan);
  console.log('Initial stats:', initialStats);
  
  // Test recording usage
  recordGifCaptionUsage(testUserId);
  const afterFirstUsage = getUserUsageStats(testUserId, testPlan);
  console.log('After first usage:', afterFirstUsage);
  
  // Test recording multiple usages
  recordGifCaptionUsage(testUserId);
  const afterSecondUsage = getUserUsageStats(testUserId, testPlan);
  console.log('After second usage:', afterSecondUsage);
  
  // Test limit enforcement
  const validation = validateGifCaptionCreation(testUserId, testPlan);
  console.log('Validation after 2 usages:', validation);
};

/**
 * Run all tests
 */
const runAllTests = () => {
  console.log('🧪 Starting Usage Limits Tests...\n');
  
  testPlanLimits();
  testFileStorage();
  testGifCaptionLimits();
  testPremiumUnlimited();
  testProPlusUnlimited();
  
  console.log('\n✅ All tests completed!');
  console.log('\n💡 Tip: Check storage files for usage data:');
  console.log('- storage/usage_data.json contains usage counts');
  console.log('- storage/activity_log.json contains activity logs');
};

// Auto-run tests if this file is executed directly
if (require.main === module) {
  try {
    runAllTests();
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Export để có thể chạy từ console
if (typeof window !== 'undefined') {
  window.testUsageLimits = {
    runAllTests,
    testGifCaptionLimits,
    testPremiumUnlimited,
    testProPlusUnlimited,
    testPlanLimits,
    testFileStorage
  };
}

module.exports = {
  runAllTests,
  testGifCaptionLimits,
  testPremiumUnlimited,
  testProPlusUnlimited,
  testPlanLimits,
  testFileStorage
};
