from fastapi import APIRouter, File, Form, UploadFile

from app.services.gemini import GeminiService
from app.web.schemas.extraction import ExtractionResponse, LanguagesResponse, TranslateRequest, TranslateResponse

router = APIRouter()

SUPPORTED_LANGUAGES = [
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Kannada",
    "Malayalam",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Russian",
    "Arabic",
]

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
}


@router.post("/extract", response_model=ExtractionResponse)
@router.post("/prescription/extract", response_model=ExtractionResponse)
async def extract_prescription(file: UploadFile = File(...)) -> dict:
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_IMAGE_TYPES:
        return {"success": False, "error": "Invalid file type"}

    content = await file.read()
    if not content:
        return {"success": False, "error": "No file provided"}

    return await GeminiService().extract_prescription(
        image_bytes=content,
        mime_type=content_type,
        image_name=file.filename or "prescription",
    )


@router.post("/translate", response_model=TranslateResponse)
async def translate(payload: TranslateRequest) -> dict:
    return await GeminiService().translate(
        text=payload.text,
        target_language=payload.target_language,
        context_info=payload.context_info,
    )


@router.post("/translate-file", response_model=TranslateResponse)
async def translate_file(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    context_info: str = Form(""),
) -> dict:
    if not (file.filename or "").lower().endswith(".txt"):
        return {"success": False, "error": "Only .txt files are allowed"}

    content = (await file.read()).decode("utf-8")
    return await GeminiService().translate(
        text=content,
        target_language=target_language,
        context_info=context_info,
    )


@router.get("/languages", response_model=LanguagesResponse)
async def languages() -> LanguagesResponse:
    return LanguagesResponse(languages=SUPPORTED_LANGUAGES, total=len(SUPPORTED_LANGUAGES))
