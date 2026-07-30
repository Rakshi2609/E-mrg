import asyncio

from app.realtime.bus import EventBus
from app.realtime.models import EventEnvelope


def test_event_bus_assigns_monotonic_sequences() -> None:
    async def run() -> list[int]:
        bus = EventBus()
        queue = bus.subscribe()
        await bus.publish(EventEnvelope(call_id="call-1", event="call.started", payload={}))
        await bus.publish(EventEnvelope(call_id="call-1", event="ai.status", payload={"status": "running"}))
        first = await queue.get()
        second = await queue.get()
        return [first.sequence, second.sequence]

    assert asyncio.run(run()) == [1, 2]


def test_event_envelope_rejects_negative_sequence() -> None:
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        EventEnvelope(call_id="call-1", event="call.started", sequence=-1, payload={})
