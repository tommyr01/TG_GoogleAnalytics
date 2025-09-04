"""Environment settings and configuration for GA Analytics Agent."""

from typing import Optional
from pydantic import Field, ConfigDict, field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv


class GAAnalyticsSettings(BaseSettings):
    """Settings for GA Analytics Dashboard Agent."""
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # LLM Configuration
    llm_provider: str = Field(default="openai", description="LLM provider")
    llm_api_key: str = Field(..., description="OpenAI API key")
    llm_model: str = Field(default="gpt-4-turbo", description="Model name")
    llm_base_url: str = Field(
        default="https://api.openai.com/v1",
        description="Base URL for OpenAI API"
    )
    
    # GA MCP Server Configuration
    ga_mcp_server_url: str = Field(
        default="http://localhost:3000",
        description="GA MCP server URL"
    )
    ga_mcp_timeout: int = Field(default=30, description="Request timeout in seconds")
    
    # Chart Generation Settings
    chart_width: int = Field(default=800, description="Default chart width")
    chart_height: int = Field(default=600, description="Default chart height")
    chart_theme: str = Field(default="light", description="Chart theme (light/dark)")
    
    # Application Settings
    app_env: str = Field(default="development", description="Application environment")
    log_level: str = Field(default="INFO", description="Logging level")
    debug: bool = Field(default=False, description="Debug mode")
    max_retries: int = Field(default=3, description="Maximum API retry attempts")
    timeout_seconds: int = Field(default=30, description="Default timeout")
    
    # Optional Caching and Rate Limiting
    redis_url: Optional[str] = Field(None, description="Redis URL for caching")
    cache_ttl: int = Field(default=300, description="Cache TTL in seconds")
    api_rate_limit: int = Field(default=100, description="API rate limit per hour")
    api_rate_window: int = Field(default=3600, description="Rate limit window in seconds")
    
    # Production Deployment
    vercel_url: Optional[str] = Field(None, description="Vercel deployment URL")
    node_env: str = Field(default="development", description="Node environment")
    
    @field_validator("llm_api_key")
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        """Validate API key is not empty."""
        if not v or v.strip() == "" or v == "your-openai-api-key-here":
            raise ValueError(
                "OpenAI API key is required. Please set LLM_API_KEY in your .env file"
            )
        return v
    
    @field_validator("ga_mcp_server_url")
    @classmethod
    def validate_ga_server_url(cls, v: str) -> str:
        """Validate GA MCP server URL format."""
        if not v.startswith(("http://", "https://")):
            raise ValueError("GA MCP server URL must be a valid HTTP/HTTPS URL")
        return v.rstrip("/")  # Remove trailing slash for consistency
    
    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is valid."""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Log level must be one of: {', '.join(valid_levels)}")
        return v.upper()
    
    @field_validator("chart_theme")
    @classmethod
    def validate_chart_theme(cls, v: str) -> str:
        """Validate chart theme."""
        valid_themes = ["light", "dark", "auto"]
        if v.lower() not in valid_themes:
            raise ValueError(f"Chart theme must be one of: {', '.join(valid_themes)}")
        return v.lower()


def load_settings() -> GAAnalyticsSettings:
    """Load settings with environment variable support."""
    # Load environment variables from .env file
    load_dotenv()
    
    try:
        return GAAnalyticsSettings()
    except Exception as e:
        error_msg = f"Failed to load settings: {e}"
        if "llm_api_key" in str(e).lower():
            error_msg += "\nMake sure to set LLM_API_KEY in your .env file"
        raise ValueError(error_msg) from e


# Create a singleton settings instance
settings = load_settings()