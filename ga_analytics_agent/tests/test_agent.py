"""Test main GA Analytics Agent functionality."""

import pytest
from unittest.mock import patch, AsyncMock
from pydantic_ai.messages import ModelTextResponse

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from agent import ga_analytics_agent, run_analytics_query, run_proactive_monitoring, get_dashboard_summary
from dependencies import GAAnalyticsDependencies


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_basic_response(test_agent, mock_dependencies):
    """Test agent provides appropriate response to basic query."""
    result = await test_agent.run(
        "Show me traffic data for the last week",
        deps=mock_dependencies
    )
    
    assert result.data is not None
    assert isinstance(result.data, str)
    assert len(result.all_messages()) > 0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_with_function_model(function_test_agent, mock_dependencies):
    """Test agent with custom function model for controlled behavior."""
    result = await function_test_agent.run(
        "Analyze my website's performance",
        deps=mock_dependencies
    )
    
    # Verify the response contains expected analytics content
    assert result.data is not None
    assert "Traffic Performance" in result.data
    assert "Optimization Opportunity" in result.data
    assert "Recommendations" in result.data
    
    # Verify message sequence
    messages = result.all_messages()
    assert len(messages) >= 3


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_tool_calling_fetch_data(test_agent, mock_dependencies, sample_ga_data):
    """Test agent calls fetch_analytics_data tool correctly."""
    # Configure TestModel to call specific tool
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll fetch your analytics data"),
        {"fetch_analytics_data": {"endpoint": "/api/summary", "date_range": "last7days"}},
        ModelTextResponse(content="Here's your analytics summary")
    ]
    
    # Mock the fetch_ga_data method to return sample data
    mock_dependencies.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
    
    result = await test_agent.run(
        "Get summary data for last week",
        deps=mock_dependencies
    )
    
    # Verify tool was called
    tool_calls = [msg for msg in result.all_messages() if msg.role == "tool-call"]
    assert len(tool_calls) > 0
    assert tool_calls[0].tool_name == "fetch_analytics_data"
    
    # Verify dependencies method was called
    mock_dependencies.fetch_ga_data.assert_called_once()


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_analysis_tool_calling(test_agent, mock_dependencies, sample_ga_data):
    """Test agent calls analyze_performance_metrics tool correctly."""
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll analyze your metrics"),
        {"analyze_performance_metrics": {"metrics_data": sample_ga_data["summary"]}},
        ModelTextResponse(content="Analysis complete")
    ]
    
    result = await test_agent.run(
        "Analyze my current metrics for anomalies",
        deps=mock_dependencies
    )
    
    # Verify tool was called
    tool_calls = [msg for msg in result.all_messages() if msg.role == "tool-call"]
    assert len(tool_calls) > 0
    assert tool_calls[0].tool_name == "analyze_performance_metrics"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_insights_generation(test_agent, mock_dependencies, sample_ga_data):
    """Test agent generates actionable insights."""
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll generate insights from your data"),
        {"generate_actionable_insights": {"analytics_data": sample_ga_data}},
        ModelTextResponse(content="Here are your actionable insights")
    ]
    
    result = await test_agent.run(
        "Generate optimization recommendations",
        deps=mock_dependencies
    )
    
    # Verify insights tool was called
    tool_calls = [msg for msg in result.all_messages() if msg.role == "tool-call"]
    assert len(tool_calls) > 0
    assert tool_calls[0].tool_name == "generate_actionable_insights"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_run_analytics_query_function():
    """Test the run_analytics_query convenience function."""
    with patch('agent.GAAnalyticsDependencies.from_settings') as mock_deps_factory:
        with patch.object(ga_analytics_agent, 'run') as mock_run:
            mock_deps = AsyncMock()
            mock_deps.cleanup = AsyncMock()
            mock_deps_factory.return_value = mock_deps
            
            mock_result = AsyncMock()
            mock_result.data = "Analytics response"
            mock_run.return_value = mock_result
            
            result = await run_analytics_query(
                "Show traffic data", 
                session_id="test-session",
                mode="conversational"
            )
            
            assert result == "Analytics response"
            mock_deps.cleanup.assert_called_once()
            mock_run.assert_called_once()


