from dataclasses import dataclass


@dataclass(frozen=True)
class IndexSpec:
    collection: str
    keys: tuple[tuple[str, int], ...]
    unique: bool = False


INDEX_SPECS = (
    IndexSpec("calls", (("call_sid", 1),), unique=True),
    IndexSpec("calls", (("status", 1), ("updated_at", -1))),
    IndexSpec("incidents", (("dispatcher_status", 1), ("updated_at", -1))),
    IndexSpec("incidents", (("severity", 1), ("updated_at", -1))),
    IndexSpec("transcripts", (("call_id", 1), ("sequence", 1)), unique=True),
)
