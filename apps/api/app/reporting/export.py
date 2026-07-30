import csv
import io

from app.reporting.models import IncidentReport


def report_csv(report: IncidentReport) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["incident_id", "generated_at", "summary", "severity", "location", "incident_type", "victims"])
    writer.writeheader()
    writer.writerow(report.model_dump(mode="json"))
    return output.getvalue()
