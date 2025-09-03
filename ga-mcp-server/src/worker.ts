/**
 * Cloudflare Worker for Google Analytics MCP Server and REST API
 * Provides both MCP protocol access and REST API endpoints for dashboard
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import { z } from "zod";
import OpenAI from "openai";

export interface Env {
  GA_PROPERTY_ID: string;
  GOOGLE_APPLICATION_CREDENTIALS: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
}

// CORS headers for dashboard access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Configure with your domain in production
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Initialize clients
let analyticsClient: BetaAnalyticsDataClient;
let openaiClient: OpenAI;

async function initializeClients(env: Env) {
  // Initialize GA client
  const keyFile = JSON.parse(env.GOOGLE_APPLICATION_CREDENTIALS);
  const auth = new GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  analyticsClient = new BetaAnalyticsDataClient({ auth });

  // Initialize OpenAI client
  openaiClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

// Date range helper
function parseDateRange(range: string) {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case "today":
      break;
    case "yesterday":
      endDate.setDate(endDate.getDate() - 1);
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "12months":
      startDate.setMonth(startDate.getMonth() - 12);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

// GA Data fetching functions
async function getAnalyticsSummary(env: Env, dateRange = "30days") {
  const { startDate, endDate } = parseDateRange(dateRange);
  
  const [response] = await analyticsClient.runReport({
    property: `properties/${env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
      { name: "engagementRate" },
    ],
  });

  const metrics = response.rows?.[0]?.metricValues || [];
  
  return {
    dateRange: { startDate, endDate },
    metrics: {
      sessions: parseInt(metrics[0]?.value || "0"),
      activeUsers: parseInt(metrics[1]?.value || "0"),
      newUsers: parseInt(metrics[2]?.value || "0"),
      pageViews: parseInt(metrics[3]?.value || "0"),
      avgSessionDuration: parseFloat(metrics[4]?.value || "0"),
      bounceRate: parseFloat(metrics[5]?.value || "0"),
      engagementRate: parseFloat(metrics[6]?.value || "0"),
    }
  };
}

async function getTopPages(env: Env, dateRange = "30days", limit = 10) {
  const { startDate, endDate } = parseDateRange(dateRange);
  
  const [response] = await analyticsClient.runReport({
    property: `properties/${env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "pagePath" },
      { name: "pageTitle" },
    ],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
    limit,
    orderBys: [
      {
        metric: { metricName: "screenPageViews" },
        desc: true,
      },
    ],
  });

  return {
    dateRange: { startDate, endDate },
    pages: response.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || "",
      title: row.dimensionValues?.[1]?.value || "",
      views: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
      avgDuration: parseFloat(row.metricValues?.[2]?.value || "0"),
      bounceRate: parseFloat(row.metricValues?.[3]?.value || "0"),
    })) || []
  };
}

async function getRealtimeUsers(env: Env) {
  const [response] = await analyticsClient.runRealtimeReport({
    property: `properties/${env.GA_PROPERTY_ID}`,
    dimensions: [
      { name: "country" },
      { name: "city" },
      { name: "deviceCategory" },
    ],
    metrics: [{ name: "activeUsers" }],
  });

  const totalUsers = response.rows?.reduce(
    (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0"),
    0
  ) || 0;

  return {
    totalActiveUsers: totalUsers,
    byLocation: response.rows?.map(row => ({
      country: row.dimensionValues?.[0]?.value || "Unknown",
      city: row.dimensionValues?.[1]?.value || "Unknown",
      device: row.dimensionValues?.[2]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    })) || []
  };
}

// Natural language query interpreter
async function interpretQuery(env: Env, question: string) {
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
    model: env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  return JSON.parse(completion.choices[0].message.content || "{}");
}

// Main request handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // Initialize clients on first request
      if (!analyticsClient) {
        await initializeClients(env);
      }

      // REST API Endpoints
      if (url.pathname === "/api/summary") {
        const dateRange = url.searchParams.get("dateRange") || "30days";
        const data = await getAnalyticsSummary(env, dateRange);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/api/pages") {
        const dateRange = url.searchParams.get("dateRange") || "30days";
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const data = await getTopPages(env, dateRange, limit);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/api/realtime") {
        const data = await getRealtimeUsers(env);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Natural language query endpoint
      if (url.pathname === "/api/query" && request.method === "POST") {
        const { question } = await request.json() as { question: string };
        
        // Interpret the question
        const interpretation = await interpretQuery(env, question);
        
        // Fetch appropriate data based on interpretation
        let data: any;
        switch (interpretation.dataType) {
          case "summary":
            data = await getAnalyticsSummary(env, interpretation.dateRange);
            break;
          case "pages":
            data = await getTopPages(env, interpretation.dateRange, interpretation.limit || 10);
            break;
          case "realtime":
            data = await getRealtimeUsers(env);
            break;
          default:
            data = await getAnalyticsSummary(env, interpretation.dateRange);
        }

        // Format response with interpretation
        const response = {
          question,
          interpretation,
          data,
          timestamp: new Date().toISOString(),
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // MCP endpoint (for Claude Desktop)
      if (url.pathname === "/mcp") {
        // This would handle MCP protocol - simplified for now
        return new Response(JSON.stringify({
          message: "MCP endpoint - connect with Claude Desktop using mcp-remote"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Health check
      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ 
          status: "healthy",
          property: env.GA_PROPERTY_ID,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 404 for unknown endpoints
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};