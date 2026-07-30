from collections.abc import AsyncIterator, Sequence
from datetime import datetime, timezone
from typing import Protocol

from app.stt.models import TranscriptSegment


class StreamingSttProvider(Protocol):
    async def stream(self, call_id: str, audio: AsyncIterator[bytes]) -> AsyncIterator[TranscriptSegment]: ...


class MockSttProvider:
    """Deterministic provider for tests and local development."""

    def __init__(self, transcripts: Sequence[str]) -> None:
        self.transcripts = tuple(transcripts)

    async def stream(self, call_id: str, audio: AsyncIterator[bytes]) -> AsyncIterator[TranscriptSegment]:
        sequence = 0
        async for _ in audio:
            if sequence >= len(self.transcripts):
                break
            yield TranscriptSegment(
                call_id=call_id,
                sequence=sequence,
                text=self.transcripts[sequence],
                confidence=1.0,
                is_final=True,
                occurred_at=datetime.now(timezone.utc),
            )
            sequence += 1
