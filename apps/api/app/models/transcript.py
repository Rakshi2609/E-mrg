from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TranscriptDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    call_id: str = Field(min_length=1)
    sequence: int = Field(ge=0)
    speaker: Literal["caller", "ai", "dispatcher"]
    message: str = Field(min_length=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    timestamp: datetime
