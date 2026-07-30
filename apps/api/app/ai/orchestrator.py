from collections.abc import Sequence

from app.ai.safety import validate_response
from app.conversation.models import AiResponse, ConversationState
from app.conversation.parser import StructuredResponseParser
from app.conversation.prompts import PromptBuilder


class AiOrchestrator:
    def __init__(self, provider, prompt_builder: PromptBuilder | None = None, parser: StructuredResponseParser | None = None) -> None:  # type: ignore[no-untyped-def]
        self.provider = provider
        self.prompt_builder = prompt_builder or PromptBuilder()
        self.parser = parser or StructuredResponseParser()

    async def respond(self, transcript: Sequence[str], state: ConversationState) -> AiResponse:
        prompt = self.prompt_builder.build(list(transcript), state)
        raw = await self.provider.respond(prompt)
        return validate_response(self.parser.parse(raw))
