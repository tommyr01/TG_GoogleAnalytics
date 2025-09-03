"""Tools for GA Analytics Agent."""

from typing import Dict, List, Optional, Any
import json
from datetime import datetime, timedelta
from pydantic_ai import RunContext
from pydantic import BaseModel, Field
from .dependencies import GAAnalyticsDependencies


class GADataRequest(BaseModel):
    """Model for GA data fetch requests."""
    endpoint: str = Field(description="GA MCP API endpoint (/api/summary, /api/pages, etc)")
    date_range: Optional[str] = Field(default="last7days", description="Date range for data")
    filters: Optional[Dict] = Field(default=None, description="Optional filters")


class MetricAnalysis(BaseModel):
    """Model for metric analysis results."""
    metric_name: str
    current_value: float
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    trend: str  # "up", "down", "stable"
    severity: str  # "normal", "warning", "critical"
    recommendation: Optional[str] = None


class InsightGeneration(BaseModel):
    """Model for generated insights."""
    insight_type: str  # "anomaly", "opportunity", "trend"
    title: str
    description: str
    impact: str
    action_items: List[str]
    priority: str  # "high", "medium", "low"


async def fetch_ga_data(
    ctx: RunContext[GAAnalyticsDependencies],
    endpoint: str,
    date_range: Optional[str] = "last7days",
    filters: Optional[Dict] = None
) -> Dict:
    """
    Fetch data from GA MCP server endpoints.
    
    Args:
        ctx: Runtime context with dependencies
        endpoint: API endpoint path (e.g., '/api/summary', '/api/pages')
        date_range: Date range for data
        filters: Optional filters for data
        
    Returns:
        GA data from the specified endpoint
    """
    # Validate endpoint
    valid_endpoints = ['/api/summary', '/api/pages', '/api/traffic', '/api/devices', '/api/query']
    if not any(endpoint.startswith(e) for e in valid_endpoints):
        raise ValueError(f"Invalid endpoint: {endpoint}. Must be one of {valid_endpoints}")
    
    # Build query parameters
    params = {"dateRange": date_range}
    if filters:
        params.update(filters)
    
    try:
        # Fetch data from GA MCP server
        data = await ctx.deps.fetch_ga_data(endpoint, params)
        
        # Log in debug mode
        if ctx.deps.debug:
            print(f"Fetched GA data from {endpoint}: {len(data)} records")
        
        return data
    
    except Exception as e:
        # Retry logic
        for attempt in range(ctx.deps.max_retries):
            try:
                data = await ctx.deps.fetch_ga_data(endpoint, params)
                return data
            except Exception:
                if attempt == ctx.deps.max_retries - 1:
                    raise ValueError(f"Failed to fetch GA data after {ctx.deps.max_retries} attempts: {str(e)}")
                continue
        
        raise ValueError(f"Failed to fetch GA data: {str(e)}")


async def analyze_metrics(
    ctx: RunContext[GAAnalyticsDependencies],
    metrics: Dict[str, Any],
    comparison_period: Optional[str] = "previous_period"
) -> List[MetricAnalysis]:
    """
    Analyze GA metrics for anomalies and trends.
    
    Args:
        ctx: Runtime context with dependencies
        metrics: Metrics data to analyze
        comparison_period: Period for comparison
        
    Returns:
        List of metric analysis results
    """
    analyses = []
    
    for metric_name, metric_data in metrics.items():
        # Extract current and previous values
        current_value = metric_data.get("value", 0)
        previous_value = metric_data.get("previous_value")
        
        # Calculate change percentage
        change_percentage = None
        if previous_value and previous_value != 0:
            change_percentage = ((current_value - previous_value) / previous_value) * 100
        
        # Determine trend
        trend = "stable"
        if change_percentage:
            if change_percentage > 5:
                trend = "up"
            elif change_percentage < -5:
                trend = "down"
        
        # Assess severity based on thresholds
        severity = "normal"
        recommendation = None
        
        # Check for critical thresholds
        if metric_name == "bounce_rate" and current_value > 70:
            severity = "warning"
            recommendation = "High bounce rate detected. Review page content and user experience."
        elif metric_name == "conversion_rate" and change_percentage and change_percentage < -15:
            severity = "critical"
            recommendation = "Significant drop in conversion rate. Investigate recent changes."
        elif metric_name == "sessions" and change_percentage and change_percentage < -20:
            severity = "warning"
            recommendation = "Notable decrease in traffic. Check marketing campaigns and SEO."
        
        # Create analysis
        analysis = MetricAnalysis(
            metric_name=metric_name,
            current_value=current_value,
            previous_value=previous_value,
            change_percentage=change_percentage,
            trend=trend,
            severity=severity,
            recommendation=recommendation
        )
        
        analyses.append(analysis)
    
    return analyses


