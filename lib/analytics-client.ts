/**
 * Google Analytics API Client
 * Connects to the Express server that provides GA data and natural language processing
 */

// Configuration
const ANALYTICS_SERVER_URL = process.env.ANALYTICS_SERVER_URL || 'http://localhost:3000';

export interface AnalyticsQuery {
  question: string;
}

export interface AnalyticsResponse {
  question: string;
  interpretation: {
    dataType: 'summary' | 'pages' | 'realtime' | 'traffic' | 'devices';
    dateRange: 'today' | 'yesterday' | '7days' | '30days' | '90days' | '12months';
    limit?: number;
  };
  data: Record<string, unknown>;
  timestamp: string;
}

export class AnalyticsClient {
  private baseUrl: string;

  constructor(baseUrl: string = ANALYTICS_SERVER_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Process a natural language query about analytics data
   */
  async processQuery(question: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AnalyticsResponse = await response.json();
      
      // Format the response into natural language
      return this.formatResponse(data);
    } catch (error) {
      console.error('Analytics query error:', error);
      throw new Error(`Failed to process analytics query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if the analytics server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get raw analytics summary data
   */
  async getSummary(dateRange: string = '30days') {
    const response = await fetch(`${this.baseUrl}/api/summary?dateRange=${dateRange}`);
    if (!response.ok) throw new Error(`Failed to fetch summary: ${response.statusText}`);
    return response.json();
  }

  /**
   * Get top pages data
   */
  async getTopPages(dateRange: string = '30days', limit: number = 10) {
    const response = await fetch(`${this.baseUrl}/api/pages?dateRange=${dateRange}&limit=${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch pages: ${response.statusText}`);
    return response.json();
  }

  /**
   * Get traffic sources data
   */
  async getTrafficSources(dateRange: string = '30days', limit: number = 10) {
    const response = await fetch(`${this.baseUrl}/api/traffic?dateRange=${dateRange}&limit=${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch traffic: ${response.statusText}`);
    return response.json();
  }

  /**
   * Get device breakdown data
   */
  async getDeviceBreakdown(dateRange: string = '30days') {
    const response = await fetch(`${this.baseUrl}/api/devices?dateRange=${dateRange}`);
    if (!response.ok) throw new Error(`Failed to fetch devices: ${response.statusText}`);
    return response.json();
  }

  /**
   * Get real-time users data
   */
  async getRealtimeUsers() {
    const response = await fetch(`${this.baseUrl}/api/realtime`);
    if (!response.ok) throw new Error(`Failed to fetch realtime: ${response.statusText}`);
    return response.json();
  }

  /**
   * Format the analytics response into natural language
   */
  private formatResponse(data: AnalyticsResponse): string {
    const { interpretation, data: analyticsData, question } = data;
    
    try {
      switch (interpretation.dataType) {
        case 'summary':
          return this.formatSummaryResponse(analyticsData, interpretation.dateRange);
        
        case 'pages':
          return this.formatPagesResponse(analyticsData, interpretation.dateRange);
        
        case 'traffic':
          return this.formatTrafficResponse(analyticsData, interpretation.dateRange);
        
        case 'devices':
          return this.formatDevicesResponse(analyticsData, interpretation.dateRange);
        
        case 'realtime':
          return this.formatRealtimeResponse(analyticsData);
        
        default:
          return this.formatSummaryResponse(analyticsData, interpretation.dateRange);
      }
    } catch (error) {
      console.error('Error formatting response:', error);
      return `I found some data related to your question "${question}", but encountered an issue formatting it. Please try rephrasing your question or ask for specific metrics.`;
    }
  }

  private formatSummaryResponse(data: Record<string, unknown>, dateRange: string): string {
    const { metrics, dateRange: { startDate, endDate } } = data;
    
    const dateRangeText = this.formatDateRange(dateRange, startDate, endDate);
    const sessionDuration = (metrics.avgSessionDuration / 60).toFixed(1);
    const bounceRatePercent = (metrics.bounceRate * 100).toFixed(1);
    const engagementRatePercent = (metrics.engagementRate * 100).toFixed(1);
    
    return `📊 **Analytics Summary** ${dateRangeText}

**Key Metrics:**
• Total Users: ${metrics.activeUsers.toLocaleString()}
• New Users: ${metrics.newUsers.toLocaleString()} (${((metrics.newUsers / metrics.activeUsers) * 100).toFixed(1)}% of total)
• Sessions: ${metrics.sessions.toLocaleString()}
• Page Views: ${metrics.pageViews.toLocaleString()}

**Engagement:**
• Avg Session Duration: ${sessionDuration} minutes
• Bounce Rate: ${bounceRatePercent}%
• Engagement Rate: ${engagementRatePercent}%

This gives you a solid overview of how your site is performing overall!`;
  }

  private formatPagesResponse(data: Record<string, unknown>, dateRange: string): string {
    const { pages, dateRange: { startDate, endDate } } = data;
    
    if (!pages || pages.length === 0) {
      return `I couldn't find any page data for ${this.formatDateRange(dateRange, startDate, endDate)}. This might be due to low traffic or data processing delays.`;
    }
    
    const dateRangeText = this.formatDateRange(dateRange, startDate, endDate);
    
    let response = `📄 **Top Performing Pages** ${dateRangeText}\n\n`;
    
    pages.slice(0, 5).forEach((page: Record<string, unknown>, index: number) => {
      const avgDuration = (page.avgDuration / 60).toFixed(1);
      const bounceRate = (page.bounceRate * 100).toFixed(1);
      
      response += `**${index + 1}. ${page.title || 'Untitled Page'}**\n`;
      response += `   📍 Path: \`${page.path}\`\n`;
      response += `   👁️ Views: ${page.views.toLocaleString()} | 👤 Users: ${page.users.toLocaleString()}\n`;
      response += `   ⏱️ Avg Time: ${avgDuration}min | 📊 Bounce Rate: ${bounceRate}%\n\n`;
    });
    
    if (pages.length > 5) {
      response += `... and ${pages.length - 5} more pages in your data.`;
    }
    
    return response;
  }

  private formatTrafficResponse(data: Record<string, unknown>, dateRange: string): string {
    const { sources, dateRange: { startDate, endDate } } = data;
    
    if (!sources || sources.length === 0) {
      return `I couldn't find any traffic source data for ${this.formatDateRange(dateRange, startDate, endDate)}.`;
    }
    
    const dateRangeText = this.formatDateRange(dateRange, startDate, endDate);
    const totalSessions = sources.reduce((sum: number, source: Record<string, unknown>) => sum + (source.sessions as number), 0);
    
    let response = `🔍 **Traffic Sources** ${dateRangeText}\n\n`;
    
    sources.slice(0, 8).forEach((source: Record<string, unknown>, index: number) => {
      const percentage = ((source.sessions / totalSessions) * 100).toFixed(1);
      const bounceRate = (source.bounceRate * 100).toFixed(1);
      
      response += `**${index + 1}. ${source.source} / ${source.medium}** (${percentage}%)\n`;
      response += `   📈 Sessions: ${source.sessions.toLocaleString()} | 👥 Users: ${source.users.toLocaleString()}\n`;
      response += `   🆕 New Users: ${source.newUsers.toLocaleString()} | 📊 Bounce Rate: ${bounceRate}%\n\n`;
    });
    
    return response;
  }

  private formatDevicesResponse(data: Record<string, unknown>, dateRange: string): string {
    const { devices, dateRange: { startDate, endDate } } = data;
    
    if (!devices || devices.length === 0) {
      return `I couldn't find any device data for ${this.formatDateRange(dateRange, startDate, endDate)}.`;
    }
    
    const dateRangeText = this.formatDateRange(dateRange, startDate, endDate);
    
    // Group by device category
    const deviceGroups: Record<string, Record<string, unknown>> = {};
    devices.forEach((device: Record<string, unknown>) => {
      if (!deviceGroups[device.deviceCategory]) {
        deviceGroups[device.deviceCategory] = {
          sessions: 0,
          users: 0,
          bounceRate: 0,
          count: 0,
          topOS: {},
          topBrowser: {}
        };
      }
      
      const group = deviceGroups[device.deviceCategory];
      group.sessions += device.sessions;
      group.users += device.users;
      group.bounceRate += device.bounceRate;
      group.count++;
      
      // Track top OS and browser
      group.topOS[device.operatingSystem] = (group.topOS[device.operatingSystem] || 0) + device.sessions;
      group.topBrowser[device.browser] = (group.topBrowser[device.browser] || 0) + device.sessions;
    });
    
    let response = `📱 **Device & Browser Breakdown** ${dateRangeText}\n\n`;
    
    Object.entries(deviceGroups).forEach(([deviceCategory, stats]: [string, Record<string, unknown>]) => {
      const avgBounceRate = ((stats.bounceRate / stats.count) * 100).toFixed(1);
      const topOS = Object.entries(stats.topOS as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
      const topBrowser = Object.entries(stats.topBrowser as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
      
      response += `**📊 ${deviceCategory.toUpperCase()}**\n`;
      response += `   👤 Users: ${stats.users.toLocaleString()}\n`;
      response += `   📈 Sessions: ${stats.sessions.toLocaleString()}\n`;
      response += `   📊 Avg Bounce Rate: ${avgBounceRate}%\n`;
      response += `   💻 Top OS: ${topOS ? topOS[0] : 'Unknown'}\n`;
      response += `   🌐 Top Browser: ${topBrowser ? topBrowser[0] : 'Unknown'}\n\n`;
    });
    
    return response;
  }

  private formatRealtimeResponse(data: Record<string, unknown>): string {
    const { totalActiveUsers, byLocation } = data;
    
    if (totalActiveUsers === 0) {
      return "🔴 **Real-time Users**\n\nNo active users currently on your site.";
    }
    
    let response = `🔴 **Real-time Active Users**\n\n**Total Active Users: ${totalActiveUsers}**\n\n`;
    
    if (byLocation && byLocation.length > 0) {
      // Group by location
      const locationMap: Record<string, number> = {};
      const deviceMap: Record<string, number> = {};
      
      byLocation.forEach((user: Record<string, unknown>) => {
        const location = user.city !== 'Unknown' && user.city !== '(not set)' 
          ? `${user.city}, ${user.country}` 
          : user.country as string;
        locationMap[location as string] = (locationMap[location as string] || 0) + (user.users as number);
        deviceMap[user.device as string] = (deviceMap[user.device as string] || 0) + (user.users as number);
      });
      
      // Top locations
      response += "**📍 Top Locations:**\n";
      Object.entries(locationMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([location, users]) => {
          response += `  • ${location}: ${users} users\n`;
        });
      
      // Device breakdown
      response += "\n**📱 By Device:**\n";
      Object.entries(deviceMap)
        .sort((a, b) => b[1] - a[1])
        .forEach(([device, users]) => {
          response += `  • ${device}: ${users} users\n`;
        });
    }
    
    return response;
  }

  private formatDateRange(range: string, startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    };
    
    switch (range) {
      case 'today':
        return `(Today - ${formatDate(end)})`;
      case 'yesterday':
        return `(Yesterday - ${formatDate(end)})`;
      case '7days':
        return `(Last 7 days: ${formatDate(start)} - ${formatDate(end)})`;
      case '30days':
        return `(Last 30 days: ${formatDate(start)} - ${formatDate(end)})`;
      case '90days':
        return `(Last 90 days: ${formatDate(start)} - ${formatDate(end)})`;
      case '12months':
        return `(Last 12 months: ${formatDate(start)} - ${formatDate(end)})`;
      default:
        return `(${formatDate(start)} - ${formatDate(end)})`;
    }
  }
}

// Export a default instance
export const analyticsClient = new AnalyticsClient();