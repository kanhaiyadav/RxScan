from pydantic import BaseModel, ConfigDict, Field


class CurrentMedication(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    dosage: str = ""
    frequency: str = ""


class EmergencyContact(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    phone: str = Field(min_length=1, max_length=60)
    relationship: str = Field(min_length=1, max_length=120)


class HealthProfilePayload(BaseModel):
    allergies: list[str] = Field(default_factory=list)
    medical_conditions: list[str] = Field(default_factory=list, alias="medicalConditions")
    current_medications: list[CurrentMedication] = Field(
        default_factory=list,
        alias="currentMedications",
    )
    dietary_restrictions: list[str] = Field(default_factory=list, alias="dietaryRestrictions")
    emergency_contacts: list[EmergencyContact] = Field(default_factory=list, alias="emergencyContacts")
    blood_type: str | None = Field(default=None, alias="bloodType")
    date_of_birth: str | None = Field(default=None, alias="dateOfBirth")
    weight: float | None = Field(default=None, ge=0)
    height: float | None = Field(default=None, ge=0)
    additional_notes: str | None = Field(default=None, alias="additionalNotes")
    profile_image_id: str | None = Field(default=None, alias="profileImageId")

    model_config = ConfigDict(populate_by_name=True)


class HealthProfileResponse(HealthProfilePayload):
    id: str = Field(alias="$id")
    user_id: str = Field(alias="userId")
    created_at: str | None = Field(default=None, alias="createdAt")
    updated_at: str | None = Field(default=None, alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)
