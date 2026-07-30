from app.conversation.models import AiResponse

_FORBIDDEN_CLAIMS = ("help has been dispatched", "responders are on the way", "ambulance is coming")


class SafetyViolation(ValueError):
    pass


def validate_response(response: AiResponse) -> AiResponse:
    lowered = response.reply.casefold()
    if any(claim in lowered for claim in _FORBIDDEN_CLAIMS):
        raise SafetyViolation("AI must not claim that responders have been dispatched")
    if response.severity == "critical" and response.confidence < 0.5:
        raise SafetyViolation("Critical response requires dispatcher intervention")
    return response
