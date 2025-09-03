# GA Analytics Agent - Dependencies Configuration

## Overview
This document defines the essential dependencies for the GA Analytics Dashboard AI Agent. The agent combines a React/Next.js dashboard with Pydantic AI for conversational analytics, connecting to an existing GA MCP server.

## Project Structure
```
dependencies/
├── __init__.py
├── settings.py       # Environment configuration
├── providers.py      # Model provider setup
├── dependencies.py   # Agent dependencies
├── agent.py         # Agent initialization
├── .env.example     # Environment template
└── requirements.txt # Python dependencies
```

## Essential Environment Variables

### Primary Configuration
```bash
# LLM Configuration (REQUIRED)
LLM_PROVIDER=openai
LLM_API_KEY=your-openai-api-key-here
LLM_MODEL=gpt-4-turbo
LLM_BASE_URL=https://api.openai.com/v1

# GA MCP Server (REQUIRED)
GA_MCP_SERVER_URL=http://localhost:3000
GA_MCP_TIMEOUT=30

# Application Settings
APP_ENV=development
LOG_LEVEL=INFO
DEBUG=false
MAX_RETRIES=3
TIMEOUT_SECONDS=30

# Deployment (Production)
VERCEL_URL=your-deployment-url
NODE_ENV=production
```

### Optional Configuration
```bash
# Caching (Optional)
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=300

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_WINDOW=3600

# Chart Generation
CHART_WIDTH=800
CHART_HEIGHT=600
CHART_THEME=light
```

## Model Provider Configuration

### OpenAI Provider Setup
```python
# providers.py specification
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider

def get_llm_model():
    """Configure OpenAI model for GA analytics tasks."""
    provider = OpenAIProvider(
        base_url=settings.llm_base_url,
        api_key=settings.llm_api_key
    )
    return OpenAIModel(
        model_name="gpt-4-turbo",  # Excellent for data analysis
        provider=provider
    )

# No fallback model needed - focus on single provider
```

## Agent Dependencies

### Core Dependencies Dataclass
```python
# dependencies.py specification
@dataclass
class GAAnalyticsDependencies:
    """Dependencies for GA Analytics Dashboard Agent."""
    
    # GA MCP Server Configuration
    ga_server_url: str = "http://localhost:3000"
    ga_timeout: int = 30
    
    # Session Context
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    
    # Chart Generation Settings
    chart_width: int = 800
    chart_height: int = 600
    chart_theme: str = "light"
    
    # Performance Settings
    max_retries: int = 3
    timeout: int = 30
    cache_ttl: int = 300
    
    # Runtime Configuration
    debug: bool = False
    api_rate_limit: int = 100
    
    # Lazy-initialized clients
    _http_client: Optional[Any] = field(default=None, init=False, repr=False)
    _cache_client: Optional[Any] = field(default=None, init=False, repr=False)
    
    @property
    def http_client(self):
        """HTTP client for GA MCP server requests."""
        if self._http_client is None:
            import httpx
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout),
                base_url=self.ga_server_url
            )
        return self._http_client
    
    @classmethod
    def from_settings(cls, settings, **kwargs):
        """Create from settings with overrides."""
        return cls(
            ga_server_url=kwargs.get('ga_server_url', settings.ga_mcp_server_url),
            ga_timeout=kwargs.get('ga_timeout', settings.ga_mcp_timeout),
            chart_width=kwargs.get('chart_width', getattr(settings, 'chart_width', 800)),
            chart_height=kwargs.get('chart_height', getattr(settings, 'chart_height', 600)),
            chart_theme=kwargs.get('chart_theme', getattr(settings, 'chart_theme', 'light')),
            max_retries=kwargs.get('max_retries', settings.max_retries),
            timeout=kwargs.get('timeout', settings.timeout_seconds),
            cache_ttl=kwargs.get('cache_ttl', getattr(settings, 'cache_ttl', 300)),
            debug=kwargs.get('debug', settings.debug),
            api_rate_limit=kwargs.get('api_rate_limit', getattr(settings, 'api_rate_limit', 100)),
            **{k: v for k, v in kwargs.items() if k not in [
                'ga_server_url', 'ga_timeout', 'chart_width', 'chart_height', 
                'chart_theme', 'max_retries', 'timeout', 'cache_ttl', 'debug', 'api_rate_limit'
            ]}
        )
```

## Required Python Packages

### Core Dependencies
```
# Core Pydantic AI and OpenAI
pydantic-ai>=0.1.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0
openai>=1.0.0

# HTTP and async utilities
httpx>=0.25.0
aiofiles>=23.0.0
asyncio>=3.11.0

# Chart generation for conversational responses
matplotlib>=3.7.0
plotly>=5.17.0
seaborn>=0.12.0
pandas>=2.1.0

# Caching (optional)
redis>=5.0.0

# Development and testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
black>=23.0.0
ruff>=0.1.0
```

### Web Framework Dependencies (for dashboard integration)
```
# Next.js/React integration (if needed for Python backend)
fastapi>=0.104.0
uvicorn>=0.24.0
websockets>=12.0.0

# Static file serving
aiofiles>=23.0.0
```

## Settings Configuration

