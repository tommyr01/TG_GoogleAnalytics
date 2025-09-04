"""Main GA Analytics Dashboard Agent implementation."""

from typing import Optional, Dict, Any
from pydantic_ai import Agent, RunContext
from .providers import get_llm_model
from .dependencies import GAAnalyticsDependencies
from .prompts import SYSTEM_PROMPT, get_marketing_context, get_prompt_for_mode
from .tools import fetch_ga_data, analyze_metrics, generate_insights
from .settings import settings


# Initialize the GA Analytics Agent
ga_analytics_agent = Agent(
    get_llm_model(),
    deps_type=GAAnalyticsDependencies,
    system_prompt=SYSTEM_PROMPT,
    retries=settings.max_retries
)


# Register the dynamic context prompt
@ga_analytics_agent.system_prompt
async def marketing_context_prompt(ctx: RunContext[GAAnalyticsDependencies]) -> str:
    """Add dynamic marketing context to the system prompt."""
    return await get_marketing_context(ctx)


# Register tool: Fetch GA Data
@ga_analytics_agent.tool
async def fetch_analytics_data(
    ctx: RunContext[GAAnalyticsDependencies],
    endpoint: str,
    date_range: Optional[str] = "last7days"
) -> Dict[str, Any]:
    """
    Fetch Google Analytics data from MCP server.
    
    Args:
        endpoint: API endpoint (/api/summary, /api/pages, /api/traffic, /api/devices)
        date_range: Date range for data (e.g., "last7days", "last30days")
    
    Returns:
        Analytics data from the specified endpoint
    """
    return await fetch_ga_data(ctx, endpoint, date_range)


# Register tool: Analyze Metrics
@ga_analytics_agent.tool
async def analyze_performance_metrics(
    ctx: RunContext[GAAnalyticsDependencies],
    metrics_data: Dict[str, Any]
) -> str:
    """
    Analyze GA metrics for trends and anomalies.
    
    Args:
        metrics_data: Dictionary of metrics to analyze
        
    Returns:
        Analysis summary with recommendations
    """
    analyses = await analyze_metrics(ctx, metrics_data)
    
    # Format analysis results
    summary = []
    for analysis in analyses:
        if analysis.severity != "normal":
            summary.append(
                f"⚠️ {analysis.metric_name}: {analysis.trend} trend "
                f"({analysis.change_percentage:.1f}% change) - {analysis.recommendation}"
            )
    
    return "\n".join(summary) if summary else "All metrics within normal ranges."


# Register tool: Generate Insights
@ga_analytics_agent.tool
async def generate_actionable_insights(
    ctx: RunContext[GAAnalyticsDependencies],
    analytics_data: Dict[str, Any]
) -> str:
    """
    Generate actionable insights from analytics data.
    
    Args:
        analytics_data: Complete analytics data dictionary
        
    Returns:
        Formatted insights with action items
    """
    insights = await generate_insights(ctx, analytics_data)
    
    # Format insights
    formatted_insights = []
    for insight in insights:
        formatted_insights.append(
            f"🎯 **{insight.title}** [{insight.priority.upper()}]\n"
            f"   {insight.description}\n"
            f"   Impact: {insight.impact}\n"
            f"   Actions: " + ", ".join(insight.action_items)
        )
    
    return "\n\n".join(formatted_insights) if formatted_insights else "No significant insights at this time."


async def run_analytics_query(
    query: str,
    session_id: Optional[str] = None,
    mode: str = "conversational",
    **dependency_overrides
) -> str:
    """
    Run an analytics query with the GA agent.
    
    Args:
        query: User's analytics question
        session_id: Optional session identifier
        mode: Operation mode (conversational, proactive, default)
        **dependency_overrides: Additional dependency overrides
        
    Returns:
        Agent's response with analytics insights
    """
    # Create dependencies
    deps = GAAnalyticsDependencies.from_settings(
        settings_override=None,
        session_id=session_id,
        **dependency_overrides
    )
    
    # Get appropriate prompt for mode
    prompt = get_prompt_for_mode(mode)
    
    try:
        # Run the agent
        result = await ga_analytics_agent.run(
            query,
            deps=deps,
            system_prompt=prompt
        )
        return result.data
    
    finally:
        # Clean up resources
        await deps.cleanup()


async def run_proactive_monitoring(
    session_id: Optional[str] = None,
    **dependency_overrides
) -> str:
    """
    Run proactive monitoring to identify issues and opportunities.
    
    Args:
        session_id: Optional session identifier
        **dependency_overrides: Additional dependency overrides
        
    Returns:
        Proactive insights and alerts
    """
    return await run_analytics_query(
        "Analyze current GA data for anomalies and optimization opportunities",
        session_id=session_id,
        mode="proactive",
        **dependency_overrides
    )


async def get_dashboard_summary(
    session_id: Optional[str] = None,
    **dependency_overrides
) -> Dict[str, Any]:
    """
    Get comprehensive dashboard data for all sections.
    
    Args:
        session_id: Optional session identifier
        **dependency_overrides: Additional dependency overrides
        
    Returns:
        Dashboard data for all sections
    """
    deps = GAAnalyticsDependencies.from_settings(
        settings_override=None,
        session_id=session_id,
        **dependency_overrides
    )
    
    try:
        # Fetch data from all endpoints
        dashboard_data = {
            "summary": await deps.fetch_ga_data("/api/summary"),
            "traffic": await deps.fetch_ga_data("/api/traffic"),
            "pages": await deps.fetch_ga_data("/api/pages"),
            "devices": await deps.fetch_ga_data("/api/devices")
        }
        
        # Add timestamp
        from datetime import datetime
        dashboard_data["timestamp"] = datetime.utcnow().isoformat()
        dashboard_data["cache_ttl"] = deps.cache_ttl
        
        return dashboard_data
    
    finally:
        await deps.cleanup()