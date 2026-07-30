from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Severity = Literal["unknown", "low", "moderate", "high", "critical"]


class IncidentDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    call_id: str = Field(min_length=1)
    incident_type: str | None = None
    severity: Severity = "unknown"
    location: str | None = None
    victims: int | None = Field(default=None, ge=0)
    hazards: list[str] = Field(default_factory=list)
    ai_confidence: float | None = Field(default=None, ge=0, le=1)
    dispatcher_status: Literal["unreviewed", "reviewing", "resolved"] = "unreviewed"
    summary: str | None = None
    updated_at: datetime
