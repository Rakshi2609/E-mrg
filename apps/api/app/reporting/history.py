from collections.abc import Iterable

from app.models.incident import IncidentDocument
from app.reporting.models import HistoryQuery


class IncidentHistoryService:
    def search(self, incidents: Iterable[IncidentDocument], query: HistoryQuery) -> list[IncidentDocument]:
        result = list(incidents)
        if query.severity:
            result = [item for item in result if item.severity == query.severity]
        if query.dispatcher_status:
            result = [item for item in result if item.dispatcher_status == query.dispatcher_status]
        if query.text:
            needle = query.text.casefold()
            result = [item for item in result if needle in (item.summary or "").casefold() or needle in (item.location or "").casefold()]
        return result
