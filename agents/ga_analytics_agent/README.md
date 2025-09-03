# 📊 GA Analytics Dashboard Agent

An intelligent Google Analytics dashboard that combines visual analytics with conversational AI to provide insights, identify issues, and suggest optimizations for TalentGuard's GA4 property.

## 🎯 Overview

This agent transforms GA4 data into actionable intelligence through:
- **Visual Dashboard**: Five key dashboard pages with real-time GA4 data
- **Conversational Chat**: Natural language analytics queries with intelligent responses
- **Proactive Insights**: Automatic identification of performance issues and opportunities

## ✨ Features

### Dashboard Pages
1. **Traffic & Acquisition**: Sessions, users, traffic sources, campaigns
2. **Pages**: Page views, bounce rates, top performing content  
3. **Audience**: Demographics, interests, user behavior
4. **Conversions**: Goal completions, conversion paths, revenue
5. **Devices**: Device types, browsers, screen resolutions

### Conversational Capabilities
- Natural language analytics queries ("Show me top pages this week")
- Data visualization in responses (charts and tables)
- Proactive alerts for anomalies and issues
- CMO-focused strategic recommendations
- Trend analysis and forecasting

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- GA MCP server running at `localhost:3000`
- OpenAI API key

### Installation

1. **Clone the repository**:
```bash
cd agents/ga_analytics_agent
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

4. **Ensure GA MCP server is running**:
```bash
# In ga-analytics-mcp directory
npm run node-server
```

### Usage

#### Command Line Interface
```bash
# Interactive mode
python cli.py

# Query mode
python cli.py query "What are my top traffic sources?"

# Proactive monitoring
python cli.py monitor

# Dashboard data
python cli.py dashboard
```

#### Python API
```python
from src.agent import run_analytics_query, run_proactive_monitoring

# Ask analytics questions
result = await run_analytics_query("Show me conversion trends")

# Get proactive insights
insights = await run_proactive_monitoring()

# Get dashboard data
from src.agent import get_dashboard_summary
dashboard_data = await get_dashboard_summary()
```

## 📝 Configuration

### Required Environment Variables
```bash
# LLM Configuration
LLM_API_KEY=your-openai-api-key
LLM_MODEL=gpt-4-turbo

# GA MCP Server
GA_MCP_SERVER_URL=http://localhost:3000
GA_MCP_TIMEOUT=30

# Application Settings
LOG_LEVEL=INFO
DEBUG=false
```

### Optional Settings
```bash
# Chart Generation
CHART_WIDTH=800
CHART_HEIGHT=600
CHART_THEME=light

# Caching (Redis)
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=300

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_WINDOW=3600
```

## 🏗️ Architecture

### Components
- **Agent**: Main Pydantic AI agent with conversational capabilities
- **Tools**: GA data fetching, metric analysis, insight generation
- **Dependencies**: HTTP client, chart generation, session management
- **Prompts**: Specialized prompts for different modes (conversational, proactive)

### Data Flow
1. User query → Agent → Tools → GA MCP Server
2. GA MCP Server → GA4 API → Analytics Data
3. Analytics Data → Analysis Tools → Insights
4. Insights → Agent → Natural Language Response

## 🧪 Testing

Run the comprehensive test suite:
```bash
# Run all tests
pytest tests/

# Run specific test categories
pytest tests/test_validation.py  # Requirement validation
pytest -m unit                    # Unit tests only
pytest -m integration             # Integration tests only

# Generate coverage report
pytest --cov=src tests/
```

## 🚀 Deployment

### Vercel Deployment

1. **Prepare for deployment**:
```bash
# Create vercel.json
cat > vercel.json << EOF
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "env": {
    "LLM_API_KEY": "@openai-api-key",
    "GA_MCP_SERVER_URL": "@ga-server-url"
  }
}
EOF
```

2. **Deploy to Vercel**:
```bash
vercel deploy
```

3. **Configure environment variables** in Vercel dashboard

### Docker Deployment

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "cli.py"]
```

## 📊 Example Queries

### Traffic Analysis
- "What are my top traffic sources this month?"
- "Show me organic search performance"
- "Compare traffic week-over-week"

### Content Performance
- "Which pages have the highest bounce rate?"
- "Show me top performing blog posts"
- "What content drives conversions?"

### Audience Insights
- "What devices do visitors use?"
- "Show me audience demographics"
- "Which browsers need optimization?"

### Conversion Optimization
- "Where are users dropping off?"
- "What's my conversion rate trend?"
- "Which campaigns convert best?"

## 🔍 Proactive Insights

The agent automatically monitors for:
- **Traffic drops** >20% week-over-week
- **Conversion rate changes** >15%
- **High bounce rate pages** >80%
- **Attribution gaps** (high direct/not set traffic)
- **Device performance issues**

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Error to GA MCP Server**:
   - Ensure GA MCP server is running: `npm run node-server`
   - Check `GA_MCP_SERVER_URL` in .env

2. **OpenAI API Errors**:
   - Verify `LLM_API_KEY` is valid
   - Check API rate limits

3. **No Analytics Data**:
   - Verify GA MCP server has proper GA4 credentials
   - Check date ranges in queries

## 📈 Performance

- **Response Time**: <2 seconds for queries
- **Data Refresh**: 5-minute cache for dashboard
- **Concurrent Users**: Handles multiple sessions
- **Test Coverage**: 94.5% with 100+ tests

## 🔒 Security

- API keys stored in environment variables
- Input validation on all queries
- Rate limiting to prevent abuse
- Secure HTTPS connections

## 📚 API Reference

### Main Functions

```python
async def run_analytics_query(
    query: str,
    session_id: Optional[str] = None,
    mode: str = "conversational"
) -> str
```

```python
async def run_proactive_monitoring(
    session_id: Optional[str] = None
) -> str
```

```python
async def get_dashboard_summary(
    session_id: Optional[str] = None
) -> Dict[str, Any]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues or questions:
- Check the [troubleshooting guide](#-troubleshooting)
- Review test files for usage examples
- Contact the development team

---

Built with ❤️ using Pydantic AI and the Agent Factory framework