async def generate_insights(
    ctx: RunContext[GAAnalyticsDependencies],
    analytics_data: Dict[str, Any],
    focus_area: Optional[str] = "overall"
) -> List[InsightGeneration]:
    """
    Generate actionable insights from analytics data.
    
    Args:
        ctx: Runtime context with dependencies
        analytics_data: Complete analytics data
        focus_area: Area to focus insights on
        
    Returns:
        List of generated insights
    """
    insights = []
    
    # Analyze traffic patterns
    if "traffic" in analytics_data:
        traffic_data = analytics_data["traffic"]
        
        # Check for traffic source issues
        if traffic_data.get("direct_traffic_percentage", 0) > 50:
            insights.append(InsightGeneration(
                insight_type="opportunity",
                title="High Direct Traffic Attribution",
                description="Over 50% of traffic is attributed to direct sources, indicating potential tracking issues.",
                impact="Missing attribution data for marketing campaigns",
                action_items=[
                    "Implement UTM parameters for all campaigns",
                    "Review tracking code implementation",
                    "Set up campaign tracking dashboard"
                ],
                priority="high"
            ))
    
    # Analyze page performance
    if "pages" in analytics_data:
        pages_data = analytics_data["pages"]
        
        # Check for high-bounce pages
        high_bounce_pages = [p for p in pages_data if p.get("bounce_rate", 0) > 80]
        if high_bounce_pages:
            insights.append(InsightGeneration(
                insight_type="anomaly",
                title="High Bounce Rate Pages Detected",
                description=f"{len(high_bounce_pages)} pages have bounce rates above 80%",
                impact="Poor user engagement and conversion potential",
                action_items=[
                    "Review page content relevance",
                    "Improve page load speed",
                    "Add clear calls-to-action",
                    "Test different content formats"
                ],
                priority="medium"
            ))
    
    # Analyze conversion opportunities
    if "conversions" in analytics_data:
        conversion_data = analytics_data["conversions"]
        
        # Check conversion rate trends
        if conversion_data.get("trend") == "declining":
            insights.append(InsightGeneration(
                insight_type="trend",
                title="Declining Conversion Rate Trend",
                description="Conversion rates have decreased over the past period",
                impact="Reduced ROI on marketing efforts",
                action_items=[
                    "A/B test landing pages",
                    "Review conversion funnel for drop-offs",
                    "Optimize form fields",
                    "Implement exit-intent offers"
                ],
                priority="high"
            ))
    
    # Device-specific insights
    if "devices" in analytics_data:
        device_data = analytics_data["devices"]
        
        # Check mobile performance
        mobile_conversion = device_data.get("mobile", {}).get("conversion_rate", 0)
        desktop_conversion = device_data.get("desktop", {}).get("conversion_rate", 0)
        
        if desktop_conversion > 0 and mobile_conversion < desktop_conversion * 0.5:
            insights.append(InsightGeneration(
                insight_type="opportunity",
                title="Mobile Conversion Rate Optimization Needed",
                description="Mobile conversion rate is less than 50% of desktop rate",
                impact="Missing conversions from mobile traffic",
                action_items=[
                    "Optimize mobile user experience",
                    "Simplify mobile forms",
                    "Improve mobile page speed",
                    "Test mobile-specific CTAs"
                ],
                priority="high"
            ))
    
    # Sort insights by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    insights.sort(key=lambda x: priority_order.get(x.priority, 3))
    
    return insights