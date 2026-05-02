from typing import Any

from app.core.errors import NotFoundError
from app.data.mappers import appwrite_shape
from app.data.repositories.health_profiles import HealthProfileRepository


class HealthProfileService:
    def __init__(self, repository: HealthProfileRepository | None = None) -> None:
        self.repository = repository or HealthProfileRepository()

    async def upsert(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        document = await self.repository.upsert(user_id, payload)
        return self._shape(document)

    async def get(self, user_id: str) -> dict[str, Any] | None:
        document = await self.repository.get_by_user_id(user_id)
        return self._shape(document) if document else None

    async def delete(self, user_id: str) -> bool:
        deleted = await self.repository.delete_by_user_id(user_id)
        if not deleted:
            raise NotFoundError("Health profile not found")
        return True

    @staticmethod
    def _shape(document: dict[str, Any]) -> dict[str, Any]:
        shaped = appwrite_shape(document)
        shaped["userId"] = shaped.pop("user_id")
        if "medical_conditions" in shaped:
            shaped["medicalConditions"] = shaped.pop("medical_conditions")
        if "current_medications" in shaped:
            shaped["currentMedications"] = shaped.pop("current_medications")
        if "dietary_restrictions" in shaped:
            shaped["dietaryRestrictions"] = shaped.pop("dietary_restrictions")
        if "emergency_contacts" in shaped:
            shaped["emergencyContacts"] = shaped.pop("emergency_contacts")
        if "blood_type" in shaped:
            shaped["bloodType"] = shaped.pop("blood_type")
        if "date_of_birth" in shaped:
            shaped["dateOfBirth"] = shaped.pop("date_of_birth")
        if "additional_notes" in shaped:
            shaped["additionalNotes"] = shaped.pop("additional_notes")
        if "profile_image_id" in shaped:
            shaped["profileImageId"] = shaped.pop("profile_image_id")
        return shaped
