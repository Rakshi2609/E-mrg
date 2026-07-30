from dataclasses import dataclass, field

from app.conversation.models import ConversationState


@dataclass
class VoiceSession:
    call_sid: str
    transcript: list[str] = field(default_factory=list)
    state: ConversationState = field(default_factory=ConversationState)


class VoiceSessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, VoiceSession] = {}

    def get(self, call_sid: str) -> VoiceSession:
        return self._sessions.setdefault(call_sid, VoiceSession(call_sid=call_sid))

    def append(self, call_sid: str, text: str) -> VoiceSession:
        session = self.get(call_sid)
        session.transcript.append(text)
        session.transcript = session.transcript[-12:]
        return session
