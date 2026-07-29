from collections.abc import Mapping
from typing import Any, Protocol

from app.database.indexes import INDEX_SPECS, IndexSpec


class DatabaseClient(Protocol):
    async def ping(self) -> bool: ...
    async def close(self) -> None: ...


class MongoDatabase:
    """Lifecycle boundary for MongoDB; connection wiring is injected later."""

    def __init__(self, uri: str, database_name: str = "emergency_dispatcher") -> None:
        self.uri = uri
        self.database_name = database_name
        self._client: Any | None = None

    async def ping(self) -> bool:
        return self._client is not None and bool(await self._client.admin.command("ping"))

    async def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    @staticmethod
    def index_documents() -> tuple[Mapping[str, object], ...]:
        return tuple({"collection": spec.collection, "keys": spec.keys, "unique": spec.unique} for spec in INDEX_SPECS)