@pytest.mark.unit
@pytest.mark.asyncio
async def test_run_proactive_monitoring():
    """Test proactive monitoring functionality."""
    with patch('agent.run_analytics_query') as mock_run_query:
        mock_run_query.return_value = "Proactive insights generated"
        
        result = await run_proactive_monitoring(session_id="test-session")
        
        assert result == "Proactive insights generated"
        mock_run_query.assert_called_once_with(
            "Analyze current GA data for anomalies and optimization opportunities",
            session_id="test-session",
            mode="proactive"
        )


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_dashboard_summary():
    """Test dashboard summary data retrieval."""
    with patch('agent.GAAnalyticsDependencies.from_settings') as mock_deps_factory:
        mock_deps = AsyncMock()
        mock_deps.fetch_ga_data = AsyncMock()
        mock_deps.cleanup = AsyncMock()
        mock_deps.cache_ttl = 300
        
        # Mock responses for different endpoints
        mock_deps.fetch_ga_data.side_effect = [
            {"sessions": 1000},  # /api/summary
            {"organic": 500},    # /api/traffic
            {"homepage": 300},   # /api/pages
            {"desktop": 600}     # /api/devices
        ]
        
        mock_deps_factory.return_value = mock_deps
        
        result = await get_dashboard_summary(session_id="test-session")
        
        assert "summary" in result
        assert "traffic" in result
        assert "pages" in result
        assert "devices" in result
        assert "timestamp" in result
        assert "cache_ttl" in result
        assert result["cache_ttl"] == 300
        
        # Verify all endpoints were called
        assert mock_deps.fetch_ga_data.call_count == 4
        mock_deps.cleanup.assert_called_once()


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_error_handling(test_agent, mock_dependencies):
    """Test agent handles errors gracefully."""
    # Make the dependencies raise an error
    mock_dependencies.fetch_ga_data = AsyncMock(side_effect=Exception("API Error"))
    
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll try to fetch the data"),
        {"fetch_analytics_data": {"endpoint": "/api/summary"}},
        ModelTextResponse(content="I encountered an error fetching the data")
    ]
    
    # The agent should still return a response even if tools fail
    result = await test_agent.run(
        "Get my analytics data",
        deps=mock_dependencies
    )
    
    assert result.data is not None
    # Should have error handling in the response
    assert len(result.all_messages()) > 0


@pytest.mark.unit
@pytest.mark.asyncio  
async def test_agent_with_session_context(test_agent, mock_dependencies):
    """Test agent works with session context."""
    # Add session context to dependencies
    mock_dependencies.session_id = "test-session-123"
    mock_dependencies.user_id = "user-456"
    
    result = await test_agent.run(
        "Show me last week's performance",
        deps=mock_dependencies
    )
    
    assert result.data is not None
    assert mock_dependencies.session_id == "test-session-123"
    assert mock_dependencies.user_id == "user-456"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_with_custom_date_range(test_agent, mock_dependencies):
    """Test agent handles custom date range context."""
    mock_dependencies.date_range = "last30days"
    mock_dependencies.focus_metrics = ["sessions", "conversion_rate"]
    
    result = await test_agent.run(
        "Analyze monthly performance focusing on conversions",
        deps=mock_dependencies
    )
    
    assert result.data is not None
    assert mock_dependencies.date_range == "last30days"
    assert "conversion_rate" in mock_dependencies.focus_metrics


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_multiple_tool_calls(test_agent, mock_dependencies, sample_ga_data):
    """Test agent can make multiple tool calls in sequence."""
    test_model = test_agent.model
    test_model.agent_responses = [
        ModelTextResponse(content="I'll fetch and analyze your data"),
        {"fetch_analytics_data": {"endpoint": "/api/summary", "date_range": "last7days"}},
        {"analyze_performance_metrics": {"metrics_data": sample_ga_data["summary"]}},
        {"generate_actionable_insights": {"analytics_data": sample_ga_data}},
        ModelTextResponse(content="Here's your comprehensive analysis with insights")
    ]
    
    mock_dependencies.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
    
    result = await test_agent.run(
        "Give me a complete analysis of my website performance with recommendations",
        deps=mock_dependencies
    )
    
    # Verify multiple tools were called
    tool_calls = [msg for msg in result.all_messages() if msg.role == "tool-call"]
    assert len(tool_calls) == 3
    
    tool_names = [call.tool_name for call in tool_calls]
    assert "fetch_analytics_data" in tool_names
    assert "analyze_performance_metrics" in tool_names
    assert "generate_actionable_insights" in tool_names


@pytest.mark.unit
def test_agent_configuration():
    """Test agent is properly configured."""
    # Check agent has correct dependencies type
    assert ga_analytics_agent._deps_type == GAAnalyticsDependencies
    
    # Check agent has system prompt
    assert ga_analytics_agent._system_prompt is not None
    
    # Check agent has tools registered
    tools = ga_analytics_agent._tools
    tool_names = [tool.name for tool in tools.values()]
    
    expected_tools = [
        "fetch_analytics_data",
        "analyze_performance_metrics", 
        "generate_actionable_insights"
    ]
    
    for tool_name in expected_tools:
        assert tool_name in tool_names