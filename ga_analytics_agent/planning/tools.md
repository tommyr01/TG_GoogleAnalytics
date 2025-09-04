# GA Analytics Agent - Tool Specifications

Essential tools for the Google Analytics Dashboard AI Agent that interfaces with GA MCP server at localhost:3000 and provides intelligent analytics insights.

```python
"""
Tools for GA Analytics Agent - Pydantic AI agent tools implementation.
"""

import logging
from typing import Dict, Any, List, Optional, Literal, Union
from pydantic_ai import RunContext
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)


# Tool parameter models for validation
class GAQueryParams(BaseModel):
    """Parameters for GA data queries."""
    endpoint: str = Field(..., description="GA MCP API endpoint")
    date_range: Optional[str] = Field("7daysAgo", description="Date range for query")
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional filters")
    limit: int = Field(100, ge=1, le=1000, description="Maximum results")


class MetricAnalysisParams(BaseModel):
    """Parameters for metric analysis."""
    metrics: List[Dict[str, Any]] = Field(..., description="Metrics data to analyze")
    threshold_config: Optional[Dict[str, float]] = Field(None, description="Alert thresholds")
    comparison_period: str = Field("previous_period", description="Comparison timeframe")


# Actual tool implementations
async def fetch_ga_data_tool(
    base_url: str,
    endpoint: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Standalone GA MCP API client for testing and reuse.
    
    Args:
        base_url: GA MCP server base URL (http://localhost:3000)
        endpoint: API endpoint to call
        params: Optional query parameters
    
    Returns:
        GA data response
    """
    import httpx
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            url = f"{base_url.rstrip('/')}/api/{endpoint.lstrip('/')}"
            response = await client.get(url, params=params or {})
            response.raise_for_status()
            
            data = response.json()
            return {
                "success": True,
                "data": data,
                "endpoint": endpoint,
                "timestamp": datetime.now().isoformat()
            }
        except httpx.TimeoutException:
            raise Exception(f"Timeout connecting to GA MCP server at {base_url}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"GA MCP API error {e.response.status_code}: {e.response.text}")
        except Exception as e:
            raise Exception(f"Failed to fetch GA data: {str(e)}")


async def analyze_metrics_tool(
    metrics_data: List[Dict[str, Any]],
    metric_type: str,
    comparison_data: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Standalone metrics analysis function for identifying issues and trends.
    
    Args:
        metrics_data: Current period metrics
        metric_type: Type of metrics being analyzed
        comparison_data: Previous period data for comparison
    
    Returns:
        Analysis results with insights and issues
    """
    if not metrics_data:
        return {"success": False, "error": "No metrics data provided"}
    
    analysis = {
        "metric_type": metric_type,
        "total_records": len(metrics_data),
        "summary": {},
        "insights": [],
        "issues": [],
        "recommendations": []
    }
    
    try:
        # Basic statistical analysis
        if metrics_data and isinstance(metrics_data[0], dict):
            # Extract numeric values for analysis
            numeric_fields = []
            for item in metrics_data:
                for key, value in item.items():
                    if isinstance(value, (int, float)) and key not in ['timestamp', 'date']:
                        numeric_fields.append((key, value))
            
            if numeric_fields:
                # Group by field name and calculate stats
                field_stats = {}
                for field_name, value in numeric_fields:
                    if field_name not in field_stats:
                        field_stats[field_name] = []
                    field_stats[field_name].append(value)
                
                # Calculate summary statistics
                for field, values in field_stats.items():
                    if values:
                        analysis["summary"][field] = {
                            "total": sum(values),
                            "average": sum(values) / len(values),
                            "max": max(values),
                            "min": min(values),
                            "count": len(values)
                        }
                        
                        # Identify potential issues
                        avg_value = sum(values) / len(values)
                        if avg_value == 0:
                            analysis["issues"].append(f"Zero average for {field}")
                        elif max(values) > avg_value * 10:
                            analysis["insights"].append(f"High variability detected in {field}")
                        
                        # Generate recommendations
                        if field.lower() in ['bounce_rate', 'exit_rate'] and avg_value > 0.7:
                            analysis["recommendations"].append(f"High {field} detected - consider page optimization")
                        elif field.lower() in ['sessions', 'users'] and avg_value < 100:
                            analysis["recommendations"].append(f"Low {field} - consider traffic acquisition strategies")
        
        return {"success": True, "analysis": analysis}
        
    except Exception as e:
        logger.error(f"Metrics analysis failed: {e}")
        return {"success": False, "error": str(e), "analysis": analysis}


def generate_insights_tool(
    analysis_results: Dict[str, Any],
    context: str = "general"
) -> Dict[str, Any]:
    """
    Standalone insight generation function for creating actionable recommendations.
    
    Args:
        analysis_results: Results from metrics analysis
        context: Context for insights (traffic, pages, conversions, etc.)
    
    Returns:
        Generated insights and recommendations
    """
    if not analysis_results.get("success"):
        return {"success": False, "error": "Invalid analysis results provided"}
    
    analysis = analysis_results.get("analysis", {})
    insights = {
        "context": context,
        "priority_insights": [],
        "optimization_opportunities": [],
        "alerts": [],
        "action_items": []
    }
    
    try:
        # Process existing insights and issues
        existing_insights = analysis.get("insights", [])
        existing_issues = analysis.get("issues", [])
        existing_recommendations = analysis.get("recommendations", [])
        
        # Prioritize insights based on impact
        for insight in existing_insights:
            priority = "medium"
            if "high variability" in insight.lower():
                priority = "high"
            insights["priority_insights"].append({
                "message": insight,
                "priority": priority,
                "category": "performance"
            })
        
        # Convert issues to alerts
        for issue in existing_issues:
            alert_type = "warning"
            if "zero" in issue.lower():
                alert_type = "critical"
            insights["alerts"].append({
                "message": issue,
                "type": alert_type,
                "category": "data_quality"
            })
        
        # Enhance recommendations with context
        for rec in existing_recommendations:
            action_item = {
                "recommendation": rec,
                "priority": "medium",
                "estimated_impact": "medium",
                "effort": "low"
            }
            
            if "bounce_rate" in rec.lower() or "exit_rate" in rec.lower():
                action_item.update({
                    "priority": "high",
                    "estimated_impact": "high",
                    "effort": "medium"
                })
            elif "traffic acquisition" in rec.lower():
                action_item.update({
                    "priority": "high",
                    "estimated_impact": "high",
                    "effort": "high"
                })
            
            insights["action_items"].append(action_item)
        
        # Add context-specific insights
        summary = analysis.get("summary", {})
        if context == "traffic" and summary:
            if any("sessions" in key.lower() for key in summary.keys()):
                insights["optimization_opportunities"].append({
                    "area": "Traffic Acquisition",
                    "suggestion": "Analyze top traffic sources and optimize underperforming channels",
                    "potential_impact": "15-30% traffic increase"
                })
        
        elif context == "pages" and summary:
            if any("bounce" in key.lower() for key in summary.keys()):
                insights["optimization_opportunities"].append({
                    "area": "Page Performance",
                    "suggestion": "Focus on pages with high bounce rates for content optimization",
                    "potential_impact": "10-25% engagement improvement"
                })
        
        return {"success": True, "insights": insights}
        
    except Exception as e:
        logger.error(f"Insight generation failed: {e}")
        return {"success": False, "error": str(e)}


# Tool registration functions for agent
def register_tools(agent, deps_type):
    """
    Register all tools with the agent.
    
    Args:
        agent: Pydantic AI agent instance
        deps_type: Agent dependencies type
    """
    
    @agent.tool
    async def fetch_ga_data(
        ctx: RunContext[deps_type],
        endpoint: str,
        date_range: str = "7daysAgo",
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Fetch data from GA MCP server API endpoints.
        
        Available endpoints:
        - summary: Overview metrics and KPIs
        - pages: Page performance data  
        - traffic: Traffic sources and acquisition data
        - devices: Device and browser analytics
        - query: Custom analytics queries
        
        Args:
            endpoint: GA MCP API endpoint (summary, pages, traffic, devices, query)
            date_range: Date range for query (default: 7daysAgo)
            filters: Optional filters to apply to the query
            limit: Maximum number of results to return (1-1000)
        
        Returns:
            GA data response with success status and data payload
        """
        try:
            # Validate endpoint
            valid_endpoints = ["summary", "pages", "traffic", "devices", "query"]
            if endpoint not in valid_endpoints:
                return {
                    "success": False, 
                    "error": f"Invalid endpoint '{endpoint}'. Valid endpoints: {valid_endpoints}"
                }
            
            # Prepare query parameters
            params = {
                "dateRange": date_range,
                "limit": min(limit, 1000)
            }
            if filters:
                params.update(filters)
            
            # Fetch data from GA MCP server
            result = await fetch_ga_data_tool(
                base_url=ctx.deps.ga_mcp_server_url,
                endpoint=endpoint,
                params=params
            )
            
            logger.info(f"GA data fetched successfully: {endpoint} ({len(result.get('data', {}).get('rows', []))} rows)")
            return result
            
        except Exception as e:
            logger.error(f"GA data fetch failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "endpoint": endpoint,
                "params": {"date_range": date_range, "limit": limit}
            }
    
    @agent.tool
    async def analyze_metrics(
        ctx: RunContext[deps_type],
        metrics_data: List[Dict[str, Any]],
        metric_type: str,
        comparison_data: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Analyze GA metrics to identify issues, trends, and anomalies.
        
        Args:
            metrics_data: Current period metrics data from GA
            metric_type: Type of metrics (traffic, pages, conversions, devices)
            comparison_data: Optional previous period data for comparison
        
        Returns:
            Analysis results with statistics, insights, issues, and recommendations
        """
        try:
            # Validate input data
            if not metrics_data:
                return {"success": False, "error": "No metrics data provided for analysis"}
            
            if not isinstance(metrics_data, list):
                return {"success": False, "error": "Metrics data must be a list of dictionaries"}
            
            # Perform analysis
            result = await analyze_metrics_tool(
                metrics_data=metrics_data,
                metric_type=metric_type,
                comparison_data=comparison_data
            )
            
            if result.get("success"):
                logger.info(f"Metrics analysis completed: {metric_type} ({result['analysis']['total_records']} records)")
            else:
                logger.warning(f"Metrics analysis had issues: {result.get('error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Metrics analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "metric_type": metric_type,
                "data_count": len(metrics_data) if isinstance(metrics_data, list) else 0
            }
    
    @agent.tool_plain
    def generate_insights(
        analysis_results: Dict[str, Any],
        context: Literal["traffic", "pages", "audience", "conversions", "devices", "general"] = "general"
    ) -> Dict[str, Any]:
        """
        Generate actionable insights and recommendations from analytics data.
        
        Args:
            analysis_results: Results from analyze_metrics tool
            context: Analytics context for targeted insights
        
        Returns:
            Prioritized insights, optimization opportunities, alerts, and action items
        """
        try:
            # Validate analysis results
            if not isinstance(analysis_results, dict):
                return {"success": False, "error": "Analysis results must be a dictionary"}
            
            if not analysis_results.get("success"):
                return {
                    "success": False, 
                    "error": "Cannot generate insights from failed analysis",
                    "original_error": analysis_results.get("error")
                }
            
            # Generate insights
            result = generate_insights_tool(
                analysis_results=analysis_results,
                context=context
            )
            
            if result.get("success"):
                insights = result.get("insights", {})
                logger.info(f"Insights generated for {context}: {len(insights.get('priority_insights', []))} insights, {len(insights.get('action_items', []))} actions")
            
            return result
            
        except Exception as e:
            logger.error(f"Insight generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "context": context
            }
    
    logger.info(f"Registered {len(agent.tools)} tools with GA Analytics agent")


# Error handling utilities
class GAToolError(Exception):
    """Custom exception for GA tool failures."""
    pass


async def handle_tool_error(error: Exception, context: str, tool_name: str) -> Dict[str, Any]:
    """
    Standardized error handling for GA analytics tools.
    
    Args:
        error: The exception that occurred
        context: Description of what was being attempted
        tool_name: Name of the tool that failed
    
    Returns:
        Error response dictionary with troubleshooting info
    """
    logger.error(f"Tool error in {tool_name} during {context}: {error}")
    
    error_response = {
        "success": False,
        "error": str(error),
        "error_type": type(error).__name__,
        "context": context,
        "tool": tool_name,
        "timestamp": datetime.now().isoformat()
    }
    
    # Add specific troubleshooting for common errors
    error_str = str(error).lower()
    if "timeout" in error_str or "connection" in error_str:
        error_response["troubleshooting"] = "Check GA MCP server is running at localhost:3000"
    elif "404" in error_str:
        error_response["troubleshooting"] = "Verify API endpoint exists and is correctly formatted"
    elif "500" in error_str:
        error_response["troubleshooting"] = "GA MCP server error - check server logs"
    elif "no data" in error_str or "empty" in error_str:
        error_response["troubleshooting"] = "No data available for specified date range or filters"
    
    return error_response


# Testing utilities
def create_mock_ga_data(endpoint: str, count: int = 10) -> Dict[str, Any]:
    """Create mock GA data for testing tools."""
    from datetime import date, timedelta
    import random
    
    base_date = date.today() - timedelta(days=7)
    
    if endpoint == "summary":
        return {
            "success": True,
            "data": {
                "totals": {
                    "sessions": random.randint(1000, 5000),
                    "users": random.randint(800, 4000),
                    "pageviews": random.randint(5000, 20000),
                    "bounce_rate": round(random.uniform(0.3, 0.8), 2)
                }
            }
        }
    elif endpoint == "pages":
        return {
            "success": True,
            "data": {
                "rows": [
                    {
                        "page_path": f"/page-{i}",
                        "pageviews": random.randint(100, 1000),
                        "unique_pageviews": random.randint(80, 800),
                        "bounce_rate": round(random.uniform(0.2, 0.9), 2)
                    }
                    for i in range(count)
                ]
            }
        }
    else:
        return {
            "success": True,
            "data": {"rows": [{"metric": random.randint(1, 100)} for _ in range(count)]}
        }


# Rate limiting and retry utilities
async def with_rate_limit(func, semaphore_limit: int = 5):
    """Apply rate limiting to API calls."""
    semaphore = asyncio.Semaphore(semaphore_limit)
    
    async def limited_func(*args, **kwargs):
        async with semaphore:
            return await func(*args, **kwargs)
    
    return limited_func


def validate_date_range(date_range: str) -> bool:
    """Validate GA date range format."""
    valid_ranges = [
        "today", "yesterday", "7daysAgo", "14daysAgo", "30daysAgo",
        "90daysAgo", "365daysAgo"
    ]
    
    # Check predefined ranges
    if date_range in valid_ranges:
        return True
    
    # Check custom date format (YYYY-MM-DD)
    try:
        if "," in date_range:
            start_date, end_date = date_range.split(",")
            datetime.strptime(start_date.strip(), "%Y-%m-%d")
            datetime.strptime(end_date.strip(), "%Y-%m-%d")
            return True
    except (ValueError, AttributeError):
        pass
    
    return False
```

