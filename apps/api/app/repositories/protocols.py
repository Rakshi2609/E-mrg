from typing import Protocol, TypeVar

from app.models.call import CallDocument

DocumentT = TypeVar("DocumentT")


class CallRepositoryProtocol(Protocol):
    async def create(self, document: CallDocument) -> CallDocument: ...
    async def get_by_sid(self, call_sid: str) -> CallDocument | None: ...
