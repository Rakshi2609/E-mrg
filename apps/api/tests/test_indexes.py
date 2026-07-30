from app.database.indexes import INDEX_SPECS
from app.database.mongodb import MongoDatabase


def test_indexes_cover_active_calls_and_ordered_transcripts() -> None:
    assert any(spec.collection == "calls" and spec.unique for spec in INDEX_SPECS)
    assert any(spec.collection == "transcripts" and spec.keys == (("call_id", 1), ("sequence", 1)) for spec in INDEX_SPECS)


def test_database_exposes_index_documents() -> None:
    documents = MongoDatabase("mongodb://example").index_documents()
    assert len(documents) == len(INDEX_SPECS)
