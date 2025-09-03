# Google Analytics Integration Setup

This guide walks you through setting up the real Google Analytics integration for the analytics chat interface.

## Architecture Overview

The system consists of two main components:

1. **Next.js Frontend** (Port 4000) - The main application with chat interface
2. **Analytics Express Server** (Port 3001) - Handles Google Analytics API calls and natural language processing

## Prerequisites

1. **Google Analytics 4 Property** with data to analyze
2. **Google Cloud Project** with Analytics Reporting API enabled
3. **OpenAI API Key** for natural language processing
4. **Node.js** (v18+ recommended)

## Step 1: Google Cloud Configuration

### Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Enable the **Google Analytics Reporting API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Reporting API"
   - Click "Enable"

4. Create a service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name like "GA Analytics Reader"
   - Click "Create and Continue"
   - Skip role assignment for now (we'll add GA access directly)
   - Click "Done"

5. Create and download a key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download and save the file securely

### Add Service Account to Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to "Admin" > "Property" > "Property Access Management"
4. Click "+" to add users
5. Add the service account email (from the JSON file) with "Viewer" permissions
6. Click "Add"

## Step 2: Get Your GA4 Property ID

1. In Google Analytics, go to "Admin"
2. Select your property
3. Click "Property Settings"
4. Copy the "Property ID" (it looks like: 123456789)

## Step 3: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Save it securely (it starts with `sk-`)

## Step 4: Configure the Analytics Server

1. Navigate to the analytics server directory:
   ```bash
   cd ga-mcp-server
   ```

2. Copy the example configuration:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. Edit `.dev.vars` with your values:
   ```env
   # Your GA4 Property ID (numbers only)
   GA_PROPERTY_ID=123456789
   
   # Path to your service account JSON file
   GOOGLE_APPLICATION_CREDENTIALS=/full/path/to/your-service-account-key.json
   
   # Your OpenAI API key
   OPENAI_API_KEY=sk-your-openai-api-key-here
   
   # Optional: OpenAI model to use (defaults to gpt-3.5-turbo)
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Server port (defaults to 3000, but we'll use 3001)
   PORT=3001
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

## Step 5: Configure the Next.js App

The Next.js app is already configured to connect to the analytics server. Just ensure the `.env.local` file exists with:

```env
ANALYTICS_SERVER_URL=http://localhost:3001
```

## Step 6: Install Dependencies

From the project root:

```bash
npm install
```

## Step 7: Run the System

You have several options:

### Option 1: Run Both Servers Together (Recommended for Development)
```bash
npm run dev:all
```

This starts both the analytics server (port 3001) and the Next.js app (port 4000).

### Option 2: Run Servers Separately

Terminal 1 - Analytics Server:
```bash
npm run dev:analytics
```

Terminal 2 - Next.js App:
```bash
npm run dev
```

### Option 3: Production Mode

Terminal 1:
```bash
npm run start:analytics
```

Terminal 2:
```bash
npm run build
npm run start
```

## Step 8: Test the Integration

1. Open [http://localhost:4000](http://localhost:4000)
2. Navigate to the analytics chat interface
3. Try asking questions like:
   - "Show me my traffic summary for the last 30 days"
   - "What are my top performing pages?"
   - "How many users do I have right now?"
   - "What devices are my users using?"

## Troubleshooting

### Analytics Server Issues

1. **Check server health:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Common errors:**
   - **"Property not found"**: Check your `GA_PROPERTY_ID` is correct
   - **"Authentication failed"**: Verify your service account JSON file path and ensure the service account has GA access
   - **"OpenAI API error"**: Check your OpenAI API key and ensure you have credits

### Frontend Issues

1. **Check browser network tab** for failed requests to `/api/analytics/chat`
2. **Check browser console** for JavaScript errors
3. **Verify** the analytics server is running and accessible

### Data Issues

1. **No data returned**: 
   - Ensure your GA4 property has recent data
   - Check that you're asking about the correct date ranges
   - Verify the service account has proper access

2. **Sample data showing**:
   - The app shows sample data when the analytics server is unavailable
   - Look for the "⚠️ Using sample data" prefix in responses

## Available Query Types

The system can handle various types of analytics queries:

- **Summary metrics**: "Show me my overall traffic stats"
- **Top pages**: "What are my most popular pages?"
- **Traffic sources**: "Where is my traffic coming from?"
- **Device breakdown**: "What devices are people using?"
- **Real-time data**: "How many users are on my site now?"

The OpenAI integration interprets natural language and maps it to the appropriate Google Analytics queries.

## Security Notes

- Keep your service account JSON file secure and never commit it to version control
- The `.dev.vars` file is gitignored to protect your credentials
- Consider using environment variables or secure secret management in production
- The service account should only have "Viewer" permissions in Google Analytics

## Production Deployment

For production deployment:

1. Use environment variables instead of `.dev.vars`
2. Consider using Google Cloud Secret Manager or similar for credentials
3. Set up proper logging and monitoring
4. Use a process manager like PM2 for the Express server
5. Consider deploying the servers separately for better scalability