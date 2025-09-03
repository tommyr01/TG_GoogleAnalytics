"""Integration tests for GA Analytics Agent end-to-end workflows."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic_ai.messages import ModelTextResponse

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from agent import ga_analytics_agent, run_analytics_query, run_proactive_monitoring, get_dashboard_summary
from dependencies import GAAnalyticsDependencies


@pytest.mark.integration
@pytest.mark.asyncio
async def test_complete_analytics_workflow(function_test_agent, sample_ga_data):
    """Test complete analytics workflow from query to insights."""
    # Create real dependencies with mocked HTTP client
    deps = GAAnalyticsDependencies(
        ga_server_url="http://localhost:3000",
        debug=True,
        session_id="integration-test-123"
    )
    
    # Mock the fetch_ga_data method to return sample data
    deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
    
    result = await function_test_agent.run(
        "Analyze my website's performance and provide actionable insights",
        deps=deps
    )
    
    # Verify the complete workflow executed
    assert result.data is not None
    assert "Traffic Performance" in result.data
    assert "Recommendations" in result.data
    assert "Chart:" in result.data  # Should include visualization
    
    # Verify tool sequence was followed
    messages = result.all_messages()
    tool_calls = [msg for msg in messages if msg.role == "tool-call"]
    assert len(tool_calls) >= 2  # Should have called multiple tools
    
    # Clean up
    await deps.cleanup()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_dashboard_summary_integration(sample_ga_data):
    """Test full dashboard summary data retrieval."""
    with patch('agent.GAAnalyticsDependencies.from_settings') as mock_deps_factory:
        mock_deps = AsyncMock()
        mock_deps.cache_ttl = 300
        mock_deps.cleanup = AsyncMock()
        
        # Mock all endpoint responses
        endpoint_responses = {
            "/api/summary": sample_ga_data["summary"],
            "/api/traffic": sample_ga_data["traffic"],
            "/api/pages": sample_ga_data["pages"],
            "/api/devices": sample_ga_data["devices"]
        }
        
        def mock_fetch_response(endpoint, params=None):
            return endpoint_responses.get(endpoint, {})
        
        mock_deps.fetch_ga_data = AsyncMock(side_effect=mock_fetch_response)
        mock_deps_factory.return_value = mock_deps
        
        result = await get_dashboard_summary(session_id="dashboard-test")
        
        # Verify all sections are present
        expected_sections = ["summary", "traffic", "pages", "devices"]
        for section in expected_sections:
            assert section in result
        
        # Verify metadata
        assert "timestamp" in result
        assert "cache_ttl" in result
        assert result["cache_ttl"] == 300
        
        # Verify all endpoints were called
        assert mock_deps.fetch_ga_data.call_count == 4
        mock_deps.cleanup.assert_called_once()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_proactive_monitoring_workflow():
    """Test proactive monitoring end-to-end workflow."""
    with patch('agent.run_analytics_query') as mock_run_query:
        # Mock a proactive monitoring response
        mock_response = """
        🚨 PERFORMANCE ALERTS 🚨

        ⚠️ **High Bounce Rate Detected** [WARNING]
        - Homepage bounce rate: 78.5% (+15% from last week)
        - Impact: Reduced user engagement and conversions
        - Actions: Review page content, improve load speed, A/B test CTA placement

        📉 **Traffic Drop Alert** [CRITICAL]  
        - Organic search traffic: -25% week-over-week
        - Impact: Significant loss in lead generation
        - Actions: Check for algorithm updates, audit recent SEO changes, review search console

        🎯 **Mobile Optimization Opportunity** [HIGH]
        - Mobile conversion rate: 1.2% vs Desktop: 3.4%
        - Impact: Missing 65% of potential mobile conversions
        - Actions: Optimize mobile forms, improve mobile page speed, test mobile-specific CTAs
        """
        
        mock_run_query.return_value = mock_response
        
        result = await run_proactive_monitoring(session_id="proactive-test")
        
        # Verify proactive monitoring executed
        assert "PERFORMANCE ALERTS" in result
        assert "High Bounce Rate" in result
        assert "Traffic Drop Alert" in result
        assert "Mobile Optimization" in result
        
        # Verify correct parameters passed
        mock_run_query.assert_called_once_with(
            "Analyze current GA data for anomalies and optimization opportunities",
            session_id="proactive-test",
            mode="proactive"
        )


@pytest.mark.integration
@pytest.mark.asyncio
async def test_conversational_query_integration(function_test_agent, sample_ga_data):
    """Test conversational analytics query integration."""
    deps = GAAnalyticsDependencies(
        ga_server_url="http://localhost:3000",
        session_id="conv-test-456",
        focus_metrics=["conversion_rate", "bounce_rate"]
    )
    
    # Mock GA data fetch
    deps.fetch_ga_data = AsyncMock()
    deps.fetch_ga_data.side_effect = [
        sample_ga_data["summary"],    # First tool call
        sample_ga_data["devices"],    # Second tool call
    ]
    
    result = await function_test_agent.run(
        "Show me how mobile performance compares to desktop, focusing on conversion rates",
        deps=deps
    )
    
    # Verify response includes relevant analysis
    assert result.data is not None
    assert "conversion" in result.data.lower()
    
    # Verify session context was maintained
    assert deps.session_id == "conv-test-456"
    assert "conversion_rate" in deps.focus_metrics
    
    await deps.cleanup()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_error_recovery_workflow(test_agent, mock_dependencies):
    """Test end-to-end error recovery workflow."""
    # First call fails, second succeeds
    mock_dependencies.fetch_ga_data = AsyncMock()
    mock_dependencies.fetch_ga_data.side_effect = [
        Exception("Network timeout"),
        {"sessions": 1000, "users": 800}  # Recovery data
    ]
    mock_dependencies.max_retries = 2
    
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll fetch your analytics data"),
        {"fetch_analytics_data": {"endpoint": "/api/summary"}},
        ModelTextResponse(content="Successfully retrieved data after retry")
    ]
    
    result = await test_agent.run(
        "Get my website analytics",
        deps=mock_dependencies
    )
    
    # Should complete successfully despite initial error
    assert result.data is not None
    assert "retrieved data" in result.data.lower()
    
    # Verify retry logic was used
    assert mock_dependencies.fetch_ga_data.call_count == 2


@pytest.mark.integration
@pytest.mark.asyncio
async def test_multi_endpoint_analysis_workflow(test_agent, sample_ga_data):
    """Test workflow that fetches from multiple endpoints."""
    deps = GAAnalyticsDependencies(ga_server_url="http://localhost:3000")
    
    # Mock responses from different endpoints
    endpoint_data = {
        "/api/summary": sample_ga_data["summary"],
        "/api/pages": sample_ga_data["pages"],
        "/api/devices": sample_ga_data["devices"]
    }
    
    def mock_fetch(endpoint, params=None):
        return endpoint_data.get(endpoint, {})
    
    deps.fetch_ga_data = AsyncMock(side_effect=mock_fetch)
    
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll analyze data from multiple sources"),
        {"fetch_analytics_data": {"endpoint": "/api/summary"}},
        {"fetch_analytics_data": {"endpoint": "/api/pages"}},
        {"fetch_analytics_data": {"endpoint": "/api/devices"}},
        {"generate_actionable_insights": {"analytics_data": sample_ga_data}},
        ModelTextResponse(content="Comprehensive analysis complete with cross-endpoint insights")
    ]
    
    result = await test_agent.run(
        "Give me a comprehensive analysis across all data sources",
        deps=deps
    )
    
    # Verify multiple endpoints were called
    assert deps.fetch_ga_data.call_count == 3
    
    # Verify comprehensive analysis was provided
    assert "comprehensive analysis" in result.data.lower()
    
    await deps.cleanup()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_session_context_persistence():
    """Test that session context persists through multiple interactions."""
    session_id = "persistence-test-789"
    
    with patch('agent.GAAnalyticsDependencies.from_settings') as mock_deps_factory:
        mock_deps = MagicMock()
        mock_deps.session_id = session_id
        mock_deps.cleanup = AsyncMock()
        mock_deps_factory.return_value = mock_deps
        
        with patch.object(ga_analytics_agent, 'run') as mock_run:
            mock_result = AsyncMock()
            mock_result.data = "Session response 1"
            mock_run.return_value = mock_result
            
            # First interaction
            result1 = await run_analytics_query(
                "Show traffic trends",
                session_id=session_id
            )
            
            # Verify session context was used
            call_args = mock_run.call_args
            assert call_args[1]['deps'].session_id == session_id
            
            # Second interaction with same session
            mock_result.data = "Session response 2"
            result2 = await run_analytics_query(
                "Now show conversions",
                session_id=session_id
            )
            
            # Verify same session continued
            call_args = mock_run.call_args
            assert call_args[1]['deps'].session_id == session_id
            
            assert result1 == "Session response 1"
            assert result2 == "Session response 2"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_chart_generation_integration(function_test_agent, sample_ga_data):
    """Test chart generation in response integration."""
    deps = GAAnalyticsDependencies(
        chart_width=800,
        chart_height=600,
        chart_theme="light"
    )
    
    deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["traffic"])
    
    result = await function_test_agent.run(
        "Show me a chart of traffic sources",
        deps=deps
    )
    
    # Verify chart elements are in response
    assert result.data is not None
    assert "Chart:" in result.data or "████" in result.data  # ASCII chart indicators
    
    # Verify chart settings were accessible
    assert deps.chart_width == 800
    assert deps.chart_height == 600
    assert deps.chart_theme == "light"
    
    await deps.cleanup()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_anomaly_detection_integration(test_agent, anomaly_ga_data):
    """Test anomaly detection end-to-end workflow."""
    deps = GAAnalyticsDependencies()
    deps.fetch_ga_data = AsyncMock(return_value=anomaly_ga_data["summary"])
    
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll analyze your data for anomalies"),
        {"fetch_analytics_data": {"endpoint": "/api/summary"}},
        {"analyze_performance_metrics": {"metrics_data": anomaly_ga_data["summary"]}},
        ModelTextResponse(content="⚠️ CRITICAL ISSUES DETECTED: 67% traffic drop, 75% bounce rate")
    ]
    
    result = await test_agent.run(
        "Check for any performance issues",
        deps=deps
    )
    
    # Should detect and report anomalies
    assert "CRITICAL ISSUES" in result.data
    assert "traffic drop" in result.data
    assert "bounce rate" in result.data
    
    await deps.cleanup()


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.asyncio
async def test_rate_limiting_integration():
    """Test rate limiting doesn't break workflows."""
    deps = GAAnalyticsDependencies(
        api_rate_limit=2,  # Very low limit for testing
        max_retries=1
    )
    
    # Mock rate limited responses
    call_count = 0
    async def rate_limited_fetch(endpoint, params=None):
        nonlocal call_count
        call_count += 1
        if call_count <= 2:
            return {"sessions": 1000 * call_count}
        else:
            # Simulate rate limit exceeded
            import httpx
            response = MagicMock()
            response.status_code = 429
            response.text = "Rate limit exceeded"
            raise httpx.HTTPStatusError("429 Too Many Requests", request=None, response=response)
    
    deps.fetch_ga_data = AsyncMock(side_effect=rate_limited_fetch)
    
    with patch('agent.ga_analytics_agent') as mock_agent:
        mock_result = AsyncMock()
        mock_result.data = "Rate limited response"
        mock_agent.run = AsyncMock(return_value=mock_result)
        
        # Should handle rate limiting gracefully
        result = await run_analytics_query(
            "Get summary data",
            deps=deps
        )
        
        assert result == "Rate limited response"
        
        # Clean up
        await deps.cleanup()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_concurrent_requests_integration():
    """Test handling concurrent requests to the agent."""
    import asyncio
    
    # Create multiple concurrent requests
    queries = [
        "Show traffic data",
        "Analyze conversion rates", 
        "Check bounce rates",
        "Review page performance"
    ]
    
    with patch('agent.run_analytics_query') as mock_query:
        mock_query.return_value = "Concurrent response"
        
        # Run queries concurrently
        tasks = [
            run_analytics_query(query, session_id=f"concurrent-{i}")
            for i, query in enumerate(queries)
        ]
        
        results = await asyncio.gather(*tasks)
        
        # All should complete successfully
        assert len(results) == 4
        assert all(result == "Concurrent response" for result in results)
        
        # Verify all were called
        assert mock_query.call_count == 4