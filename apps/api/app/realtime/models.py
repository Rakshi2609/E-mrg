from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

EventName = Literal["call.started", "transcript.updated", "incident.updated", "ai.status", "dispatcher.joined", "dispatcher.left", "call.ended", "system.error"]


class EventEnvelope(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal[1] = 1
    event_id: str = Field(default_factory=lambda: str(uuid4()))
    sequence: int = Field(default=0, ge=0)
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    call_id: str = Field(min_length=1)
    event: EventName
    payload: dict[str, Any]
