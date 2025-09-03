"""GA Analytics Agent Test Suite.

This test suite provides comprehensive validation for the GA Analytics Dashboard Agent,
including unit tests, integration tests, and validation against INITIAL.md requirements.

Test Categories:
- Unit Tests: Individual component validation
- Integration Tests: End-to-end workflow testing  
- Validation Tests: Requirements compliance verification
- Tool Tests: GA data fetching and analysis validation

Usage:
    pytest tests/                    # Run all tests
    pytest tests/test_agent.py       # Run agent tests
    pytest tests/test_validation.py  # Run requirement validation
    pytest -m unit                   # Run only unit tests
    pytest -m integration            # Run only integration tests
    pytest -m validation             # Run only validation tests
"""

__version__ = "1.0.0"
__author__ = "pydantic-ai-validator"