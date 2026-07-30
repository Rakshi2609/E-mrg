from datetime import datetime, timezone

from app.models.incident import IncidentDocument
from app.reporting.export import report_csv
from app.reporting.history import IncidentHistoryService
from app.reporting.models import HistoryQuery, report_from_incident


def incident(**overrides):
    values = {"call_id": "call-1", "incident_type": "fire", "severity": "high", "location": "Main St", "summary": "Smoke reported", "updated_at": datetime.now(timezone.utc)}
    values.update(overrides)
    return IncidentDocument(**values)


def test_report_generation_and_csv_export() -> None:
    report = report_from_incident("incident-1", incident(), datetime.now(timezone.utc))
    exported = report_csv(report)
    assert "incident_id" in exported
    assert "incident-1" in exported
    assert "Smoke reported" in exported


def test_history_filters_by_severity_and_text() -> None:
    records = [incident(), incident(call_id="call-2", severity="low", location="Oak St", summary="Noise complaint")]
    result = IncidentHistoryService().search(records, HistoryQuery(severity="high", text="main"))
    assert len(result) == 1
    assert result[0].call_id == "call-1"
