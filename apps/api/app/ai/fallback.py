import asyncio
import logging
import httpx
from typing import Protocol

logger = logging.getLogger(__name__)


class ResponseProvider(Protocol):
    async def respond(self, prompt: str) -> str: ...


class TimeoutFallbackProvider:
    """Use a cloud provider only when local inference misses its configured deadline."""

    def __init__(self, primary: ResponseProvider, fallback: ResponseProvider | None, timeout_seconds: float) -> None:
        self.primary = primary
        self.fallback = fallback
        self.timeout_seconds = timeout_seconds
        self.last_provider = "ollama"

    async def respond(self, prompt: str) -> str:
        try:
            self.last_provider = "ollama"
            return await asyncio.wait_for(self.primary.respond(prompt), timeout=self.timeout_seconds)
        except (TimeoutError, OSError, ValueError, httpx.HTTPError) as exc:
            if self.fallback is None:
                raise
            self.last_provider = "mistral-cloud"
            logger.warning("Ollama failed or timed out; using Mistral Cloud fallback", extra={"reason": type(exc).__name__})
            return await self.fallback.respond(prompt)
