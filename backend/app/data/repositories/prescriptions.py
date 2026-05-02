from typing import Any

from pymongo import ReturnDocument

from app.data.database import get_database
from app.data.mappers import now_utc, object_id, serialize_document


class PrescriptionRepository:
    @property
    def collection(self):
        return get_database().prescriptions

    async def create(self, user_id: str, data: dict[str, Any]) -> dict[str, Any]:
        now = now_utc()
        document = {
            **data,
            "user_id": user_id,
            "status": data.get("status", "active"),
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return serialize_document(document) or {}

    async def list_by_user_id(self, user_id: str) -> list[dict[str, Any]]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        return [serialize_document(document) or {} async for document in cursor]

    async def get_owned(self, prescription_id: str, user_id: str) -> dict[str, Any] | None:
        return serialize_document(
            await self.collection.find_one({"_id": object_id(prescription_id), "user_id": user_id})
        )

    async def update_status(
        self,
        prescription_id: str,
        user_id: str,
        status: str,
    ) -> dict[str, Any] | None:
        document = await self.collection.find_one_and_update(
            {"_id": object_id(prescription_id), "user_id": user_id},
            {"$set": {"status": status, "updated_at": now_utc()}},
            return_document=ReturnDocument.AFTER,
        )
        return serialize_document(document)

    async def delete_owned(self, prescription_id: str, user_id: str) -> dict[str, Any] | None:
        document = await self.collection.find_one_and_delete(
            {"_id": object_id(prescription_id), "user_id": user_id}
        )
        return serialize_document(document)
