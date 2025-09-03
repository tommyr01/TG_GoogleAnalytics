## FEATURE:

We want to create a Google Analytics 4 (GA4) MCP server that provides comprehensive access to analytics data through the Google Analytics Data API.

## ADDITIONAL FEATURES:

- **Google Analytics Data API v1** integration for GA4 properties
- **Service account authentication** using JSON key file credentials stored locally
- **Comprehensive analytics tools** for querying various metrics and dimensions
- **Real-time analytics** support for live user tracking
- **Custom report generation** with flexible dimension/metric combinations
- **Traffic analysis tools** for understanding user sources and behavior
- **Device and demographic breakdowns** for audience insights
- **Content performance tracking** for top pages and user engagement
- **Time-based filtering** with preset date ranges (today, 7days, 30days, 90days, 12months)
- **Secure credential management** through environment variables

## TECHNICAL REQUIREMENTS:

- Use `@google-analytics/data` npm package for GA4 API access
- Service account authentication with JSON key file
- Environment variables: `GA_PROPERTY_ID` and `GOOGLE_APPLICATION_CREDENTIALS` 
- TypeScript with strict typing
- Zod for input validation on all tools
- Standard MCP response format for all tools
- Proper error handling with user-friendly messages

## TOOLS TO IMPLEMENT:

1. **getAnalyticsSummary** - Overview of key metrics for a date range
2. **getTopPages** - Most viewed pages/content with engagement metrics
3. **getTrafficSources** - Traffic sources, referrers, and campaigns
4. **getDeviceBreakdown** - Device, OS, and browser statistics
5. **getUserDemographics** - User demographics and geography data
6. **getRealtimeUsers** - Current active users with location and device info
7. **getCustomReport** - Flexible custom reports with any dimensions/metrics
8. **getEventTracking** - Track custom events and conversions
9. **getAudienceSegments** - Analyze different audience segments
10. **getPagePerformance** - Page load times and performance metrics

## OTHER CONSIDERATIONS:

- **GA4 Property Access**: Service account must have Viewer access to the GA4 property
- **Rate Limiting**: Implement appropriate rate limiting for API calls
- **Response Formatting**: Clean, readable output formatting for all tools
- **Metric Calculations**: Proper handling of percentage metrics and duration formatting
- **Connection Testing**: Validate GA connection on server startup
- **Deployment**: Should work both locally (stdio transport) and on Cloudflare Workers