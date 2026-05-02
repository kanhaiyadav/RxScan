from typing import Any

from app.core.errors import NotFoundError
from app.data.mappers import appwrite_shape
from app.data.repositories.prescriptions import PrescriptionRepository


class PrescriptionService:
    def __init__(self, repository: PrescriptionRepository | None = None) -> None:
        self.repository = repository or PrescriptionRepository()

    async def create(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = {
            "ocr_result": payload["ocr_result"],
            "search_result": payload.get("search_result", {}),
            "image": payload["image"],
            "object_key": payload["object_key"],
            "status": payload.get("status", "active"),
        }
        document = await self.repository.create(user_id, normalized)
        return self._shape(document)

    async def list(self, user_id: str) -> list[dict[str, Any]]:
        return [self._shape(document) for document in await self.repository.list_by_user_id(user_id)]

    async def update_status(self, prescription_id: str, user_id: str, status: str) -> dict[str, Any]:
        document = await self.repository.update_status(prescription_id, user_id, status)
        if not document:
            raise NotFoundError("Prescription not found")
        return self._shape(document)

    async def delete(self, prescription_id: str, user_id: str) -> dict[str, Any]:
        document = await self.repository.delete_owned(prescription_id, user_id)
        if not document:
            raise NotFoundError("Prescription not found")
        return self._shape(document)

    @staticmethod
    def _shape(document: dict[str, Any]) -> dict[str, Any]:
        shaped = appwrite_shape(document)
        shaped["userId"] = shaped.pop("user_id")
        shaped["ocrResult"] = shaped.pop("ocr_result", {})
        shaped["searchResult"] = shaped.pop("search_result", {})
        return shaped
