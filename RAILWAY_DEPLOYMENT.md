# Railway Deployment Guide for GA Analytics API

## Steps to Deploy GA Server to Railway:

### 1. Push to GitHub
```bash
git add .
git commit -m "Add GA server for Railway deployment"
git push origin main
```

### 2. Create Railway Service
1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select the `ga-server` folder as the source
4. Railway should auto-detect the Node.js app

### 3. Set Environment Variables in Railway Dashboard
Add these environment variables in Railway:

```env
GA_PROPERTY_ID=371647470
GOOGLE_APPLICATION_CREDENTIALS_JSON=[PASTE_YOUR_SERVICE_ACCOUNT_JSON]
OPENAI_API_KEY=[PASTE_YOUR_OPENAI_KEY]
NODE_ENV=production
```

**Get the values from your local .env file**

### 4. Update Vercel Environment Variables
Once Railway deployment is live, update these in Vercel:

```env
ANALYTICS_SERVER_URL=https://your-actual-railway-domain.up.railway.app
```

### 5. Test the Integration
After both deployments:
1. Railway GA server will be accessible at `https://your-app.up.railway.app`
2. Vercel Next.js app will connect to Railway GA server
3. Chat functionality should work with real GA data

## Health Check
Railway deployment includes health check at `/health` endpoint.

## Notes
- Railway will auto-deploy on GitHub pushes
- Monitor Railway logs for any startup issues
- Ensure Google Analytics service account has proper permissions