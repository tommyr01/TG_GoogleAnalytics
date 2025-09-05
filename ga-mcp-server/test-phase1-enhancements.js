#!/usr/bin/env node

/**
 * Test script for Phase 1 GA MCP Server AI Enhancements
 * Tests URL extraction, page path filtering, and improved AI interpretation
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const testCases = [
  {
    name: 'Specific URL Query (Main Test Case)',
    question: 'how has this page performed in the last 90 days - https://www.talentguard.com/blog/why-half-your-workforce-will-retire-without-a-successor',
    expectedDataType: 'pages',
    expectedDateRange: '90days',
    expectedPagePathFilter: '/blog/why-half-your-workforce-will-retire-without-a-successor',
    shouldHaveData: true
  },
  {
    name: 'Blog Section Query (No URL)',
    question: 'show me all blog posts performance in the last 30 days',
    expectedDataType: 'blog',
    expectedDateRange: '30days',
    expectedPagePathFilter: null,
    shouldHaveData: true
  },
  {
    name: 'General Top Pages Query',
    question: 'what are my top performing pages?',
    expectedDataType: 'pages',
    expectedDateRange: '30days',
    expectedPagePathFilter: null,
    shouldHaveData: true
  },
  {
    name: 'URL with www format',
    question: 'check performance for www.talentguard.com/about',
    expectedDataType: 'pages',
    expectedDateRange: '30days',
    expectedPagePathFilter: '/about',
    shouldHaveData: false // might not have data
  },
  {
    name: 'Non-existent URL',
    question: 'how has this non-existent page performed - https://www.talentguard.com/does/not/exist',
    expectedDataType: 'pages',
    expectedDateRange: '30days',
    expectedPagePathFilter: '/does/not/exist',
    shouldHaveData: false
  },
  {
    name: 'Traffic Sources Query',
    question: 'where is my traffic coming from?',
    expectedDataType: 'traffic',
    expectedDateRange: '30days',
    expectedPagePathFilter: null,
    shouldHaveData: true
  },
  {
    name: 'Long Date Range Query',
    question: 'how has this performed all time - https://www.talentguard.com/blog/some-article',
    expectedDataType: 'pages',
    expectedDateRange: 'alltime',
    expectedPagePathFilter: '/blog/some-article',
    shouldHaveData: false
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`Question: "${testCase.question}"`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/query`, {
      question: testCase.question
    });
    
    const { interpretation, data } = response.data;
    
    // Check interpretation
    console.log(`✓ Data Type: ${interpretation.dataType} (expected: ${testCase.expectedDataType})`);
    console.log(`✓ Date Range: ${interpretation.dateRange} (expected: ${testCase.expectedDateRange})`);
    console.log(`✓ Page Path Filter: ${interpretation.pagePathFilter || 'null'} (expected: ${testCase.expectedPagePathFilter || 'null'})`);
    
    // Validate interpretation
    let passed = true;
    
    if (interpretation.dataType !== testCase.expectedDataType) {
      console.log(`❌ FAIL: Expected dataType ${testCase.expectedDataType}, got ${interpretation.dataType}`);
      passed = false;
    }
    
    if (interpretation.dateRange !== testCase.expectedDateRange) {
      console.log(`❌ FAIL: Expected dateRange ${testCase.expectedDateRange}, got ${interpretation.dateRange}`);
      passed = false;
    }
    
    if (interpretation.pagePathFilter !== testCase.expectedPagePathFilter) {
      console.log(`❌ FAIL: Expected pagePathFilter ${testCase.expectedPagePathFilter}, got ${interpretation.pagePathFilter}`);
      passed = false;
    }
    
    // Check data presence
    let hasData = false;
    if (interpretation.dataType === 'pages' && data.pages && data.pages.length > 0) {
      hasData = true;
      console.log(`✓ Found ${data.pages.length} page(s) in results`);
      if (testCase.expectedPagePathFilter && data.pages[0]) {
        console.log(`✓ Page path: ${data.pages[0].path}`);
        console.log(`✓ Views: ${data.pages[0].views}, Users: ${data.pages[0].users}`);
      }
    } else if (interpretation.dataType === 'blog' && data.blogPages && data.blogPages.length > 0) {
      hasData = true;
      console.log(`✓ Found ${data.blogPages.length} blog page(s) in results`);
    } else if (interpretation.dataType === 'traffic' && data.sources && data.sources.length > 0) {
      hasData = true;
      console.log(`✓ Found ${data.sources.length} traffic source(s) in results`);
    }
    
    if (testCase.shouldHaveData && !hasData) {
      console.log(`⚠️  WARNING: Expected data but none found (might be normal for test data)`);
    } else if (!testCase.shouldHaveData && hasData) {
      console.log(`⚠️  Note: Found data when none expected`);
    }
    
    // Check AI response quality
    if (response.data.aiResponse && response.data.aiResponse.length > 50) {
      console.log(`✓ AI Response generated (${response.data.aiResponse.length} chars)`);
    } else {
      console.log(`❌ AI Response too short or missing`);
      passed = false;
    }
    
    return passed ? '✅ PASSED' : '❌ FAILED';
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return '❌ ERROR';
  }
}

async function runAllTests() {
  console.log('🚀 Starting Phase 1 Enhancement Tests\n');
  console.log('Testing Google Analytics MCP Server AI improvements:');
  console.log('- URL extraction and page path conversion');
  console.log('- Enhanced GA4 context in AI prompts');
  console.log('- Specific page filtering');
  console.log('- Intelligent query interpretation');
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ name: testCase.name, result });
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, result } of results) {
    console.log(`${result} ${name}`);
    if (result === '✅ PASSED') passed++;
    else failed++;
  }
  
  console.log('=' .repeat(50));
  console.log(`Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Phase 1 enhancements are working correctly.');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Please review the output above.`);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✓ GA MCP Server is running');
    return true;
  } catch (error) {
    console.log('❌ GA MCP Server is not running. Please start it with:');
    console.log('cd ga-mcp-server && npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
}

main().catch(console.error);