from collections.abc import Mapping
from typing import Any, Protocol
import asyncio

from pymongo import MongoClient

from app.database.indexes import INDEX_SPECS


class DatabaseClient(Protocol):
    async def ping(self) -> bool: ...
    async def close(self) -> None: ...


class MongoDatabase:
    """Small async-friendly lifecycle boundary around PyMongo."""

    def __init__(self, uri: str, database_name: str = "emergency_dispatcher") -> None:
        self.uri = uri
        self.database_name = database_name
        self._client: Any | None = None

    async def connect(self) -> bool:
        if self._client is None:
            self._client = MongoClient(self.uri, serverSelectionTimeoutMS=2000)
        return await self.ping()

    async def ping(self) -> bool:
        if self._client is None:
            return False
        try:
            result = await asyncio.to_thread(self._client.admin.command, "ping")
            return bool(result.get("ok"))
        except Exception:
            return False

    async def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    def collection(self, name: str) -> Any:
        if self._client is None:
            raise RuntimeError("MongoDB client is not connected")
        return self._client[self.database_name][name]

    @staticmethod
    def index_documents() -> tuple[Mapping[str, object], ...]:
        return tuple({"collection": spec.collection, "keys": spec.keys, "unique": spec.unique} for spec in INDEX_SPECS)
