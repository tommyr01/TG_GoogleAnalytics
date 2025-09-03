"""Dependency injection for GA Analytics Agent."""

from dataclasses import dataclass, field
from typing import Optional, Any, Dict, List
import httpx
from .settings import settings


@dataclass
class GAAnalyticsDependencies:
    """Dependencies for GA Analytics Dashboard Agent."""
    
    # GA MCP Server Configuration
    ga_server_url: str = field(default_factory=lambda: settings.ga_mcp_server_url)
    ga_timeout: int = field(default_factory=lambda: settings.ga_mcp_timeout)
    
    # Session Context
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    
    # Chart Generation Settings
    chart_width: int = field(default_factory=lambda: settings.chart_width)
    chart_height: int = field(default_factory=lambda: settings.chart_height)
    chart_theme: str = field(default_factory=lambda: settings.chart_theme)
    
    # Performance Settings
    max_retries: int = field(default_factory=lambda: settings.max_retries)
    timeout: int = field(default_factory=lambda: settings.timeout_seconds)
    cache_ttl: int = field(default_factory=lambda: settings.cache_ttl)
    
    # Runtime Configuration
    debug: bool = field(default_factory=lambda: settings.debug)
    api_rate_limit: int = field(default_factory=lambda: settings.api_rate_limit)
    
    # Analytics Context
    date_range: Optional[str] = None
    active_campaigns: Optional[List[str]] = None
    focus_metrics: Optional[List[str]] = None
    
    # Lazy-initialized clients
    _http_client: Optional[httpx.AsyncClient] = field(default=None, init=False, repr=False)
    _cache_client: Optional[Any] = field(default=None, init=False, repr=False)
    
    @property
    def http_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client for GA MCP server requests."""
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout),
                base_url=self.ga_server_url,
                headers={"Content-Type": "application/json"}
            )
        return self._http_client
    
    async def fetch_ga_data(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """
        Fetch data from GA MCP server.
        
        Args:
            endpoint: API endpoint path
            params: Optional query parameters
            
        Returns:
            Response data as dictionary
        """
        try:
            response = await self.http_client.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise ValueError(f"Request to {endpoint} timed out after {self.timeout}s")
        except httpx.HTTPStatusError as e:
            raise ValueError(f"GA MCP server error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise ValueError(f"Failed to fetch GA data: {str(e)}")
    
    async def cleanup(self):
        """Clean up resources like HTTP client connections."""
        if self._http_client:
            await self._http_client.aclose()
            self._http_client = None
    
    @classmethod
    def from_settings(cls, settings_override: Optional[Dict] = None, **kwargs):
        """
        Create dependencies from settings with optional overrides.
        
        Args:
            settings_override: Optional settings overrides
            **kwargs: Additional dependency overrides
            
        Returns:
            GAAnalyticsDependencies instance
        """
        # Start with default settings
        config = {
            'ga_server_url': settings.ga_mcp_server_url,
            'ga_timeout': settings.ga_mcp_timeout,
            'chart_width': settings.chart_width,
            'chart_height': settings.chart_height,
            'chart_theme': settings.chart_theme,
            'max_retries': settings.max_retries,
            'timeout': settings.timeout_seconds,
            'cache_ttl': settings.cache_ttl,
            'debug': settings.debug,
            'api_rate_limit': settings.api_rate_limit,
        }
        
        # Apply settings overrides if provided
        if settings_override:
            config.update(settings_override)
        
        # Apply keyword argument overrides
        config.update(kwargs)
        
        return cls(**config)
    
    def with_session(self, session_id: str, user_id: Optional[str] = None):
        """
        Create a copy with session context.
        
        Args:
            session_id: Session identifier
            user_id: Optional user identifier
            
        Returns:
            New GAAnalyticsDependencies with session context
        """
        return GAAnalyticsDependencies(
            ga_server_url=self.ga_server_url,
            ga_timeout=self.ga_timeout,
            session_id=session_id,
            user_id=user_id,
            chart_width=self.chart_width,
            chart_height=self.chart_height,
            chart_theme=self.chart_theme,
            max_retries=self.max_retries,
            timeout=self.timeout,
            cache_ttl=self.cache_ttl,
            debug=self.debug,
            api_rate_limit=self.api_rate_limit,
            date_range=self.date_range,
            active_campaigns=self.active_campaigns,
            focus_metrics=self.focus_metrics
        )