from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserPublic(BaseModel):
    id: str = Field(alias="$id")
    email: EmailStr
    name: str = ""
    email_verification: bool = Field(default=False, alias="emailVerification")
    registration: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class UserProfilePayload(BaseModel):
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class UserProfileResponse(BaseModel):
    id: str = Field(alias="$id")
    user_id: str = Field(alias="userId")
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    created_at: str | None = Field(default=None, alias="createdAt")
    updated_at: str | None = Field(default=None, alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)
