from fastapi import APIRouter, Depends, File, UploadFile

from app.core.errors import AppError
from app.services.google_drive import GoogleDriveService
from app.services.prescriptions import PrescriptionService
from app.web.dependencies import current_user_id
from app.web.schemas.common import MessageResponse
from app.web.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
    PrescriptionStatusUpdate,
    UploadResponse,
)

router = APIRouter()


@router.get("/prescriptions", response_model=list[PrescriptionResponse])
async def list_prescriptions(user_id: str = Depends(current_user_id)) -> list[dict]:
    return await PrescriptionService().list(user_id)


@router.post("/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(
    payload: PrescriptionCreate,
    user_id: str = Depends(current_user_id),
) -> dict:
    return await PrescriptionService().create(
        user_id,
        payload.model_dump(by_alias=False),
    )


@router.patch("/prescriptions/{prescription_id}/status", response_model=PrescriptionResponse)
async def update_prescription_status(
    prescription_id: str,
    payload: PrescriptionStatusUpdate,
    user_id: str = Depends(current_user_id),
) -> dict:
    return await PrescriptionService().update_status(prescription_id, user_id, payload.status)


@router.delete("/prescriptions/{prescription_id}", response_model=MessageResponse)
async def delete_prescription(
    prescription_id: str,
    user_id: str = Depends(current_user_id),
) -> MessageResponse:
    await PrescriptionService().delete(prescription_id, user_id)
    return MessageResponse(message="Prescription deleted")


@router.post("/prescriptions/upload", response_model=UploadResponse)
@router.post("/prescription/upload", response_model=UploadResponse)
async def upload_prescription_file(
    file: UploadFile = File(...),
    user_id: str = Depends(current_user_id),
) -> dict:
    content_type = file.content_type or "application/octet-stream"
    if not content_type.startswith("image/"):
        raise AppError("Only image files are allowed")

    content = await file.read()
    if not content:
        raise AppError("No file uploaded")

    data = await GoogleDriveService().upload_prescription(
        user_id=user_id,
        file_name=file.filename or "prescription.jpg",
        content_type=content_type,
        content=content,
    )
    return {"success": True, "data": data}


@router.delete("/drive/files/{file_id}", response_model=MessageResponse)
async def delete_drive_file(
    file_id: str,
    user_id: str = Depends(current_user_id),
) -> MessageResponse:
    await GoogleDriveService().delete_file(user_id, file_id)
    return MessageResponse(message="File deleted")
