from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

PrescriptionStatus = Literal["active", "inactive", "abandoned", "completed"]


class MedicineInput(BaseModel):
    dosage: str | None = None
    duration: str = ""
    frequency: str = ""
    instructions: str = ""
    name: str = Field(min_length=1, max_length=180)
    quantity: int | float | None = None
    uncertain: bool = False


class Doctor(BaseModel):
    name: str | None = None
    qualifications: str | None = None
    registration_number: str | None = None
    clinic_name: str | None = None
    address: str | None = None
    phone: str | None = None


class Patient(BaseModel):
    name: str | None = None
    age: str | None = None
    gender: str | None = None
    address: str | None = None
    prescription_date: str | None = None


class AdditionalNotes(BaseModel):
    special_instructions: str | None = None
    follow_up: str | None = None
    warnings: str | None = None


class PrescriptionData(BaseModel):
    doctor: Doctor | None = None
    patient: Patient | None = None
    medications: list[MedicineInput] = Field(default_factory=list)
    additional_notes: AdditionalNotes | None = None
    extraction_notes: str | None = None
    raw_response: str | None = None
    note: str | None = None


class PrescriptionCreate(BaseModel):
    ocr_result: PrescriptionData | dict[str, Any] = Field(alias="ocrResult")
    search_result: dict[str, Any] = Field(default_factory=dict, alias="searchResult")
    image: str
    object_key: str = Field(alias="object_key")
    status: PrescriptionStatus = "active"

    model_config = ConfigDict(populate_by_name=True)


class PrescriptionStatusUpdate(BaseModel):
    status: PrescriptionStatus


class PrescriptionResponse(BaseModel):
    id: str = Field(alias="$id")
    user_id: str = Field(alias="userId")
    image: str
    object_key: str = Field(alias="object_key")
    ocr_result: dict[str, Any] = Field(alias="ocrResult")
    search_result: dict[str, Any] = Field(alias="searchResult")
    status: PrescriptionStatus
    created_at: str | None = Field(default=None, alias="createdAt")
    updated_at: str | None = Field(default=None, alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)


class UploadResponseData(BaseModel):
    file_url: str = Field(alias="fileUrl")
    key: str
    size: int
    drive_file_id: str = Field(alias="driveFileId")

    model_config = ConfigDict(populate_by_name=True)


class UploadResponse(BaseModel):
    success: bool = True
    data: UploadResponseData
