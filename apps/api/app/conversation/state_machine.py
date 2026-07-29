from app.conversation.models import CallState, ConversationState

_REQUIRED = ("location", "incident_type", "victims", "hazards")


class ConversationStateMachine:
    def advance(self, state: ConversationState, response_missing: list[str]) -> ConversationState:
        missing = list(dict.fromkeys(response_missing))
        if state.state == "greeting":
            next_state: CallState = "incident_collection"
        elif state.state == "incident_collection" and "location" in missing:
            next_state = "location_collection"
        elif state.state in {"incident_collection", "location_collection", "clarification"} and missing:
            next_state = "clarification"
        elif state.state in {"location_collection", "clarification"} and not missing:
            next_state = "triage"
        elif state.state == "triage":
            next_state = "dispatcher_handoff"
        else:
            next_state = state.state
        return state.model_copy(update={"state": next_state, "missing_fields": missing})

    @staticmethod
    def initial() -> ConversationState:
        return ConversationState()
