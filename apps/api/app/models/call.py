from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CallStatus = Literal["active", "completed", "abandoned"]


class CallDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    call_sid: str = Field(min_length=1)
    caller_number: str | None = None
    status: CallStatus = "active"
    started_at: datetime
    ended_at: datetime | None = None
    incident_id: str | None = None
    updated_at: datetime
