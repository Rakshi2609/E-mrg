from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models.call import CallDocument
from app.models.incident import IncidentDocument
from app.models.transcript import TranscriptDocument


def test_call_document_requires_sid_and_timestamps() -> None:
    document = CallDocument(call_sid="CA-1", started_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    assert document.status == "active"


def test_incident_rejects_invalid_confidence() -> None:
    with pytest.raises(ValidationError):
        IncidentDocument(call_id="call-1", ai_confidence=2, updated_at=datetime.now(timezone.utc))


def test_transcript_rejects_negative_sequence() -> None:
    with pytest.raises(ValidationError):
        TranscriptDocument(call_id="call-1", sequence=-1, speaker="caller", message="hello", timestamp=datetime.now(timezone.utc))
