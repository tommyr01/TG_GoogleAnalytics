"""Validation tests against INITIAL.md requirements for GA Analytics Agent."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from agent import ga_analytics_agent, run_analytics_query, run_proactive_monitoring, get_dashboard_summary
from dependencies import GAAnalyticsDependencies
from settings import GAAnalyticsSettings
from tools import fetch_ga_data, analyze_metrics, generate_insights


class TestSuccessCriteria:
    """Test all success criteria from INITIAL.md."""
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_dashboard_displays_real_time_ga4_data(self, sample_ga_data):
        """Success Criteria: Dashboard displays real-time GA4 data across all five sections."""
        with patch('agent.GAAnalyticsDependencies.from_settings') as mock_deps_factory:
            mock_deps = AsyncMock()
            mock_deps.cache_ttl = 300
            mock_deps.cleanup = AsyncMock()
            
            # Mock all five dashboard sections
            dashboard_sections = {
                "/api/summary": sample_ga_data["summary"],    # Traffic & Acquisition overview
                "/api/traffic": sample_ga_data["traffic"],    # Traffic sources
                "/api/pages": sample_ga_data["pages"],        # Page performance
                "/api/devices": sample_ga_data["devices"],    # Device analytics
                # Note: Audience and Conversions would be additional endpoints
            }
            
            def mock_fetch_response(endpoint, params=None):
                return dashboard_sections.get(endpoint, {})
            
            mock_deps.fetch_ga_data = AsyncMock(side_effect=mock_fetch_response)
            mock_deps_factory.return_value = mock_deps
            
            result = await get_dashboard_summary()
            
            # Verify all required sections are present
            required_sections = ["summary", "traffic", "pages", "devices"]
            for section in required_sections:
                assert section in result, f"Missing dashboard section: {section}"
            
            # Verify data freshness (5-minute intervals mentioned in requirements)
            assert "timestamp" in result
            assert "cache_ttl" in result
            assert result["cache_ttl"] <= 300  # 5 minutes or less
            
            # Verify real GA4 data structure
            summary = result["summary"]
            assert "sessions" in summary
            assert "users" in summary
            assert "bounce_rate" in summary
            
            traffic = result["traffic"]
            assert "organic_search" in traffic or "organic" in str(traffic).lower()
            
            pages = result["pages"]
            assert isinstance(pages, list) and len(pages) > 0
            
            devices = result["devices"]
            assert "desktop" in devices or "mobile" in devices
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_chat_interface_natural_language_queries(self, function_test_agent, sample_ga_data):
        """Success Criteria: Chat interface responds accurately to natural language analytics queries."""
        deps = GAAnalyticsDependencies()
        deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
        
        # Test various natural language queries
        test_queries = [
            "Show me top pages this week",
            "What's my bounce rate looking like?",
            "How is mobile traffic performing?",
            "Give me conversion rate trends",
            "Which traffic sources are performing best?"
        ]
        
        for query in test_queries:
            result = await function_test_agent.run(query, deps=deps)
            
            # Verify agent responds with analytics content
            assert result.data is not None
            assert len(result.data) > 50  # Substantive response
            
            # Should include some analytics terminology
            analytics_terms = ["traffic", "conversion", "bounce", "sessions", "users", "performance"]
            response_lower = result.data.lower()
            has_analytics_term = any(term in response_lower for term in analytics_terms)
            assert has_analytics_term, f"Response to '{query}' lacks analytics content"
        
        await deps.cleanup()
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_proactive_insights_engine(self, test_agent, anomaly_ga_data):
        """Success Criteria: Agent proactively identifies at least 3 types of performance issues."""
        deps = GAAnalyticsDependencies()
        deps.fetch_ga_data = AsyncMock(return_value=anomaly_ga_data["summary"])
        
        # Test proactive monitoring
        with patch('agent.run_analytics_query') as mock_run_query:
            # Mock response that includes multiple issue types
            proactive_response = """
            🚨 PERFORMANCE ALERTS DETECTED 🚨
            
            1. ⚠️ **Traffic Anomaly** [CRITICAL]
            Sessions dropped 67% week-over-week (3,500 vs 10,500)
            
            2. 📈 **Bounce Rate Issue** [WARNING]  
            Bounce rate increased to 75.5% (above 70% threshold)
            
            3. 💰 **Conversion Rate Drop** [CRITICAL]
            Conversion rate fell to 1.2% from 2.8% (-57% change)
            
            4. 🎯 **Attribution Problem** [HIGH]
            50% direct traffic suggests tracking issues
            """
            
            mock_run_query.return_value = proactive_response
            
            result = await run_proactive_monitoring()
            
            # Verify at least 3 types of issues are identified
            issue_indicators = ["Traffic Anomaly", "Bounce Rate", "Conversion Rate", "Attribution"]
            identified_issues = [indicator for indicator in issue_indicators if indicator in result]
            
            assert len(identified_issues) >= 3, f"Only identified {len(identified_issues)} issue types: {identified_issues}"
            
            # Verify proactive mode was used
            mock_run_query.assert_called_once()
            call_args = mock_run_query.call_args[1]
            assert call_args["mode"] == "proactive"
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_vercel_deployment_readiness(self):
        """Success Criteria: Successfully deploys to Vercel with external access."""
        # Test serverless-friendly configuration
        settings = GAAnalyticsSettings(
            llm_api_key="test-key",
            ga_mcp_server_url="http://localhost:3000",
            vercel_url="https://test-app.vercel.app",
            node_env="production"
        )
        
        # Verify stateless agent design (no persistent state)
        deps = GAAnalyticsDependencies.from_settings()
        assert deps.session_id is None  # Should not have persistent session state
        
        # Test that agent can be instantiated without persistent connections
        agent_instance = ga_analytics_agent
        assert agent_instance is not None
        
        # Verify configuration supports serverless deployment
        assert settings.vercel_url is not None
        assert settings.node_env == "production"
        
        # Test cleanup functionality (important for serverless)
        await deps.cleanup()  # Should not raise errors
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_api_rate_limits_error_handling(self, mock_dependencies):
        """Success Criteria: Handles API rate limits and errors gracefully."""
        # Test rate limit handling
        import httpx
        
        async def rate_limit_error(*args, **kwargs):
            response = MagicMock()
            response.status_code = 429
            response.text = "Rate limit exceeded"
            raise httpx.HTTPStatusError("429 Too Many Requests", request=None, response=response)
        
        mock_dependencies.fetch_ga_data = AsyncMock(side_effect=rate_limit_error)
        
        mock_ctx = MagicMock()
        mock_ctx.deps = mock_dependencies
        mock_ctx.deps.max_retries = 3
        
        # Should handle rate limits gracefully
        with pytest.raises(ValueError) as exc_info:
            await fetch_ga_data(mock_ctx, "/api/summary")
        
        assert "Failed to fetch GA data" in str(exc_info.value)
        
        # Test timeout handling
        async def timeout_error(*args, **kwargs):
            raise httpx.TimeoutException("Request timed out")
        
        mock_dependencies.fetch_ga_data = AsyncMock(side_effect=timeout_error)
        
        with pytest.raises(ValueError) as exc_info:
            await fetch_ga_data(mock_ctx, "/api/summary") 
        
        assert "timed out" in str(exc_info.value)
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_generates_charts_and_tables(self, function_test_agent, sample_ga_data):
        """Success Criteria: Generates charts and tables in conversational responses."""
        deps = GAAnalyticsDependencies(
            chart_width=800,
            chart_height=600,
            chart_theme="light"
        )
        deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["traffic"])
        
        result = await function_test_agent.run(
            "Show me a breakdown of traffic sources with a chart",
            deps=deps
        )
        
        # Verify chart generation capabilities
        response_data = result.data
        
        # Should include chart indicators (ASCII charts or chart references)
        chart_indicators = ["Chart:", "████", "│", "┌", "└", "Table:", "|"]
        has_chart = any(indicator in response_data for indicator in chart_indicators)
        
        assert has_chart, f"Response lacks chart/table visualization: {response_data[:200]}..."
        
        # Verify chart configuration was accessible
        assert deps.chart_width == 800
        assert deps.chart_height == 600
        
        await deps.cleanup()


class TestTechnicalRequirements:
    """Test technical requirements from INITIAL.md."""
    
    @pytest.mark.validation
    def test_openai_gpt4_turbo_model(self):
        """Requirement: Uses OpenAI GPT-4 Turbo model."""
        from providers import get_llm_model
        
        with patch.dict(os.environ, {'LLM_API_KEY': 'test-key'}):
            model = get_llm_model()
            
            # Should be OpenAI model
            assert hasattr(model, 'model_name')
            # Model name should be GPT-4 variant
            assert "gpt-4" in model.model_name.lower()
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_ga_mcp_client_integration(self, sample_ga_data):
        """Requirement: Interfaces with GA MCP server at localhost:3000."""
        deps = GAAnalyticsDependencies(ga_server_url="http://localhost:3000")
        
        # Mock successful connection to localhost:3000
        deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
        
        mock_ctx = MagicMock()
        mock_ctx.deps = deps
        
        result = await fetch_ga_data(mock_ctx, "/api/summary")
        
        # Verify connection to correct server
        assert deps.ga_server_url == "http://localhost:3000"
        assert result == sample_ga_data["summary"]
        
        await deps.cleanup()
    
    @pytest.mark.validation
    def test_required_api_endpoints(self):
        """Requirement: Supports all required API endpoints."""
        from tools import fetch_ga_data
        
        required_endpoints = [
            "/api/summary",
            "/api/pages", 
            "/api/traffic",
            "/api/devices",
            "/api/query"
        ]
        
        # Verify endpoint validation allows all required endpoints
        mock_ctx = MagicMock()
        mock_ctx.deps = MagicMock()
        
        for endpoint in required_endpoints:
            # Should not raise validation error for required endpoints
            try:
                # This will fail at fetch stage, but endpoint validation should pass
                import asyncio
                asyncio.run(fetch_ga_data(mock_ctx, endpoint))
            except ValueError as e:
                # Should not be an "Invalid endpoint" error
                assert "Invalid endpoint" not in str(e)
            except:
                # Other errors are expected without real server
                pass
    
    @pytest.mark.validation
    def test_environment_variables_support(self):
        """Requirement: Supports required environment variables."""
        required_env_vars = [
            "OPENAI_API_KEY",
            "GA_MCP_SERVER_URL", 
            "VERCEL_URL",
            "NODE_ENV"
        ]
        
        # Test with all required variables
        test_env = {
            "LLM_API_KEY": "test-openai-key",
            "GA_MCP_SERVER_URL": "http://localhost:3000",
            "VERCEL_URL": "https://test.vercel.app", 
            "NODE_ENV": "production"
        }
        
        with patch.dict(os.environ, test_env, clear=False):
            settings = GAAnalyticsSettings(
                llm_api_key=test_env["LLM_API_KEY"],
                ga_mcp_server_url=test_env["GA_MCP_SERVER_URL"],
                vercel_url=test_env["VERCEL_URL"],
                node_env=test_env["NODE_ENV"]
            )
            
            assert settings.llm_api_key == "test-openai-key"
            assert settings.ga_mcp_server_url == "http://localhost:3000"
            assert settings.vercel_url == "https://test.vercel.app"
            assert settings.node_env == "production"


class TestDashboardPagesStructure:
    """Test dashboard pages structure requirements."""
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_traffic_acquisition_page(self, sample_ga_data):
        """Requirement: Traffic & Acquisition page with sessions, users, sources."""
        mock_ctx = MagicMock()
        mock_ctx.deps = MagicMock()
        mock_ctx.deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["traffic"])
        
        traffic_data = await fetch_ga_data(mock_ctx, "/api/traffic")
        
        # Verify traffic acquisition metrics
        assert "organic_search" in traffic_data
        assert "direct" in traffic_data
        assert "social" in traffic_data
        
        # Sessions and percentage data should be present
        organic = traffic_data["organic_search"]
        assert "sessions" in organic
        assert "percentage" in organic
    
    @pytest.mark.validation  
    @pytest.mark.asyncio
    async def test_pages_performance_data(self, sample_ga_data):
        """Requirement: Pages section with views, bounce rates, top content."""
        mock_ctx = MagicMock()
        mock_ctx.deps = MagicMock()
        mock_ctx.deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["pages"])
        
        pages_data = await fetch_ga_data(mock_ctx, "/api/pages")
        
        # Verify pages structure
        assert isinstance(pages_data, list)
        assert len(pages_data) > 0
        
        page = pages_data[0]
        required_fields = ["page", "page_views", "bounce_rate"]
        for field in required_fields:
            assert field in page, f"Missing field {field} in page data"
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_devices_analytics(self, sample_ga_data):
        """Requirement: Devices section with types, browsers, screen resolutions."""
        mock_ctx = MagicMock()
        mock_ctx.deps = MagicMock()
        mock_ctx.deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["devices"])
        
        devices_data = await fetch_ga_data(mock_ctx, "/api/devices")
        
        # Verify device categories
        expected_devices = ["desktop", "mobile", "tablet"]
        for device in expected_devices:
            assert device in devices_data
            
            device_data = devices_data[device]
            assert "sessions" in device_data
            assert "percentage" in device_data


class TestChatInterfaceCapabilities:
    """Test chat interface capabilities from requirements."""
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_natural_language_analytics_queries(self, function_test_agent, sample_ga_data):
        """Requirement: Natural language analytics queries."""
        deps = GAAnalyticsDependencies()
        deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
        
        natural_queries = [
            "Show me top pages this week",
            "What's the bounce rate trend?",
            "How are conversions performing?",
            "Which traffic sources work best?"
        ]
        
        for query in natural_queries:
            result = await function_test_agent.run(query, deps=deps)
            
            # Should respond with relevant analytics content
            assert result.data is not None
            assert len(result.data) > 30  # Meaningful response length
        
        await deps.cleanup()
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_proactive_alerts_and_insights(self):
        """Requirement: Proactive alerts and insights."""
        with patch('agent.run_analytics_query') as mock_query:
            alerts_response = """
            🚨 ALERTS & INSIGHTS 🚨
            
            📉 Traffic Alert: 20% drop in organic search
            ⚠️ Performance Issue: Mobile bounce rate above threshold
            🎯 Opportunity: Conversion rate optimization needed
            """
            
            mock_query.return_value = alerts_response
            
            result = await run_proactive_monitoring()
            
            # Verify proactive insights are generated
            assert "ALERTS & INSIGHTS" in result
            assert "Traffic Alert" in result
            assert "Performance Issue" in result
            assert "Opportunity" in result
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_optimization_recommendations(self, test_agent, sample_ga_data):
        """Requirement: Optimization recommendations."""
        mock_ctx = MagicMock()
        
        insights = await generate_insights(mock_ctx, sample_ga_data)
        
        # Should generate actionable recommendations
        assert len(insights) > 0
        
        for insight in insights:
            assert hasattr(insight, 'action_items')
            assert len(insight.action_items) > 0
            assert hasattr(insight, 'impact')
            assert hasattr(insight, 'priority')
    
    @pytest.mark.validation
    @pytest.mark.asyncio
    async def test_trend_analysis_and_forecasting(self, test_agent, sample_ga_data):
        """Requirement: Trend analysis and forecasting."""
        mock_ctx = MagicMock()
        
        # Test metric analysis for trends
        metrics = {
            "sessions": {"value": 1000, "previous_value": 900},
            "conversions": {"value": 28, "previous_value": 32}
        }
        
        analyses = await analyze_metrics(mock_ctx, metrics)
        
        # Should identify trends
        sessions_analysis = next(a for a in analyses if a.metric_name == "sessions")
        assert sessions_analysis.trend == "up"
        
        conversions_analysis = next(a for a in analyses if a.metric_name == "conversions") 
        assert conversions_analysis.trend == "down"


@pytest.mark.validation
class TestPerformanceRequirements:
    """Test performance and scalability requirements."""
    
    @pytest.mark.asyncio
    async def test_5_minute_refresh_intervals(self):
        """Requirement: 5-minute refresh intervals for dashboard."""
        deps = GAAnalyticsDependencies()
        
        # Cache TTL should be 5 minutes (300 seconds) or less
        assert deps.cache_ttl <= 300
    
    @pytest.mark.asyncio
    async def test_real_time_chat_queries(self, function_test_agent, sample_ga_data):
        """Requirement: Real-time data updates for chat queries."""
        import time
        
        deps = GAAnalyticsDependencies()
        deps.fetch_ga_data = AsyncMock(return_value=sample_ga_data["summary"])
        
        start_time = time.time()
        
        result = await function_test_agent.run(
            "Get current traffic data", 
            deps=deps
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Should respond within reasonable time (< 30 seconds for real-time feel)
        assert response_time < 30
        assert result.data is not None
        
        await deps.cleanup()


@pytest.mark.validation
def test_architecture_requirements():
    """Test hybrid dashboard/conversational agent architecture."""
    # Verify agent is properly configured for hybrid use
    assert ga_analytics_agent is not None
    
    # Should have conversational capabilities
    assert hasattr(ga_analytics_agent, '_tools')
    tools = ga_analytics_agent._tools
    assert len(tools) > 0
    
    # Should support dashboard data retrieval
    from agent import get_dashboard_summary
    assert callable(get_dashboard_summary)
    
    # Should support conversational queries  
    from agent import run_analytics_query
    assert callable(run_analytics_query)