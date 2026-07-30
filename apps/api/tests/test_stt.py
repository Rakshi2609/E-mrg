import asyncio

from app.stt.pipeline import TranscriptPipeline
from app.stt.providers import MockSttProvider


def audio_chunks():
    async def source():
        yield b"one"
        yield b"two"
    return source()


def test_mock_provider_emits_ordered_transcripts() -> None:
    received = []

    async def collect(segment):
        received.append(segment)

    count = asyncio.run(TranscriptPipeline(MockSttProvider(["where", "are you"]), collect).run("call-1", audio_chunks()))
    assert count == 2
    assert [item.sequence for item in received] == [0, 1]
    assert [item.text for item in received] == ["where", "are you"]


def test_pipeline_handles_empty_audio_without_segments() -> None:
    async def empty():
        if False:
            yield b""

    async def collect(segment):
        raise AssertionError("handler should not run")

    count = asyncio.run(TranscriptPipeline(MockSttProvider(["unused"]), collect).run("call-1", empty()))
    assert count == 0
