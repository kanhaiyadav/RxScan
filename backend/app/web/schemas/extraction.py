from typing import Any

from pydantic import BaseModel, Field


class ExtractionResponse(BaseModel):
    success: bool
    data: dict[str, Any] | None = None
    error: str | None = None
    extraction_date: str | None = None
    image_path: str | None = None


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1)
    target_language: str = Field(min_length=1, alias="target_language")
    context_info: str = ""


class TranslateResponse(BaseModel):
    success: bool
    original_text: str | None = None
    translated_text: str | None = None
    target_language: str | None = None
    context_info: str | None = None
    translation_date: str | None = None
    error: str | None = None


class LanguagesResponse(BaseModel):
    success: bool = True
    languages: list[str]
    total: int
