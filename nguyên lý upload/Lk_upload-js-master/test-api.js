/**
 * Test API endpoints cho Usage Limits
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test_user_123';

// Test data
const testData = {
  userId: TEST_USER_ID,
  limitType: 'gif_caption',
  userPlan: {
    plan_id: 'free'
  }
};

/**
 * Test usage check endpoint
 */
const testUsageCheck = async () => {
  console.log('\n=== Testing Usage Check Endpoint ===');
  
  try {
    const response = await axios.post(`${BASE_URL}/usage/check`, testData);
    console.log('✅ Usage check response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Usage check error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Test usage record endpoint
 */
const testUsageRecord = async () => {
  console.log('\n=== Testing Usage Record Endpoint ===');
  
  try {
    const response = await axios.post(`${BASE_URL}/usage/record`, {
      userId: TEST_USER_ID,
      limitType: 'gif_caption'
    });
    console.log('✅ Usage record response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Usage record error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Test usage stats endpoint
 */
const testUsageStats = async () => {
  console.log('\n=== Testing Usage Stats Endpoint ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/usage/stats/${TEST_USER_ID}`);
    console.log('✅ Usage stats response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Usage stats error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Test usage limits endpoint
 */
const testUsageLimits = async () => {
  console.log('\n=== Testing Usage Limits Endpoint ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/usage/limits`);
    console.log('✅ Usage limits response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Usage limits error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Test upload with GIF caption limit
 */
const testUploadWithLimit = async () => {
  console.log('\n=== Testing Upload with GIF Caption Limit ===');
  
  try {
    // Test multiple uploads to hit limit
    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- Upload attempt ${i} ---`);
      
      const formData = new FormData();
      formData.append('userId', TEST_USER_ID);
      formData.append('idToken', 'test_token');
      formData.append('caption', `Test GIF caption ${i}`);
      formData.append('options', JSON.stringify({
        type: 'image_gif',
        icon: 'https://example.com/test.gif'
      }));
      
      // Mock image file
      const mockImage = Buffer.from('fake image data');
      formData.append('images', mockImage, {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      });
      
      try {
        const response = await axios.post(`${BASE_URL}/locket/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(`✅ Upload ${i} successful:`, response.data);
      } catch (error) {
        console.log(`❌ Upload ${i} failed:`, error.response?.data || error.message);
        
        if (error.response?.data?.error === 'GIF_CAPTION_LIMIT_EXCEEDED') {
          console.log('🎯 GIF caption limit correctly enforced!');
          break;
        }
      }
    }
  } catch (error) {
    console.log('❌ Upload test error:', error.message);
  }
};

/**
 * Run all API tests
 */
const runAllAPITests = async () => {
  console.log('🧪 Starting API Tests...\n');
  
  await testUsageLimits();
  await testUsageCheck();
  await testUsageRecord();
  await testUsageStats();
  await testUploadWithLimit();
  
  console.log('\n✅ All API tests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllAPITests().catch(console.error);
}

module.exports = {
  testUsageCheck,
  testUsageRecord,
  testUsageStats,
  testUsageLimits,
  testUploadWithLimit,
  runAllAPITests
};
