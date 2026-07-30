from app.conversation.models import AiResponse


def score_response(response: AiResponse) -> float:
    """Score extracted completeness; model confidence is never increased."""
    total = 4
    present = sum(value is not None and value != [] for value in (response.incident_type, response.location, response.victims, response.hazards))
    completeness = present / total
    return min(response.confidence, completeness if response.missing_fields else response.confidence)
