/**
 * Standalone Node.js Express server for Google Analytics API
 * This runs in a traditional Node.js environment with full Node.js API access
 */

import express from 'express';
import cors from 'cors';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), '.dev.vars'),
  quiet: true
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize clients
let analyticsClient: BetaAnalyticsDataClient;
let openaiClient: OpenAI;

async function initializeClients() {
  // Initialize GA client
  const keyFile = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
  const auth = new GoogleAuth({
    credentials: keyFile,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  analyticsClient = new BetaAnalyticsDataClient({ auth });

  // Initialize OpenAI client
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Date range helper
function parseDateRange(range: string) {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case 'today':
      break;
    case 'yesterday':
      endDate.setDate(endDate.getDate() - 1);
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7days':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '12months':
      startDate.setMonth(startDate.getMonth() - 12);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// GA Data fetching functions
async function getAnalyticsSummary(dateRange = '30days') {
  const { startDate, endDate } = parseDateRange(dateRange);
  
  const [response] = await analyticsClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'engagementRate' },
    ],
  });

  const metrics = response.rows?.[0]?.metricValues || [];
  
  return {
    dateRange: { startDate, endDate },
    metrics: {
      sessions: parseInt(metrics[0]?.value || '0'),
      activeUsers: parseInt(metrics[1]?.value || '0'),
      newUsers: parseInt(metrics[2]?.value || '0'),
      pageViews: parseInt(metrics[3]?.value || '0'),
      avgSessionDuration: parseFloat(metrics[4]?.value || '0'),
      bounceRate: parseFloat(metrics[5]?.value || '0'),
      engagementRate: parseFloat(metrics[6]?.value || '0'),
    }
  };
}

async function getTopPages(dateRange = '30days', limit = 10) {
  const { startDate, endDate } = parseDateRange(dateRange);
  
  const [response] = await analyticsClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' },
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    limit,
    orderBys: [
      {
        metric: { metricName: 'screenPageViews' },
        desc: true,
      },
    ],
  });

  return {
    dateRange: { startDate, endDate },
    pages: response.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
      avgDuration: parseFloat(row.metricValues?.[2]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
    })) || []
  };
}

async function getTrafficSources(dateRange = '30days', limit = 10) {
  const { startDate, endDate } = parseDateRange(dateRange);
  
  const [response] = await analyticsClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'bounceRate' },
    ],
    limit,
    orderBys: [
      {
        metric: { metricName: 'sessions' },
        desc: true,
      },
    ],
  });

  return {
    dateRange: { startDate, endDate },
    sources: response.rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || '',
      medium: row.dimensionValues?.[1]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
      newUsers: parseInt(row.metricValues?.[2]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
    })) || []
  };
}

async function getDeviceBreakdown(dateRange = '30days') {
  const { startDate, endDate } = parseDateRange(dateRange);
  
  const [response] = await analyticsClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'deviceCategory' },
      { name: 'operatingSystem' },
      { name: 'browser' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'bounceRate' },
    ],
    orderBys: [
      {
        metric: { metricName: 'sessions' },
        desc: true,
      },
    ],
  });

  return {
    dateRange: { startDate, endDate },
    devices: response.rows?.map(row => ({
      deviceCategory: row.dimensionValues?.[0]?.value || '',
      operatingSystem: row.dimensionValues?.[1]?.value || '',
      browser: row.dimensionValues?.[2]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
    })) || []
  };
}

async function getRealtimeUsers() {
  const [response] = await analyticsClient.runRealtimeReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dimensions: [
      { name: 'country' },
      { name: 'city' },
      { name: 'deviceCategory' },
    ],
    metrics: [{ name: 'activeUsers' }],
  });

  const totalUsers = response.rows?.reduce(
    (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'),
    0
  ) || 0;

  return {
    totalActiveUsers: totalUsers,
    byLocation: response.rows?.map(row => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      city: row.dimensionValues?.[1]?.value || 'Unknown',
      device: row.dimensionValues?.[2]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || []
  };
}

// Natural language query interpreter
async function interpretQuery(question: string) {
  const systemPrompt = `You are a Google Analytics query interpreter. Convert natural language questions into specific data requests.
  
Available data types:
- summary: Overall metrics (sessions, users, pageviews, bounce rate, etc.)
- pages: Top pages with traffic data
- realtime: Current active users
- traffic: Traffic sources and referrers
- devices: Device and browser breakdown

Respond with JSON only:
{
  "dataType": "summary|pages|realtime|traffic|devices",
  "dateRange": "today|yesterday|7days|30days|90days|12months",
  "limit": number (optional, for list results)
}`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    property: process.env.GA_PROPERTY_ID,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/summary', async (req, res) => {
  try {
    const dateRange = req.query.dateRange as string || '30days';
    const data = await getAnalyticsSummary(dateRange);
    res.json(data);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics summary',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/pages', async (req, res) => {
  try {
    const dateRange = req.query.dateRange as string || '30days';
    const limit = parseInt(req.query.limit as string || '10');
    const data = await getTopPages(dateRange, limit);
    res.json(data);
  } catch (error) {
    console.error('Pages error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch top pages',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/traffic', async (req, res) => {
  try {
    const dateRange = req.query.dateRange as string || '30days';
    const limit = parseInt(req.query.limit as string || '10');
    const data = await getTrafficSources(dateRange, limit);
    res.json(data);
  } catch (error) {
    console.error('Traffic error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch traffic sources',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/devices', async (req, res) => {
  try {
    const dateRange = req.query.dateRange as string || '30days';
    const data = await getDeviceBreakdown(dateRange);
    res.json(data);
  } catch (error) {
    console.error('Devices error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device breakdown',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/realtime', async (req, res) => {
  try {
    const data = await getRealtimeUsers();
    res.json(data);
  } catch (error) {
    console.error('Realtime error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch realtime users',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Interpret the question
    const interpretation = await interpretQuery(question);
    
    // Fetch appropriate data based on interpretation
    let data: any;
    switch (interpretation.dataType) {
      case 'summary':
        data = await getAnalyticsSummary(interpretation.dateRange);
        break;
      case 'pages':
        data = await getTopPages(interpretation.dateRange, interpretation.limit || 10);
        break;
      case 'traffic':
        data = await getTrafficSources(interpretation.dateRange, interpretation.limit || 10);
        break;
      case 'devices':
        data = await getDeviceBreakdown(interpretation.dateRange);
        break;
      case 'realtime':
        data = await getRealtimeUsers();
        break;
      default:
        data = await getAnalyticsSummary(interpretation.dateRange);
    }

    // Format response with interpretation
    const response = {
      question,
      interpretation,
      data,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start server
async function startServer() {
  try {
    await initializeClients();
    
    app.listen(PORT, () => {
      console.log(`🚀 GA Analytics API server running on port ${PORT}`);
      console.log(`📊 Property ID: ${process.env.GA_PROPERTY_ID}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();