### Environment Settings Validation
```python
# settings.py specification
class GAAnalyticsSettings(BaseSettings):
    """Settings for GA Analytics Agent."""
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # LLM Configuration
    llm_provider: str = Field(default="openai")
    llm_api_key: str = Field(..., description="OpenAI API key")
    llm_model: str = Field(default="gpt-4-turbo")
    llm_base_url: str = Field(default="https://api.openai.com/v1")
    
    # GA MCP Server
    ga_mcp_server_url: str = Field(default="http://localhost:3000")
    ga_mcp_timeout: int = Field(default=30)
    
    # Chart Generation
    chart_width: int = Field(default=800)
    chart_height: int = Field(default=600)
    chart_theme: str = Field(default="light")
    
    # Application
    app_env: str = Field(default="development")
    log_level: str = Field(default="INFO")
    debug: bool = Field(default=False)
    max_retries: int = Field(default=3)
    timeout_seconds: int = Field(default=30)
    
    # Optional caching and rate limiting
    redis_url: Optional[str] = Field(None)
    cache_ttl: int = Field(default=300)
    api_rate_limit: int = Field(default=100)
    
    # Production deployment
    vercel_url: Optional[str] = Field(None)
    node_env: str = Field(default="development")
    
    @field_validator("llm_api_key")
    @classmethod
    def validate_openai_key(cls, v):
        if not v or v.strip() == "":
            raise ValueError("OpenAI API key is required")
        return v
    
    @field_validator("ga_mcp_server_url")
    @classmethod
    def validate_ga_server_url(cls, v):
        if not v.startswith(("http://", "https://")):
            raise ValueError("GA MCP server URL must be a valid HTTP URL")
        return v
```

## Agent Initialization

### Simple Agent Setup
```python
# agent.py specification
from pydantic_ai import Agent
from .providers import get_llm_model
from .dependencies import GAAnalyticsDependencies
from .settings import settings

# System prompt for analytics and dashboard tasks
SYSTEM_PROMPT = """
You are a Google Analytics AI assistant specializing in data analysis and visualization.
You help users understand their website analytics through conversational queries and 
generate charts, insights, and optimization recommendations.

Available GA MCP endpoints:
- /api/summary: Overview metrics and KPIs
- /api/pages: Page performance data  
- /api/traffic: Traffic sources and acquisition
- /api/devices: Device and browser analytics
- /api/query: Custom analytics queries

You can create charts and visualizations in your responses to make data more understandable.
Focus on actionable insights and clear explanations of analytics data.
"""

# Initialize agent
ga_analytics_agent = Agent(
    get_llm_model(),
    deps_type=GAAnalyticsDependencies,
    system_prompt=SYSTEM_PROMPT,
    retries=settings.max_retries
)

# Convenience function for running agent
async def run_analytics_query(
    query: str,
    session_id: Optional[str] = None,
    **dependency_overrides
) -> str:
    """Run analytics query with automatic dependency injection."""
    deps = GAAnalyticsDependencies.from_settings(
        settings,
        session_id=session_id,
        **dependency_overrides
    )
    
    try:
        result = await ga_analytics_agent.run(query, deps=deps)
        return result.data
    finally:
        await deps.cleanup()
```

## External Service Integration

### GA MCP Server Connectivity
- **Endpoint**: `http://localhost:3000` (configurable via `GA_MCP_SERVER_URL`)
- **Timeout**: 30 seconds default
- **Available Routes**: `/api/summary`, `/api/pages`, `/api/traffic`, `/api/devices`, `/api/query`
- **Authentication**: None required (localhost server)
- **Data Format**: JSON responses with GA4 analytics data

### Chart Generation Requirements
- **Libraries**: matplotlib, plotly, seaborn for different chart types
- **Output Formats**: PNG, SVG for embedding in chat responses
- **Chart Types**: Line charts (trends), bar charts (comparisons), pie charts (distributions)
- **Theming**: Light/dark theme support via `chart_theme` setting

## Security and Performance

### Rate Limiting
- **API Calls**: 100 requests per hour default
- **GA MCP Server**: Respect upstream rate limits
- **Caching**: 5-minute cache for frequently requested data

### Error Handling
- **Connection Failures**: Graceful degradation if GA MCP server unavailable
- **API Errors**: Informative error messages for users
- **Timeouts**: 30-second default with configurable overrides
- **Retries**: 3 attempts with exponential backoff

## Deployment Considerations

### Vercel Deployment
- **Environment Variables**: All settings configured via Vercel dashboard
- **Serverless Functions**: Pydantic AI agent runs as serverless function
- **Static Assets**: Dashboard served as static files
- **Cold Starts**: Optimized for fast initialization

### Development vs Production
- **Development**: `GA_MCP_SERVER_URL=http://localhost:3000`
- **Production**: Proxy or tunnel to access localhost GA server
- **Logging**: DEBUG level in development, INFO in production
- **Caching**: Optional Redis in production for better performance

## Quality Checklist

- ✅ OpenAI GPT-4-turbo model configured
- ✅ GA MCP server connectivity established
- ✅ Chart generation libraries included  
- ✅ Environment variables documented
- ✅ Settings validation implemented
- ✅ Dependency injection type-safe
- ✅ Error handling and timeouts configured
- ✅ Vercel deployment ready
- ✅ Development/production environments separated
- ✅ Rate limiting and caching considered

## Integration Points

### Dashboard Integration
- **Frontend**: React/Next.js consuming GA MCP API directly
- **Chat Interface**: Pydantic AI agent handling conversational queries
- **Real-time Updates**: 5-minute refresh intervals for dashboard data
- **API Sharing**: Both dashboard and chat use same GA MCP endpoints

### Tool Integration
- **Chart Generator Tool**: Creates visualizations from analytics data
- **Anomaly Detector Tool**: Identifies unusual patterns
- **Insight Generator Tool**: Provides optimization recommendations
- **GA MCP Client Tool**: Interfaces with localhost:3000 endpoints

This configuration focuses on essential dependencies needed for the MVP while maintaining simplicity and flexibility for future enhancements.