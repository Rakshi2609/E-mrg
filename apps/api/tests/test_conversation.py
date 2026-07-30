import pytest

from app.conversation.confidence import score_response
from app.conversation.models import AiResponse
from app.conversation.parser import StructuredResponseParser
from app.conversation.prompts import PromptBuilder
from app.conversation.state_machine import ConversationStateMachine


def response(**overrides):
    values = {"reply": "Tell me where you are.", "location": None, "incident_type": "fire", "severity": "high", "victims": None, "hazards": [], "missing_fields": ["location"], "confidence": 0.9}
    values.update(overrides)
    return AiResponse(**values)


def test_state_machine_prioritizes_location() -> None:
    machine = ConversationStateMachine()
    state = machine.advance(machine.initial().model_copy(update={"state": "incident_collection"}), ["location"])
    assert state.state == "location_collection"


def test_parser_rejects_invalid_json() -> None:
    with pytest.raises(ValueError):
        StructuredResponseParser().parse("not-json")


def test_confidence_is_capped_by_missing_fields() -> None:
    assert score_response(response()) == 0.25


def test_prompt_contains_bounded_context_and_missing_fields() -> None:
    prompt = PromptBuilder().build(["a"] * 20, ConversationStateMachine.initial())
    assert prompt.count('"a"') == 12
    assert "missing_fields" in prompt
