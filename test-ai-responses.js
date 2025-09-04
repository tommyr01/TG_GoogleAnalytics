/**
 * Test script to verify AI-powered conversational responses
 */

const ANALYTICS_SERVER_URL = 'http://localhost:3000';

async function testAIResponse(question) {
  try {
    console.log(`\n🤖 Testing: "${question}"`);
    console.log('=' .repeat(60));
    
    const response = await fetch(`${ANALYTICS_SERVER_URL}/api/test-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data.aiResponse);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testHealthCheck() {
  try {
    console.log('🔍 Checking server health...');
    const response = await fetch(`${ANALYTICS_SERVER_URL}/health`);
    const data = await response.json();
    console.log('✅ Server is healthy:', data);
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing AI-Powered Google Analytics Chat Responses');
  console.log('====================================================');
  
  // Check if server is running
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log('\n💡 Make sure the GA analytics server is running:');
    console.log('   cd ga-mcp-server && npm run node-server');
    return;
  }

  // Test various question types
  const testQuestions = [
    "How is my website traffic doing this month?",
    "Show me my bounce rate",
    "What are my top performing pages?",
    "How many people are on my site right now?",
    "Which devices are my users using?"
  ];

  for (const question of testQuestions) {
    await testAIResponse(question);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n🎉 Test completed! The AI responses should be conversational and insightful.');
}

runTests().catch(console.error);