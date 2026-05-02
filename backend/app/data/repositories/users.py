from typing import Any

from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.data.database import get_database
from app.data.mappers import now_utc, object_id, serialize_document


class UserRepository:
    @property
    def collection(self):
        return get_database().users

    async def create(self, email: str, password_hash: str, name: str | None) -> dict[str, Any]:
        now = now_utc()
        document = {
            "email": email.lower(),
            "password_hash": password_hash,
            "name": name or "",
            "email_verification": False,
            "registration": now,
            "created_at": now,
            "updated_at": now,
        }
        try:
            result = await self.collection.insert_one(document)
        except DuplicateKeyError as exc:
            raise ValueError("Email is already registered") from exc
        document["_id"] = result.inserted_id
        return serialize_document(document) or {}

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        return serialize_document(await self.collection.find_one({"email": email.lower()}))

    async def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        return serialize_document(await self.collection.find_one({"_id": object_id(user_id)}))

    async def update_profile_fields(self, user_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
        data["updated_at"] = now_utc()
        document = await self.collection.find_one_and_update(
            {"_id": object_id(user_id)},
            {"$set": data},
            return_document=ReturnDocument.AFTER,
        )
        return serialize_document(document)
