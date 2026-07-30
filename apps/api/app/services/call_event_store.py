import asyncio
import logging
from typing import Any

from app.database.mongodb import MongoDatabase
from app.realtime.bus import EventBus
from app.realtime.models import EventEnvelope

logger = logging.getLogger(__name__)


class CallEventStore:
    """Persist dispatcher events and project them into call-facing MongoDB collections."""

    def __init__(self, database: MongoDatabase, bus: EventBus) -> None:
        self._database = database
        self._bus = bus

    async def publish(self, event: EventEnvelope) -> EventEnvelope:
        sequenced = await self._bus.publish(event)
        try:
            await self.record(sequenced)
        except RuntimeError:
            logger.warning("MongoDB unavailable; realtime event was not persisted", extra={"event_id": sequenced.event_id})
        return sequenced

    async def record(self, event: EventEnvelope) -> None:
        event_document = event.model_dump(mode="json")
        await asyncio.to_thread(self._database.collection("dispatcher_events").insert_one, event_document)
        if event.event == "call.started":
            await self._upsert_call(event)
        elif event.event == "transcript.updated":
            await self._store_transcript(event)
        elif event.event == "incident.updated":
            await self._upsert_incident(event)
        elif event.event == "cctv.analysis.completed":
            await self._store_cctv_analysis(event)
        elif event.event == "call.ended":
            await self._complete_call(event)

    async def _upsert_call(self, event: EventEnvelope) -> None:
        payload = event.payload
        fields: dict[str, Any] = {
            "call_sid": event.call_id,
            "status": "active",
            "updated_at": event.occurred_at,
        }
        if isinstance(payload.get("caller_number"), str):
            fields["caller_number"] = payload["caller_number"]
        await asyncio.to_thread(
            self._database.collection("calls").update_one,
            {"call_sid": event.call_id},
            {"$set": fields, "$setOnInsert": {"started_at": event.occurred_at}},
            upsert=True,
        )

    async def _store_transcript(self, event: EventEnvelope) -> None:
        await asyncio.to_thread(
            self._database.collection("transcripts").insert_one,
            {"call_id": event.call_id, "sequence": event.sequence, "occurred_at": event.occurred_at, **event.payload},
        )

    async def _upsert_incident(self, event: EventEnvelope) -> None:
        fields = {**event.payload, "call_id": event.call_id, "updated_at": event.occurred_at}
        await asyncio.to_thread(
            self._database.collection("incidents").update_one,
            {"call_id": event.call_id},
            {"$set": fields, "$setOnInsert": {"dispatcher_status": "unreviewed"}},
            upsert=True,
        )

    async def _complete_call(self, event: EventEnvelope) -> None:
        await asyncio.to_thread(
            self._database.collection("calls").update_one,
            {"call_sid": event.call_id},
            {"$set": {"status": "completed", "ended_at": event.occurred_at, "updated_at": event.occurred_at}},
            upsert=False,
        )

    async def _store_cctv_analysis(self, event: EventEnvelope) -> None:
        analysis = {**event.payload, "call_id": event.call_id, "event_id": event.event_id, "occurred_at": event.occurred_at}
        await asyncio.to_thread(self._database.collection("cctv_analyses").insert_one, analysis)
        await asyncio.to_thread(
            self._database.collection("incidents").update_one,
            {"call_id": event.call_id},
            {"$push": {"cctv_analyses": analysis}, "$set": {"updated_at": event.occurred_at}},
            upsert=True,
        )
