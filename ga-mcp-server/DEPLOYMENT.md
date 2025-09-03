# Google Analytics MCP Server - Deployment Guide

## Architecture Overview

Due to Node.js compatibility limitations with Cloudflare Workers, this project uses a proxy architecture:

1. **Node.js API Server** (`src/node-server.ts`) - Handles GA API calls with full Node.js capabilities
2. **Cloudflare Worker Proxy** (`src/worker-proxy.ts`) - Provides edge caching, CORS, and global distribution
3. **MCP Server** (`src/ga-index.ts`) - Direct MCP interface for Claude Desktop

## Current Status

✅ **Phase 1 Complete**: All components are working locally:
- MCP server connects to Google Analytics and provides 6 tools
- Node.js API server provides REST endpoints
- Cloudflare Worker proxy successfully forwards requests with caching

## Deployment Options

### Option 1: Deploy to Vercel (Recommended for Node.js Server)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/node-server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/src/node-server.ts"
       }
     ],
     "env": {
       "GA_PROPERTY_ID": "@ga-property-id",
       "GOOGLE_APPLICATION_CREDENTIALS_JSON": "@google-credentials",
       "OPENAI_API_KEY": "@openai-key",
       "OPENAI_MODEL": "gpt-3.5-turbo"
     }
   }
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel Dashboard**

### Option 2: Deploy to Google Cloud Run

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:20-slim
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "run", "node-server"]
   ```

2. **Build and deploy**:
   ```bash
   gcloud run deploy ga-analytics-api \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 3: Deploy to Railway.app

1. **Connect GitHub repo to Railway**
2. **Set environment variables in Railway dashboard**
3. **Railway will auto-deploy on push**

## Deploying the Cloudflare Worker Proxy

Once your Node.js server is deployed:

1. **Update `wrangler-proxy.toml`** with your production backend URL:
   ```toml
   [env.production]
   vars = { 
     API_BACKEND_URL = "https://your-nodejs-server.vercel.app",
     CACHE_TTL = "600"
   }
   ```

2. **Deploy to Cloudflare**:
   ```bash
   npx wrangler deploy --config wrangler-proxy.toml --env production
   ```

3. **Your API will be available at**:
   ```
   https://ga-analytics-proxy.YOUR-SUBDOMAIN.workers.dev
   ```

## API Endpoints

Once deployed, your API will provide these endpoints:

- `GET /health` - Health check
- `GET /api/summary?dateRange={period}` - Analytics summary
- `GET /api/pages?dateRange={period}&limit={n}` - Top pages
- `GET /api/traffic?dateRange={period}` - Traffic sources
- `GET /api/devices?dateRange={period}` - Device breakdown
- `GET /api/realtime` - Real-time active users
- `POST /api/query` - Natural language queries

### Date Range Options:
- `today`
- `yesterday`
- `7days`
- `30days`
- `90days`
- `12months`

## Testing the Deployment

1. **Test health endpoint**:
   ```bash
   curl https://your-api-url/health
   ```

2. **Test analytics data**:
   ```bash
   curl "https://your-api-url/api/summary?dateRange=7days"
   ```

3. **Test natural language query**:
   ```bash
   curl -X POST https://your-api-url/api/query \
     -H "Content-Type: application/json" \
     -d '{"question": "How many users visited my site this week?"}'
   ```

## Security Considerations

1. **API Keys**: Never commit API keys. Use environment variables.
2. **CORS**: Update CORS headers in production to restrict domains
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Authentication**: Add API key authentication if needed:
   - Set `API_KEY` in Worker environment
   - Check `X-API-Key` header in requests

## Next Steps (Phase 2)

1. **Build Dashboard UI**:
   - React/Vue/Svelte app that consumes these APIs
   - Display charts and metrics
   - Include natural language query interface

2. **Add Authentication**:
   - Implement user authentication
   - Allow multiple GA properties per user
   - Store user preferences

3. **Enhance Caching**:
   - Use Cloudflare KV for longer-term caching
   - Implement smart cache invalidation

4. **Add WebSocket Support**:
   - Real-time data updates
   - Live dashboard updates

## Monitoring

1. **Cloudflare Analytics**: Monitor Worker performance
2. **Vercel/Cloud Run Logs**: Track Node.js server health
3. **Google Analytics Quotas**: Monitor API usage

## Cost Estimation

- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **Vercel**: Free tier includes 100GB bandwidth/month
- **Google Cloud Run**: Free tier includes 2 million requests/month
- **Google Analytics API**: 50,000 requests/day free

## Support

For issues or questions:
1. Check the logs in your deployment platform
2. Verify environment variables are set correctly
3. Ensure Google Analytics service account has proper permissions
4. Test locally first with `npm run node-server` and `npx wrangler dev --config wrangler-proxy.toml`