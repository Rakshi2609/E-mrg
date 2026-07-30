from collections.abc import AsyncIterator, Awaitable, Callable

from app.stt.models import TranscriptSegment
from app.stt.providers import StreamingSttProvider

SegmentHandler = Callable[[TranscriptSegment], Awaitable[None]]


class TranscriptPipeline:
    def __init__(self, provider: StreamingSttProvider, handler: SegmentHandler) -> None:
        self.provider = provider
        self.handler = handler

    async def run(self, call_id: str, audio: AsyncIterator[bytes]) -> int:
        count = 0
        async for segment in self.provider.stream(call_id, audio):
            await self.handler(segment)
            count += 1
        return count
