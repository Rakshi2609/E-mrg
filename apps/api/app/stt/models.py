from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class TranscriptSegment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    call_id: str = Field(min_length=1)
    sequence: int = Field(ge=0)
    text: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    is_final: bool
    occurred_at: datetime
