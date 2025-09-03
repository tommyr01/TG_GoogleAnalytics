# TG Google Analytics Dashboard

A comprehensive Google Analytics dashboard built with Next.js 15, React 19, and Google Analytics Data API integration via Model Context Protocol (MCP) server.

## Features

- **Complete Analytics Dashboard** - 7 pages covering all major GA metrics
  - Overview - Key performance indicators and summary metrics
  - Traffic - Website traffic analysis and trends
  - Pages - Page performance and popular content
  - Audience - User demographics and behavior
  - Conversions - Goal tracking and conversion metrics
  - Devices - Device and browser analytics
  - Chat - Interactive analytics assistant with natural language queries

- **Dark/Light Mode** - Seamless theme switching with next-themes
- **Modern UI/UX** - Built with shadcn/ui components and Tailwind CSS
- **Real-time Data** - Live Google Analytics data via MCP server
- **AI-Powered Chat** - Ask questions about your analytics in natural language
- **Responsive Design** - Works perfectly on all devices
- **Type Safety** - Full TypeScript implementation

## Project Structure

```
├── app/                    # Next.js 15 app router pages
├── components/             # React components including analytics nav
├── ga-mcp-server/         # Google Analytics MCP server
├── agents/                # GA Analytics Pydantic AI agent
├── lib/                   # Utilities and configurations
├── registry/              # shadcn/ui component registry
└── styles/                # Global styles and Tailwind config
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Google Analytics MCP Server

```bash
cd ga-mcp-server
npm install
```

Configure your Google Analytics credentials in `ga-mcp-server/.dev.vars`:

```env
GA_PROPERTY_ID=your-ga-property-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account.json
OPENAI_API_KEY=sk-your-openai-api-key
PORT=3001
```

> 📖 **For detailed setup instructions**, see [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)

### 3. Run Both Servers

```bash
# Option 1: Run both servers together (recommended)
npm run dev:all

# Option 2: Run servers separately
# Terminal 1:
npm run dev:analytics

# Terminal 2: 
npm run dev
```

The analytics server runs on `http://localhost:3001`
The dashboard will be available at `http://localhost:4000`

## Google Analytics Setup

1. Create a Google Analytics 4 property
2. Enable the Google Analytics Data API
3. Create a service account and download the JSON key
4. Grant the service account access to your GA4 property
5. Configure the environment variables in `ga-mcp-server/.env`

## Technology Stack

- **Framework**: Next.js 15.3.1 with App Router
- **React**: 19.1.0 with TypeScript
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Theme**: next-themes for dark/light mode
- **MCP Server**: Google Analytics Data API integration
- **AI Agent**: Pydantic AI for intelligent analytics

## Key Components

### Analytics Navigation
- Custom sidebar navigation with analytics-specific icons
- Active route highlighting
- Integrated theme toggle
- Teal accent colors throughout

### MCP Server Integration
- Real-time data fetching from Google Analytics
- Structured API responses
- Error handling and fallback states
- Connection to localhost:3000

### AI Agent
- Python-based analytics agent using Pydantic AI
- Intelligent query processing
- Natural language analytics insights

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Environment Variables

### Dashboard (.env.local)
```env
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:3000
```

### MCP Server (ga-mcp-server/.env)
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GA_PROPERTY_ID=your-property-id
PORT=3000
```

### AI Agent (agents/ga_analytics_agent/.env)
```env
OPENAI_API_KEY=your-openai-key
MCP_SERVER_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the TalentGuard analytics suite.

---

Built with ❤️ using Next.js, React, and Google Analytics Data API
