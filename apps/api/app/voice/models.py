from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CallLifecycleEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    call_sid: str = Field(min_length=1)
    call_status: Literal["queued", "ringing", "in-progress", "completed", "busy", "failed", "no-answer"]
    occurred_at: datetime
