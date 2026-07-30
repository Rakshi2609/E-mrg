from typing import Protocol


class LlmProvider(Protocol):
    async def respond(self, prompt: str) -> str: ...
