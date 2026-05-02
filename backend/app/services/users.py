from typing import Any

from app.data.mappers import appwrite_shape
from app.data.repositories.user_profiles import UserProfileRepository


class UserProfileService:
    def __init__(self, repository: UserProfileRepository | None = None) -> None:
        self.repository = repository or UserProfileRepository()

    async def upsert_profile(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        document = await self.repository.upsert(user_id, payload)
        return self._shape(document)

    async def get_profile(self, user_id: str) -> dict[str, Any] | None:
        document = await self.repository.get_by_user_id(user_id)
        return self._shape(document) if document else None

    @staticmethod
    def _shape(document: dict[str, Any]) -> dict[str, Any]:
        shaped = appwrite_shape(document)
        shaped["userId"] = shaped.pop("user_id")
        return shaped
