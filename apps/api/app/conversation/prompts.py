import json

from app.conversation.models import ConversationState


class PromptBuilder:
    def build(self, transcript: list[str], state: ConversationState) -> str:
        context = {"transcript": transcript[-12:], "state": state.state, "known_fields": state.known_fields, "missing_fields": state.missing_fields}
        instruction = "You are a calm emergency intake assistant. Ask one important question at a time. Never invent facts. Return only validated JSON with reply, incident_type, severity, location, victims, hazards, missing_fields, and confidence."
        return instruction + "\nContext:\n" + json.dumps(context, ensure_ascii=True)
