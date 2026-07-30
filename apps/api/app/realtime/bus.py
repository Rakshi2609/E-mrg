import asyncio

from app.realtime.models import EventEnvelope


class EventBus:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[EventEnvelope]] = set()
        self._sequence = 0

    def subscribe(self) -> asyncio.Queue[EventEnvelope]:
        queue: asyncio.Queue[EventEnvelope] = asyncio.Queue()
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[EventEnvelope]) -> None:
        self._subscribers.discard(queue)

    async def publish(self, event: EventEnvelope) -> EventEnvelope:
        self._sequence += 1
        sequenced = event.model_copy(update={"sequence": self._sequence})
        for queue in tuple(self._subscribers):
            await queue.put(sequenced)
        return sequenced
