"""Test configuration and fixtures for GA Analytics Agent tests."""

import pytest
from typing import Dict, Any, Optional
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic_ai.models.test import TestModel
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import ModelTextResponse

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from agent import ga_analytics_agent
from dependencies import GAAnalyticsDependencies
from settings import GAAnalyticsSettings


@pytest.fixture
def test_settings():
    """Create test settings."""
    return GAAnalyticsSettings(
        llm_api_key="test-api-key",
        ga_mcp_server_url="http://localhost:3000",
        debug=True,
        max_retries=1,
        timeout_seconds=5,
        cache_ttl=60
    )


@pytest.fixture
def mock_dependencies(test_settings):
    """Create mock dependencies for testing."""
    deps = GAAnalyticsDependencies.from_settings()
    
    # Mock the HTTP client and fetch_ga_data method
    deps._http_client = AsyncMock()
    deps.fetch_ga_data = AsyncMock()
    
    return deps


@pytest.fixture
def test_agent():
    """Create agent with TestModel for testing."""
    test_model = TestModel()
    return ga_analytics_agent.override(model=test_model)


@pytest.fixture
def function_test_agent():
    """Create agent with custom FunctionModel for controlled behavior."""
    def create_analytics_function():
        call_count = 0
        
        async def analytics_function(messages, tools):
            nonlocal call_count
            call_count += 1
            
            if call_count == 1:
                # First call - analyze request
                return ModelTextResponse(
                    content="I'll analyze your Google Analytics data to provide insights."
                )
            elif call_count == 2:
                # Second call - fetch data
                return {
                    "fetch_analytics_data": {
                        "endpoint": "/api/summary",
                        "date_range": "last7days"
                    }
                }
            elif call_count == 3:
                # Third call - generate insights
                return {
                    "generate_actionable_insights": {
                        "analytics_data": {"sessions": 1000, "bounce_rate": 45}
                    }
                }
            else:
                # Final response with insights
                return ModelTextResponse(
                    content="""Based on your GA data analysis:

**Key Insights:**
📊 **Traffic Performance**: 1,000 sessions in the last 7 days
📈 **Engagement**: 45% bounce rate - within normal range
🎯 **Optimization Opportunity**: Mobile conversion rate needs improvement

**Recommendations:**
1. Focus on mobile user experience improvements
2. A/B test landing page content for better engagement
3. Review page load speeds across all devices

**Chart: Weekly Traffic Trend**
```
Sessions: ████████████████ 1,000
Bounce Rate: ████████████ 45%
```"""
                )
        
        return analytics_function
    
    function_model = FunctionModel(create_analytics_function())
    return ga_analytics_agent.override(model=function_model)


@pytest.fixture
def sample_ga_data():
    """Sample GA data for testing."""
    return {
        "summary": {
            "sessions": 10500,
            "users": 8200,
            "page_views": 28000,
            "bounce_rate": 42.5,
            "avg_session_duration": 185.3,
            "conversion_rate": 2.8,
            "revenue": 45600.00
        },
        "traffic": {
            "organic_search": {"sessions": 4200, "percentage": 40},
            "direct": {"sessions": 3150, "percentage": 30},
            "social": {"sessions": 1575, "percentage": 15},
            "email": {"sessions": 1050, "percentage": 10},
            "paid_search": {"sessions": 525, "percentage": 5},
            "direct_traffic_percentage": 30
        },
        "pages": [
            {
                "page": "/homepage",
                "page_views": 8500,
                "unique_page_views": 6200,
                "bounce_rate": 35.2,
                "avg_time_on_page": 95.4
            },
            {
                "page": "/pricing",
                "page_views": 3200,
                "unique_page_views": 2800,
                "bounce_rate": 28.1,
                "avg_time_on_page": 142.7
            },
            {
                "page": "/features",
                "page_views": 2800,
                "unique_page_views": 2400,
                "bounce_rate": 52.3,
                "avg_time_on_page": 78.9
            }
        ],
        "devices": {
            "desktop": {
                "sessions": 6300,
                "percentage": 60,
                "bounce_rate": 38.5,
                "conversion_rate": 3.2
            },
            "mobile": {
                "sessions": 3150,
                "percentage": 30,
                "bounce_rate": 48.2,
                "conversion_rate": 2.1
            },
            "tablet": {
                "sessions": 1050,
                "percentage": 10,
                "bounce_rate": 44.1,
                "conversion_rate": 2.5
            }
        },
        "conversions": {
            "goal_completions": 294,
            "conversion_rate": 2.8,
            "trend": "stable",
            "revenue": 45600.00
        }
    }


@pytest.fixture
def anomaly_ga_data():
    """GA data with anomalies for testing detection."""
    return {
        "summary": {
            "sessions": 3500,  # 67% drop from sample data
            "users": 2800,
            "page_views": 9500,
            "bounce_rate": 75.5,  # High bounce rate
            "avg_session_duration": 85.2,
            "conversion_rate": 1.2,  # Low conversion rate
            "revenue": 15200.00
        },
        "traffic": {
            "organic_search": {"sessions": 1400, "percentage": 40},
            "direct": {"sessions": 1750, "percentage": 50},  # Unusually high direct
            "social": {"sessions": 245, "percentage": 7},
            "email": {"sessions": 105, "percentage": 3},
            "paid_search": {"sessions": 0, "percentage": 0},  # No paid traffic
            "direct_traffic_percentage": 50
        }
    }


@pytest.fixture
def mock_ga_mcp_server():
    """Mock GA MCP server responses."""
    mock_responses = {
        "/api/summary": {
            "sessions": 10500,
            "users": 8200,
            "bounce_rate": 42.5,
            "conversion_rate": 2.8
        },
        "/api/pages": [
            {"page": "/homepage", "page_views": 8500, "bounce_rate": 35.2},
            {"page": "/pricing", "page_views": 3200, "bounce_rate": 28.1}
        ],
        "/api/traffic": {
            "organic_search": {"sessions": 4200, "percentage": 40},
            "direct": {"sessions": 3150, "percentage": 30}
        },
        "/api/devices": {
            "desktop": {"sessions": 6300, "conversion_rate": 3.2},
            "mobile": {"sessions": 3150, "conversion_rate": 2.1}
        }
    }
    
    async def mock_fetch_ga_data(endpoint: str, params: Optional[Dict] = None):
        if endpoint in mock_responses:
            return mock_responses[endpoint]
        else:
            raise ValueError(f"Unknown endpoint: {endpoint}")
    
    return mock_fetch_ga_data


@pytest.fixture
def mock_http_error():
    """Mock HTTP error for error handling tests."""
    async def error_fetch_ga_data(endpoint: str, params: Optional[Dict] = None):
        if endpoint == "/api/timeout":
            import httpx
            raise httpx.TimeoutException("Request timed out")
        elif endpoint == "/api/404":
            import httpx
            response = MagicMock()
            response.status_code = 404
            response.text = "Not Found"
            raise httpx.HTTPStatusError("404 Not Found", request=None, response=response)
        else:
            raise Exception("Server error")
    
    return error_fetch_ga_data


@pytest.fixture(autouse=True)
async def cleanup_deps():
    """Automatically cleanup dependencies after each test."""
    yield
    # Any cleanup that might be needed


# Pytest configuration
pytest_plugins = []


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "slow: Slow tests that require external services")
    config.addinivalue_line("markers", "api: Tests that require API access")


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests."""
    import asyncio
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()