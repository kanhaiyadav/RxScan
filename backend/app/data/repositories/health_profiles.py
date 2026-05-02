from typing import Any

from pymongo import ReturnDocument

from app.data.database import get_database
from app.data.mappers import now_utc, serialize_document


class HealthProfileRepository:
    @property
    def collection(self):
        return get_database().health_profiles

    async def upsert(self, user_id: str, data: dict[str, Any]) -> dict[str, Any]:
        now = now_utc()
        payload = {**data, "user_id": user_id, "updated_at": now}
        document = await self.collection.find_one_and_update(
            {"user_id": user_id},
            {
                "$set": payload,
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return serialize_document(document) or {}

    async def get_by_user_id(self, user_id: str) -> dict[str, Any] | None:
        return serialize_document(await self.collection.find_one({"user_id": user_id}))

    async def delete_by_user_id(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0
