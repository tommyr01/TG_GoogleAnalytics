# GA Analytics Agent - Simple Requirements

## What This Agent Does
An intelligent Google Analytics dashboard agent that combines visual analytics dashboards with conversational AI to provide insights, identify issues, and suggest optimizations for the TalentGuard GA4 property.

## Core Features (MVP)
1. **Visual Dashboard Interface**: Five key dashboard pages (Traffic & Acquisition, Pages, Audience, Conversions, Devices) with real-time GA4 data visualization
2. **Conversational Chat Interface**: Natural language queries for analytics data with intelligent responses including charts and tables
3. **Proactive Insights Engine**: Automatically identifies performance issues, anomalies, and provides optimization suggestions

## Technical Setup

### Model
- **Provider**: OpenAI
- **Model**: gpt-4-turbo
- **Why**: Excellent at data analysis, chart generation, and conversational responses with structured output capabilities

### Architecture Type
- **Hybrid Dashboard/Conversational Agent**: Combines traditional dashboard UI with intelligent chat interface
- **Frontend**: React/Next.js dashboard with embedded Pydantic AI chat component
- **Backend**: Pydantic AI agent connecting to existing GA MCP server

### Required Tools
1. **GA MCP Client**: Interface with existing localhost:3000 GA server endpoints
2. **Chart Generator**: Create visualizations from analytics data for chat responses
3. **Anomaly Detector**: Identify unusual patterns and performance issues
4. **Insight Generator**: Generate actionable optimization recommendations

### External Services
- **GA MCP Server**: Existing REST API at localhost:3000 providing GA4 data
- **Vercel**: Deployment platform for external access
- **TalentGuard GA4**: Source analytics property

### Available API Endpoints
- `/api/summary`: Overview metrics and KPIs
- `/api/pages`: Page performance data
- `/api/traffic`: Traffic sources and acquisition data
- `/api/devices`: Device and browser analytics
- `/api/query`: Custom analytics queries

## Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key
GA_MCP_SERVER_URL=http://localhost:3000
VERCEL_URL=your-deployment-url
NODE_ENV=production
```

## Dashboard Pages Structure
1. **Traffic & Acquisition**: Sessions, users, traffic sources, campaigns
2. **Pages**: Page views, bounce rates, top performing content
3. **Audience**: Demographics, interests, user behavior
4. **Conversions**: Goal completions, conversion paths, revenue
5. **Devices**: Device types, browsers, screen resolutions

## Chat Interface Capabilities
- Natural language analytics queries ("Show me top pages this week")
- Data visualization generation in responses
- Proactive alerts and insights
- Optimization recommendations
- Trend analysis and forecasting

## Success Criteria
- [ ] Dashboard displays real-time GA4 data across all five sections
- [ ] Chat interface responds accurately to natural language analytics queries
- [ ] Agent proactively identifies at least 3 types of performance issues
- [ ] Successfully deploys to Vercel with external access
- [ ] Handles API rate limits and errors gracefully
- [ ] Generates charts and tables in conversational responses

## Assumptions Made
- GA MCP server at localhost:3000 is stable and provides consistent data format
- TalentGuard GA4 property has sufficient data volume for meaningful insights
- Users will primarily access via web browser (responsive design)
- Real-time data updates acceptable with 5-minute refresh intervals
- Chat responses should include both text explanations and visual elements
- Deployment will handle localhost:3000 connectivity in production environment

## Technical Considerations
- **Data Refresh**: 5-minute intervals for dashboard, real-time for chat queries
- **Performance**: Cache frequently requested data, optimize chart rendering
- **Security**: API rate limiting, input validation for chat queries
- **Scalability**: Stateless agent design for Vercel serverless deployment

## Integration Points
- **Frontend Dashboard**: React components consuming GA MCP API
- **Pydantic AI Agent**: Handles chat interface and intelligent analysis
- **GA MCP Server**: Existing data pipeline (no modifications needed)
- **Vercel Deployment**: Serverless functions for AI agent, static hosting for dashboard

---
Generated: 2025-09-03
Note: This is an MVP focusing on dashboard visualization and conversational intelligence. Advanced features like custom alerts, report scheduling, and multi-property support can be added after core functionality works.