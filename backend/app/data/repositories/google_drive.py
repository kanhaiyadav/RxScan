from datetime import datetime
from typing import Any

from pymongo import ReturnDocument

from app.data.database import get_database
from app.data.mappers import now_utc, serialize_document


class GoogleDriveTokenRepository:
    @property
    def collection(self):
        return get_database().google_drive_tokens

    async def upsert(self, user_id: str, token_payload: dict[str, Any]) -> dict[str, Any]:
        now = now_utc()
        document = await self.collection.find_one_and_update(
            {"user_id": user_id},
            {
                "$set": {**token_payload, "updated_at": now},
                "$setOnInsert": {"user_id": user_id, "created_at": now},
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


class OAuthStateRepository:
    @property
    def collection(self):
        return get_database().oauth_states

    async def create(self, state: str, user_id: str, expires_at: datetime) -> None:
        await self.collection.insert_one(
            {
                "state": state,
                "user_id": user_id,
                "expires_at": expires_at,
                "created_at": now_utc(),
            }
        )

    async def pop(self, state: str) -> dict[str, Any] | None:
        return serialize_document(await self.collection.find_one_and_delete({"state": state}))
