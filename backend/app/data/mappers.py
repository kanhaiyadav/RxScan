from datetime import UTC, datetime
from typing import Any

from bson import ObjectId


def now_utc() -> datetime:
    return datetime.now(UTC)


def object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid object id")
    return ObjectId(value)


def serialize_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None

    serialized = dict(document)
    if "_id" in serialized:
        serialized["id"] = str(serialized.pop("_id"))

    for key, value in list(serialized.items()):
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()

    return serialized


def appwrite_shape(document: dict[str, Any]) -> dict[str, Any]:
    shaped = dict(document)
    document_id = shaped.pop("id", None)
    if document_id:
        shaped["$id"] = document_id
    if "created_at" in shaped:
        shaped["$createdAt"] = shaped["created_at"]
        shaped["createdAt"] = shaped["created_at"]
    if "updated_at" in shaped:
        shaped["$updatedAt"] = shaped["updated_at"]
        shaped["updatedAt"] = shaped["updated_at"]
    return shaped
