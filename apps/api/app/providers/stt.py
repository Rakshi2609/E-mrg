from typing import Protocol


class SttProvider(Protocol):
    async def transcribe(self, audio: bytes) -> str: ...
