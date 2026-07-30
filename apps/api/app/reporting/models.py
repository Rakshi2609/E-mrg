from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.incident import IncidentDocument


class IncidentReport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    incident_id: str = Field(min_length=1)
    generated_at: datetime
    summary: str
    severity: str
    location: str | None
    incident_type: str | None
    victims: int | None


class HistoryQuery(BaseModel):
    severity: str | None = None
    dispatcher_status: str | None = None
    text: str | None = None


def report_from_incident(incident_id: str, incident: IncidentDocument, generated_at: datetime) -> IncidentReport:
    return IncidentReport(incident_id=incident_id, generated_at=generated_at, summary=incident.summary or "No summary available", severity=incident.severity, location=incident.location, incident_type=incident.incident_type, victims=incident.victims)
