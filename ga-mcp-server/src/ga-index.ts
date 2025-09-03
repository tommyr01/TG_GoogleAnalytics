#!/usr/bin/env node

/**
 * Google Analytics MCP Server
 * Provides comprehensive GA4 data access through MCP tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables with quiet mode to avoid stdout pollution
dotenv.config({ 
  path: path.resolve(process.cwd(), ".dev.vars"),
  quiet: true // Suppress dotenv logs to avoid MCP protocol issues
});

// Types
interface Env {
  GA_PROPERTY_ID: string;
  GOOGLE_APPLICATION_CREDENTIALS: string;
}

// Initialize environment
const env: Env = {
  GA_PROPERTY_ID: process.env.GA_PROPERTY_ID || "",
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
};

// Validate environment
if (!env.GA_PROPERTY_ID || !env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Write to stderr directly to avoid MCP protocol issues
  process.stderr.write("Error: Missing required environment variables\n");
  process.stderr.write("Please set GA_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS in .dev.vars\n");
  process.exit(1);
}

// Initialize GA client
let analyticsClient: BetaAnalyticsDataClient;

async function initializeAnalyticsClient() {
  try {
    const keyFile = JSON.parse(
      fs.readFileSync(env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
    );

    const auth = new GoogleAuth({
      credentials: keyFile,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    analyticsClient = new BetaAnalyticsDataClient({ auth });
    // Connection successful - no console output to avoid protocol issues
  } catch (error) {
    process.stderr.write(`Failed to initialize GA client: ${error}\n`);
    process.exit(1);
  }
}

// Helper functions
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

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
      startDate.setDate(startDate.getDate() - 7);
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

// Create server
const server = new McpServer({
  name: "google-analytics-mcp",
  version: "1.0.0",
});

// Tool Schemas
const DateRangeSchema = z.object({
  dateRange: z
    .enum(["today", "yesterday", "7days", "30days", "90days", "12months"])
    .optional()
    .describe("Time period for the report"),
});

const TopPagesSchema = z.object({
  dateRange: z
    .enum(["today", "yesterday", "7days", "30days", "90days", "12months"])
    .optional(),
  limit: z.number().min(1).max(100).optional().describe("Number of results to return"),
});

const CustomReportSchema = z.object({
  dateRange: z
    .enum(["today", "yesterday", "7days", "30days", "90days", "12months"])
    .optional(),
  dimensions: z.array(z.string()).optional().describe("GA4 dimensions to include"),
  metrics: z.array(z.string()).optional().describe("GA4 metrics to include"),
  limit: z.number().min(1).max(1000).optional(),
});

// Register Tools
async function registerTools() {
  // Tool 1: Analytics Summary
  server.tool(
    "getAnalyticsSummary",
    "Get a comprehensive summary of key analytics metrics for a specified date range",
    DateRangeSchema,
    async ({ dateRange = "7days" }) => {
      try {
        const range = parseDateRange(dateRange);
        
        const [response] = await analyticsClient.runReport({
          property: `properties/${env.GA_PROPERTY_ID}`,
          dateRanges: [range],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
            { name: "newUsers" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: true }],
        });

        // Calculate totals
        let totals = {
          users: 0,
          sessions: 0,
          pageViews: 0,
          newUsers: 0,
          avgDuration: 0,
          avgBounceRate: 0,
        };

        if (response.rows && response.rows.length > 0) {
          response.rows.forEach((row) => {
            totals.users += parseInt(row.metricValues?.[0]?.value || "0");
            totals.sessions += parseInt(row.metricValues?.[1]?.value || "0");
            totals.pageViews += parseInt(row.metricValues?.[2]?.value || "0");
            totals.newUsers += parseInt(row.metricValues?.[5]?.value || "0");
          });

          const rowCount = response.rows.length;
          totals.avgDuration =
            response.rows.reduce(
              (sum, row) => sum + parseFloat(row.metricValues?.[3]?.value || "0"),
              0
            ) / rowCount;
          totals.avgBounceRate =
            (response.rows.reduce(
              (sum, row) => sum + parseFloat(row.metricValues?.[4]?.value || "0"),
              0
            ) /
              rowCount) *
            100;
        }

        const text = `📊 **Analytics Summary** (${range.startDate} to ${range.endDate})

**Key Metrics:**
• Total Users: ${totals.users.toLocaleString()}
• New Users: ${totals.newUsers.toLocaleString()}
• Sessions: ${totals.sessions.toLocaleString()}
• Page Views: ${totals.pageViews.toLocaleString()}

**Engagement:**
• Avg Session Duration: ${totals.avgDuration.toFixed(2)} seconds
• Avg Bounce Rate: ${totals.avgBounceRate.toFixed(2)}%

Data points: ${response.rowCount || response.rows?.length || 0} days`;

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `**Error:** Failed to fetch analytics summary\n\n${error instanceof Error ? error.message : String(error)}`,
              isError: true,
            },
          ],
        };
      }
    }
  );

  // Tool 2: Top Pages
  server.tool(
    "getTopPages",
    "Get the most viewed pages/content with engagement metrics",
    TopPagesSchema,
    async ({ dateRange = "7days", limit = 10 }) => {
      try {
        const range = parseDateRange(dateRange);

        const [response] = await analyticsClient.runReport({
          property: `properties/${env.GA_PROPERTY_ID}`,
          dateRanges: [range],
          dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
          metrics: [
            { name: "screenPageViews" },
            { name: "activeUsers" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
          ],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit,
        });

        let text = `📄 **Top ${limit} Pages** (${range.startDate} to ${range.endDate})\n\n`;

        if (response.rows && response.rows.length > 0) {
          response.rows.forEach((row, index) => {
            const title = row.dimensionValues?.[0]?.value || "Unknown";
            const path = row.dimensionValues?.[1]?.value || "/";
            const views = parseInt(row.metricValues?.[0]?.value || "0").toLocaleString();
            const users = parseInt(row.metricValues?.[1]?.value || "0").toLocaleString();
            const duration = parseFloat(row.metricValues?.[2]?.value || "0").toFixed(2);
            const bounceRate = (parseFloat(row.metricValues?.[3]?.value || "0") * 100).toFixed(2);

            text += `**${index + 1}. ${title}**\n`;
            text += `   📍 Path: \`${path}\`\n`;
            text += `   👁️ Views: ${views} | 👤 Users: ${users}\n`;
            text += `   ⏱️ Avg Duration: ${duration}s | 📊 Bounce Rate: ${bounceRate}%\n\n`;
          });
        } else {
          text += "No data available for this period.";
        }

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `**Error:** Failed to fetch top pages\n\n${error instanceof Error ? error.message : String(error)}`,
              isError: true,
            },
          ],
        };
      }
    }
  );

  // Tool 3: Traffic Sources
  server.tool(
    "getTrafficSources",
    "Get traffic sources, referrers, and campaign data",
    DateRangeSchema,
    async ({ dateRange = "7days" }) => {
      try {
        const range = parseDateRange(dateRange);

        const [response] = await analyticsClient.runReport({
          property: `properties/${env.GA_PROPERTY_ID}`,
          dateRanges: [range],
          dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 15,
        });

        let text = `🔍 **Traffic Sources** (${range.startDate} to ${range.endDate})\n\n`;

        if (response.rows && response.rows.length > 0) {
          response.rows.forEach((row, index) => {
            const source = row.dimensionValues?.[0]?.value || "direct";
            const medium = row.dimensionValues?.[1]?.value || "none";
            const sessions = parseInt(row.metricValues?.[0]?.value || "0").toLocaleString();
            const users = parseInt(row.metricValues?.[1]?.value || "0").toLocaleString();
            const pageViews = parseInt(row.metricValues?.[2]?.value || "0").toLocaleString();
            const bounceRate = (parseFloat(row.metricValues?.[3]?.value || "0") * 100).toFixed(2);

            text += `**${index + 1}. ${source} / ${medium}**\n`;
            text += `   📈 Sessions: ${sessions} | 👥 Users: ${users}\n`;
            text += `   📄 Page Views: ${pageViews} | 📊 Bounce Rate: ${bounceRate}%\n\n`;
          });
        } else {
          text += "No traffic data available for this period.";
        }

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `**Error:** Failed to fetch traffic sources\n\n${error instanceof Error ? error.message : String(error)}`,
              isError: true,
            },
          ],
        };
      }
    }
  );

  // Tool 4: Device Breakdown
  server.tool(
    "getDeviceBreakdown",
    "Get device, OS, and browser statistics",
    DateRangeSchema,
    async ({ dateRange = "7days" }) => {
      try {
        const range = parseDateRange(dateRange);

        const [response] = await analyticsClient.runReport({
          property: `properties/${env.GA_PROPERTY_ID}`,
          dateRanges: [range],
          dimensions: [{ name: "deviceCategory" }, { name: "operatingSystem" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
          ],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        });

        let text = `📱 **Device & OS Breakdown** (${range.startDate} to ${range.endDate})\n\n`;

        if (response.rows && response.rows.length > 0) {
          // Group by device category
          const deviceData: Record<string, any> = {};

          response.rows.forEach((row) => {
            const device = row.dimensionValues?.[0]?.value || "unknown";
            const os = row.dimensionValues?.[1]?.value || "unknown";

            if (!deviceData[device]) {
              deviceData[device] = {
                users: 0,
                sessions: 0,
                pageViews: 0,
                duration: 0,
                bounceRate: 0,
                count: 0,
                osList: [],
              };
            }

            const users = parseInt(row.metricValues?.[0]?.value || "0");
            deviceData[device].users += users;
            deviceData[device].sessions += parseInt(row.metricValues?.[1]?.value || "0");
            deviceData[device].pageViews += parseInt(row.metricValues?.[2]?.value || "0");
            deviceData[device].duration += parseFloat(row.metricValues?.[3]?.value || "0");
            deviceData[device].bounceRate += parseFloat(row.metricValues?.[4]?.value || "0");
            deviceData[device].count++;
            deviceData[device].osList.push({ name: os, users });
          });

          Object.entries(deviceData).forEach(([device, data]) => {
            text += `**📊 ${device.toUpperCase()}**\n`;
            text += `   👤 Users: ${data.users.toLocaleString()}\n`;
            text += `   📈 Sessions: ${data.sessions.toLocaleString()}\n`;
            text += `   📄 Page Views: ${data.pageViews.toLocaleString()}\n`;
            text += `   ⏱️ Avg Duration: ${(data.duration / data.count).toFixed(2)}s\n`;
            text += `   📊 Avg Bounce Rate: ${((data.bounceRate / data.count) * 100).toFixed(2)}%\n`;

            // Top OS for this device
            const topOS = data.osList
              .sort((a: any, b: any) => b.users - a.users)
              .slice(0, 3)
              .map((os: any) => `${os.name} (${os.users})`)
              .join(", ");
            text += `   💻 Top OS: ${topOS}\n\n`;
          });
        } else {
          text += "No device data available for this period.";
        }

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `**Error:** Failed to fetch device breakdown\n\n${error instanceof Error ? error.message : String(error)}`,
              isError: true,
            },
          ],
        };
      }
    }
  );

  // Tool 5: Real-time Users
  server.tool(
    "getRealtimeUsers",
    "Get current active users with location and device information",
    z.object({}),
    async () => {
      try {
        const [response] = await analyticsClient.runRealtimeReport({
          property: `properties/${env.GA_PROPERTY_ID}`,
          dimensions: [
            { name: "country" },
            { name: "city" },
            { name: "deviceCategory" },
          ],
          metrics: [{ name: "activeUsers" }],
        });

        let text = "🔴 **Real-time Active Users**\n\n";

        if (response.rows && response.rows.length > 0) {
          const totalUsers = response.rows.reduce(
            (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0"),
            0
          );

          text += `**Total Active Users: ${totalUsers}**\n\n`;

          // Group by location
          text += "**📍 By Location:**\n";
          const locationMap: Record<string, number> = {};

          response.rows.forEach((row) => {
            const country = row.dimensionValues?.[0]?.value || "Unknown";
            const city = row.dimensionValues?.[1]?.value || "(not set)";
            const users = parseInt(row.metricValues?.[0]?.value || "0");

            const location = city !== "(not set)" ? `${city}, ${country}` : country;
            locationMap[location] = (locationMap[location] || 0) + users;
          });

          Object.entries(locationMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([location, users]) => {
              text += `  • ${location}: ${users} users\n`;
            });

          // Group by device
          text += "\n**📱 By Device:**\n";
          const deviceMap: Record<string, number> = {};

          response.rows.forEach((row) => {
            const device = row.dimensionValues?.[2]?.value || "unknown";
            const users = parseInt(row.metricValues?.[0]?.value || "0");
            deviceMap[device] = (deviceMap[device] || 0) + users;
          });

          Object.entries(deviceMap)
            .sort((a, b) => b[1] - a[1])
            .forEach(([device, users]) => {
              text += `  • ${device}: ${users} users\n`;
            });
        } else {
          text += "No active users currently on the site.";
        }

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `**Error:** Failed to fetch real-time users\n\n${error instanceof Error ? error.message : String(error)}`,
              isError: true,
            },
          ],
        };
      }
    }
  );

  // Tool 6: Custom Report
  server.tool(
    "getCustomReport",
    "Create a custom report with specified dimensions and metrics",
    CustomReportSchema,
    async ({ dateRange = "7days", dimensions = ["date"], metrics = ["activeUsers", "sessions"], limit = 100 }) => {
      try {
        const range = parseDateRange(dateRange);

        // Build dimensions and metrics arrays
        const dimensionsArray = dimensions.map((d) => ({ name: d }));
        const metricsArray = metrics.map((m) => ({ name: m }));

        const [response] = await analyticsClient.runReport({
          property: `properties/${env.GA_PROPERTY_ID}`,
          dateRanges: [range],
          dimensions: dimensionsArray,
          metrics: metricsArray,
          limit,
        });

        let text = `📊 **Custom Report** (${range.startDate} to ${range.endDate})\n\n`;
        text += `**Dimensions:** ${dimensions.join(", ")}\n`;
        text += `**Metrics:** ${metrics.join(", ")}\n\n`;

        if (response.rows && response.rows.length > 0) {
          // Create a simple table
          response.rows.slice(0, 20).forEach((row) => {
            // Dimension values
            const dimValues = row.dimensionValues?.map((dv) => dv.value).join(" | ") || "";
            
            // Metric values
            const metricValues = row.metricValues?.map((mv, index) => {
              const metricName = metrics[index];
              let value = mv.value || "0";

              // Format based on metric type
              if (metricName.toLowerCase().includes("rate")) {
                value = (parseFloat(value) * 100).toFixed(2) + "%";
              } else if (metricName.toLowerCase().includes("duration")) {
                value = parseFloat(value).toFixed(2) + "s";
              } else if (!isNaN(parseFloat(value))) {
                value = parseInt(value).toLocaleString();
              }

              return `${metricName}: ${value}`;
            }).join(" | ") || "";

            text += `${dimValues} → ${metricValues}\n`;
          });

          if (response.rows.length > 20) {
            text += `\n... and ${response.rows.length - 20} more rows`;
          }

          text += `\n\n**Total rows:** ${response.rowCount || response.rows.length}`;
        } else {
          text += "No data available for this custom report.";
        }

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `**Error:** Failed to create custom report\n\n${error instanceof Error ? error.message : String(error)}`,
              isError: true,
            },
          ],
        };
      }
    }
  );

  // All tools registered successfully - no console output to avoid protocol issues
}

// Main function
async function main() {
  // Initialize GA client
  await initializeAnalyticsClient();

  // Register all tools
  await registerTools();

  // Create transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Server is running - no console output to avoid protocol issues
}

// Handle errors
process.on("unhandledRejection", (error) => {
  // Write errors to stderr to avoid MCP protocol issues
  process.stderr.write(`Unhandled rejection: ${error}\n`);
  process.exit(1);
});

// Run server
main().catch((error) => {
  // Write errors to stderr to avoid MCP protocol issues
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});