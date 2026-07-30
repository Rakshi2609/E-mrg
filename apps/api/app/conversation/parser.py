import json
from typing import Any

from pydantic import ValidationError

from app.conversation.models import AiResponse


class StructuredResponseParser:
    def parse(self, raw: str) -> AiResponse:
        try:
            payload: Any = json.loads(raw)
            return AiResponse.model_validate(payload)
        except (json.JSONDecodeError, ValidationError) as exc:
            raise ValueError("AI response failed structured validation") from exc