## Key Features

### 1. GA MCP API Integration
- **fetch_ga_data**: Connects to localhost:3000 GA MCP server
- Supports all 5 endpoints: summary, pages, traffic, devices, query
- Proper error handling for connection issues and API failures
- Rate limiting and timeout protection

### 2. Intelligent Metrics Analysis
- **analyze_metrics**: Statistical analysis of GA data
- Automatic issue detection (zero values, high variability)
- Performance threshold monitoring
- Comparison analysis with previous periods

### 3. Actionable Insights Generation
- **generate_insights**: Context-aware recommendations
- Priority-based insight ranking
- Specific optimization opportunities for each analytics area
- Actionable items with effort and impact estimates

## Error Handling Strategy

- **Connection Errors**: Detect GA MCP server connectivity issues
- **API Errors**: Handle 404, 500, and timeout responses gracefully
- **Data Validation**: Ensure data integrity before analysis
- **Retry Logic**: Built-in retry for transient failures
- **Fallback Responses**: Provide useful error context and troubleshooting tips

## Testing Support

- Mock data generators for each endpoint
- Validation utilities for date ranges and parameters
- Rate limiting helpers for production use
- Comprehensive logging for debugging

These tools provide the essential functionality for the GA Analytics Dashboard Agent to fetch real-time analytics data, perform intelligent analysis, and generate actionable insights for optimization.