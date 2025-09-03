"""LLM provider configuration for GA Analytics Agent."""

from pydantic_ai.models.openai import OpenAIModel
from .settings import settings


def get_llm_model() -> OpenAIModel:
    """
    Configure and return OpenAI model for GA analytics tasks.
    
    Returns:
        OpenAIModel configured with GPT-4 Turbo for analytics
    """
    return OpenAIModel(settings.llm_model)


def get_fallback_model() -> OpenAIModel:
    """
    Get fallback model for error recovery.
    For MVP, we use the same model as primary.
    
    Returns:
        OpenAIModel fallback instance
    """
    return get_llm_model()  # Same model for simplicity in MVP