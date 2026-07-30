import asyncio

import httpx
import pytest

from app.ai.ollama import OllamaProvider
from app.ai.orchestrator import AiOrchestrator
from app.ai.safety import SafetyViolation
from app.conversation.models import ConversationState


def test_ollama_provider_posts_structured_request() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/generate"
        return httpx.Response(200, json={"response": '{"reply":"Where are you?","confidence":0.8}'})

    async def run() -> str:
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        provider = OllamaProvider("http://ollama", "gemma3", client)
        result = await provider.respond("prompt")
        await provider.close()
        return result

    assert asyncio.run(run()).startswith("{")


def test_orchestrator_rejects_dispatch_claim() -> None:
    class Provider:
        async def respond(self, prompt: str) -> str:
            return '{"reply":"Help has been dispatched.","confidence":0.9}'

    with pytest.raises(SafetyViolation):
        asyncio.run(AiOrchestrator(Provider()).respond([], ConversationState()))


def test_orchestrator_returns_validated_response() -> None:
    class Provider:
        async def respond(self, prompt: str) -> str:
            return '{"reply":"Tell me your location.","missing_fields":["location"],"confidence":0.8}'

    result = asyncio.run(AiOrchestrator(Provider()).respond([], ConversationState()))
    assert result.reply == "Tell me your location."
