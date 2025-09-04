"""Test GA Analytics Agent tools functionality."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from tools import (
    fetch_ga_data, 
    analyze_metrics, 
    generate_insights,
    GADataRequest,
    MetricAnalysis,
    InsightGeneration
)
from dependencies import GAAnalyticsDependencies


@pytest.mark.unit
@pytest.mark.asyncio
async def test_fetch_ga_data_success(mock_dependencies, sample_ga_data):
    """Test successful GA data fetching."""
    # Mock the dependencies fetch_ga_data method
    mock_dependencies.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
    
    # Create mock context
    mock_ctx = MagicMock()
    mock_ctx.deps = mock_dependencies
    
    result = await fetch_ga_data(
        ctx=mock_ctx,
        endpoint="/api/summary",
        date_range="last7days"
    )
    
    assert result == sample_ga_data["summary"]
    mock_dependencies.fetch_ga_data.assert_called_once_with(
        "/api/summary", 
        {"dateRange": "last7days"}
    )


@pytest.mark.unit
@pytest.mark.asyncio
async def test_fetch_ga_data_with_filters(mock_dependencies):
    """Test GA data fetching with filters."""
    expected_data = {"sessions": 1000, "users": 800}
    mock_dependencies.fetch_ga_data = AsyncMock(return_value=expected_data)
    
    mock_ctx = MagicMock()
    mock_ctx.deps = mock_dependencies
    
    filters = {"country": "US", "device": "mobile"}
    
    result = await fetch_ga_data(
        ctx=mock_ctx,
        endpoint="/api/traffic",
        date_range="last30days",
        filters=filters
    )
    
    assert result == expected_data
    mock_dependencies.fetch_ga_data.assert_called_once_with(
        "/api/traffic", 
        {"dateRange": "last30days", "country": "US", "device": "mobile"}
    )


@pytest.mark.unit
@pytest.mark.asyncio
async def test_fetch_ga_data_invalid_endpoint(mock_dependencies):
    """Test fetch_ga_data with invalid endpoint."""
    mock_ctx = MagicMock()
    mock_ctx.deps = mock_dependencies
    
    with pytest.raises(ValueError, match="Invalid endpoint"):
        await fetch_ga_data(
            ctx=mock_ctx,
            endpoint="/api/invalid",
            date_range="last7days"
        )


@pytest.mark.unit
@pytest.mark.asyncio
async def test_fetch_ga_data_with_retry(mock_dependencies):
    """Test fetch_ga_data retry logic on failure."""
    mock_dependencies.max_retries = 2
    mock_dependencies.debug = True
    
    # First call fails, second succeeds
    expected_data = {"sessions": 1000}
    mock_dependencies.fetch_ga_data = AsyncMock(
        side_effect=[Exception("Network error"), expected_data]
    )
    
    mock_ctx = MagicMock()
    mock_ctx.deps = mock_dependencies
    
    result = await fetch_ga_data(
        ctx=mock_ctx,
        endpoint="/api/summary"
    )
    
    assert result == expected_data
    assert mock_dependencies.fetch_ga_data.call_count == 2


@pytest.mark.unit
@pytest.mark.asyncio
async def test_fetch_ga_data_max_retries_exceeded(mock_dependencies):
    """Test fetch_ga_data when max retries exceeded."""
    mock_dependencies.max_retries = 2
    mock_dependencies.fetch_ga_data = AsyncMock(side_effect=Exception("Persistent error"))
    
    mock_ctx = MagicMock()
    mock_ctx.deps = mock_dependencies
    
    with pytest.raises(ValueError, match="Failed to fetch GA data after 2 attempts"):
        await fetch_ga_data(
            ctx=mock_ctx,
            endpoint="/api/summary"
        )


@pytest.mark.unit
@pytest.mark.asyncio
async def test_analyze_metrics_normal_performance():
    """Test metric analysis with normal performance data."""
    mock_ctx = MagicMock()
    
    metrics_data = {
        "sessions": {
            "value": 1000,
            "previous_value": 950
        },
        "bounce_rate": {
            "value": 45.5,
            "previous_value": 47.2
        },
        "conversion_rate": {
            "value": 2.8,
            "previous_value": 2.9
        }
    }
    
    analyses = await analyze_metrics(mock_ctx, metrics_data)
    
    assert len(analyses) == 3
    
    # Check sessions analysis (small increase)
    sessions_analysis = next(a for a in analyses if a.metric_name == "sessions")
    assert sessions_analysis.current_value == 1000
    assert sessions_analysis.previous_value == 950
    assert sessions_analysis.change_percentage == pytest.approx(5.26, abs=0.1)
    assert sessions_analysis.trend == "up"
    assert sessions_analysis.severity == "normal"
    
    # Check bounce rate (normal range)
    bounce_analysis = next(a for a in analyses if a.metric_name == "bounce_rate")
    assert bounce_analysis.severity == "normal"  # Under 70% threshold
    
    # Check conversion rate (slight decline)
    conversion_analysis = next(a for a in analyses if a.metric_name == "conversion_rate")
    assert conversion_analysis.trend == "stable"  # Within 5% threshold
    assert conversion_analysis.severity == "normal"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_analyze_metrics_warning_conditions():
    """Test metric analysis with warning conditions."""
    mock_ctx = MagicMock()
    
    metrics_data = {
        "bounce_rate": {
            "value": 75.5,
            "previous_value": 65.2
        },
        "sessions": {
            "value": 800,
            "previous_value": 1000
        }
    }
    
    analyses = await analyze_metrics(mock_ctx, metrics_data)
    
    # Check high bounce rate warning
    bounce_analysis = next(a for a in analyses if a.metric_name == "bounce_rate")
    assert bounce_analysis.severity == "warning"
    assert "High bounce rate detected" in bounce_analysis.recommendation
    
    # Check significant traffic drop
    sessions_analysis = next(a for a in analyses if a.metric_name == "sessions")
    assert sessions_analysis.change_percentage == -20.0
    assert sessions_analysis.trend == "down"
    assert sessions_analysis.severity == "warning"
    assert "decrease in traffic" in sessions_analysis.recommendation


@pytest.mark.unit
@pytest.mark.asyncio
async def test_analyze_metrics_critical_conditions():
    """Test metric analysis with critical conditions."""
    mock_ctx = MagicMock()
    
    metrics_data = {
        "conversion_rate": {
            "value": 1.2,
            "previous_value": 2.8
        }
    }
    
    analyses = await analyze_metrics(mock_ctx, metrics_data)
    
    conversion_analysis = next(a for a in analyses if a.metric_name == "conversion_rate")
    assert conversion_analysis.change_percentage == pytest.approx(-57.14, abs=0.1)
    assert conversion_analysis.severity == "critical"
    assert "Significant drop in conversion rate" in conversion_analysis.recommendation


@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_insights_traffic_issues(sample_ga_data):
    """Test insight generation for traffic attribution issues."""
    mock_ctx = MagicMock()
    
    # Modify sample data to have high direct traffic
    traffic_data = sample_ga_data.copy()
    traffic_data["traffic"]["direct_traffic_percentage"] = 55
    
    insights = await generate_insights(mock_ctx, traffic_data)
    
    # Should generate high direct traffic insight
    traffic_insight = next(
        (i for i in insights if "Direct Traffic Attribution" in i.title), 
        None
    )
    assert traffic_insight is not None
    assert traffic_insight.insight_type == "opportunity"
    assert traffic_insight.priority == "high"
    assert "UTM parameters" in " ".join(traffic_insight.action_items)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_insights_high_bounce_pages(sample_ga_data):
    """Test insight generation for high bounce rate pages."""
    mock_ctx = MagicMock()
    
    # Modify sample data to have high bounce pages
    pages_data = sample_ga_data.copy()
    pages_data["pages"] = [
        {"page": "/landing1", "bounce_rate": 85.5},
        {"page": "/landing2", "bounce_rate": 82.3},
        {"page": "/homepage", "bounce_rate": 35.2}
    ]
    
    insights = await generate_insights(mock_ctx, pages_data)
    
    # Should generate high bounce rate insight
    bounce_insight = next(
        (i for i in insights if "High Bounce Rate" in i.title), 
        None
    )
    assert bounce_insight is not None
    assert bounce_insight.insight_type == "anomaly"
    assert bounce_insight.priority == "medium"
    assert len([p for p in pages_data["pages"] if p.get("bounce_rate", 0) > 80]) == 2


@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_insights_conversion_decline(sample_ga_data):
    """Test insight generation for declining conversion rates."""
    mock_ctx = MagicMock()
    
    # Modify sample data to show declining conversions
    conversion_data = sample_ga_data.copy()
    conversion_data["conversions"] = {"trend": "declining"}
    
    insights = await generate_insights(mock_ctx, conversion_data)
    
    # Should generate conversion decline insight
    conversion_insight = next(
        (i for i in insights if "Declining Conversion Rate" in i.title), 
        None
    )
    assert conversion_insight is not None
    assert conversion_insight.insight_type == "trend"
    assert conversion_insight.priority == "high"
    assert "A/B test" in " ".join(conversion_insight.action_items)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_insights_mobile_optimization(sample_ga_data):
    """Test insight generation for mobile conversion optimization."""
    mock_ctx = MagicMock()
    
    # Modify sample data to show poor mobile performance
    mobile_data = sample_ga_data.copy()
    mobile_data["devices"]["mobile"]["conversion_rate"] = 1.0  # Much lower than desktop's 3.2
    
    insights = await generate_insights(mock_ctx, mobile_data)
    
    # Should generate mobile optimization insight
    mobile_insight = next(
        (i for i in insights if "Mobile Conversion Rate" in i.title), 
        None
    )
    assert mobile_insight is not None
    assert mobile_insight.insight_type == "opportunity"
    assert mobile_insight.priority == "high"
    assert "mobile user experience" in " ".join(mobile_insight.action_items)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_insights_priority_sorting():
    """Test that insights are sorted by priority correctly."""
    mock_ctx = MagicMock()
    
    # Create data that will generate multiple insights with different priorities
    test_data = {
        "traffic": {"direct_traffic_percentage": 55},  # High priority
        "pages": [{"page": "/test", "bounce_rate": 85}],  # Medium priority
        "conversions": {"trend": "declining"},  # High priority
        "devices": {
            "desktop": {"conversion_rate": 3.2},
            "mobile": {"conversion_rate": 1.0}  # High priority
        }
    }
    
    insights = await generate_insights(mock_ctx, test_data)
    
    # Should have multiple insights
    assert len(insights) >= 2
    
    # First insights should be high priority
    high_priority_insights = [i for i in insights if i.priority == "high"]
    medium_priority_insights = [i for i in insights if i.priority == "medium"]
    
    # High priority should come first
    if high_priority_insights and medium_priority_insights:
        first_high_idx = insights.index(high_priority_insights[0])
        first_medium_idx = insights.index(medium_priority_insights[0])
        assert first_high_idx < first_medium_idx


@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_insights_no_issues():
    """Test insight generation when no issues are found."""
    mock_ctx = MagicMock()
    
    # Create data with no issues
    clean_data = {
        "traffic": {"direct_traffic_percentage": 25},
        "pages": [{"page": "/homepage", "bounce_rate": 35}],
        "conversions": {"trend": "stable"},
        "devices": {
            "desktop": {"conversion_rate": 3.2},
            "mobile": {"conversion_rate": 2.8}  # Good mobile performance
        }
    }
    
    insights = await generate_insights(mock_ctx, clean_data)
    
    # Should generate no significant insights
    assert len(insights) == 0


@pytest.mark.unit
def test_ga_data_request_model():
    """Test GADataRequest model validation."""
    # Valid request
    request = GADataRequest(
        endpoint="/api/summary",
        date_range="last30days",
        filters={"country": "US"}
    )
    assert request.endpoint == "/api/summary"
    assert request.date_range == "last30days"
    assert request.filters["country"] == "US"
    
    # Request with defaults
    request_minimal = GADataRequest(endpoint="/api/pages")
    assert request_minimal.date_range == "last7days"
    assert request_minimal.filters is None


@pytest.mark.unit
def test_metric_analysis_model():
    """Test MetricAnalysis model."""
    analysis = MetricAnalysis(
        metric_name="sessions",
        current_value=1000.0,
        previous_value=950.0,
        change_percentage=5.26,
        trend="up",
        severity="normal",
        recommendation="Traffic is growing steadily"
    )
    
    assert analysis.metric_name == "sessions"
    assert analysis.current_value == 1000.0
    assert analysis.trend == "up"
    assert analysis.severity == "normal"


@pytest.mark.unit
def test_insight_generation_model():
    """Test InsightGeneration model."""
    insight = InsightGeneration(
        insight_type="opportunity",
        title="Mobile Optimization",
        description="Mobile conversion rate is below optimal",
        impact="Missing mobile conversions",
        action_items=["Optimize mobile UX", "Test mobile CTAs"],
        priority="high"
    )
    
    assert insight.insight_type == "opportunity"
    assert insight.title == "Mobile Optimization"
    assert insight.priority == "high"
    assert len(insight.action_items) == 2