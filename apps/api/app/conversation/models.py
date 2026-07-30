from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CallState = Literal["greeting", "incident_collection", "location_collection", "clarification", "triage", "dispatcher_handoff", "completed", "abandoned"]
Severity = Literal["unknown", "low", "moderate", "high", "critical"]


class ConversationState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    state: CallState = "greeting"
    known_fields: dict[str, str | int | list[str] | None] = Field(default_factory=dict)
    missing_fields: list[str] = Field(default_factory=lambda: ["location", "incident_type"])


class AiResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reply: str = Field(min_length=1)
    incident_type: str | None = None
    severity: Severity = "unknown"
    location: str | None = None
    victims: int | None = Field(default=None, ge=0)
    hazards: list[str] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)
