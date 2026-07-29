import json

from app.conversation.models import ConversationState


class PromptBuilder:
    def build(self, transcript: list[str], state: ConversationState) -> str:
        context = {"transcript": transcript[-12:], "state": state.state, "known_fields": state.known_fields, "missing_fields": state.missing_fields}
        instruction = "You are a calm emergency intake assistant. Ask one important question at a time. Never invent facts. Return only JSON with reply, incident_type, severity, location, victims, hazards, missing_fields, and confidence. Severity must be exactly one of: unknown, low, moderate, high, critical. Victims must be an integer or null. Hazards and missing_fields must be JSON arrays of strings. Confidence must be a number from 0 to 1. Do not use Markdown fences."
        return instruction + "\nContext:\n" + json.dumps(context, ensure_ascii=True)
