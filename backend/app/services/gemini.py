import json
from datetime import UTC, datetime
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings
from app.core.errors import IntegrationNotConfiguredError

PRESCRIPTION_EXTRACTION_PROMPT = """
You are a medical transcription expert. Analyze this prescription image and extract information in JSON format.

Return ONLY a valid JSON object with this exact structure:
{
    "doctor": {
        "name": "doctor name or null",
        "qualifications": "degrees/qualifications or null",
        "registration_number": "reg number or null",
        "clinic_name": "clinic/hospital name or null",
        "address": "clinic address or null",
        "phone": "phone number or null"
    },
    "patient": {
        "name": "patient name or null",
        "age": "age or null",
        "gender": "gender or null",
        "address": "patient address or null",
        "prescription_date": "date or null"
    },
    "medications": [
        {
            "name": "medicine name",
            "dosage": "strength/dosage",
            "quantity": "quantity prescribed",
            "frequency": "how often to take",
            "duration": "how long to take",
            "instructions": "special instructions",
            "uncertain": false
        }
    ],
    "additional_notes": {
        "special_instructions": "any special instructions or null",
        "follow_up": "follow-up date or instructions or null",
        "warnings": "warnings or precautions or null"
    },
    "extraction_notes": "any unclear text or reading difficulties"
}

Rules:
1. Use null for fields that are absent or unreadable.
2. If any reading is doubtful, copy the raw text into instructions and set uncertain to true.
3. Interpret timing codes: 1 or X means take; 0 or O means skip unless the code has only O-O.
4. Keep prescription brand names as written. Do not convert brands to generic drug names.
5. Output only the final JSON.
"""


class GeminiService:
    def __init__(self) -> None:
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    def _require_client(self):
        if not self.client:
            raise IntegrationNotConfiguredError("Gemini")
        return self.client

    async def extract_prescription(
        self,
        image_bytes: bytes,
        mime_type: str,
        image_name: str,
    ) -> dict[str, Any]:
        client = self._require_client()
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[
                PRESCRIPTION_EXTRACTION_PROMPT,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        text = response.text or "{}"
        try:
            data = json.loads(_strip_json_fence(text))
        except json.JSONDecodeError:
            data = {"raw_response": text, "note": "Could not parse as JSON, returning raw text"}

        return {
            "success": True,
            "data": data,
            "extraction_date": datetime.now(UTC).isoformat(),
            "image_path": image_name,
        }

    async def translate(self, text: str, target_language: str, context_info: str = "") -> dict[str, Any]:
        client = self._require_client()
        context_prompt = (
            f"This is a {context_info}. Use appropriate terminology.\n" if context_info else ""
        )
        prompt = (
            f"Translate the following English text to {target_language}.\n"
            f"{context_prompt}"
            "Maintain original formatting and preserve meaning.\n\n"
            f"Text to translate:\n{text}"
        )
        response = client.models.generate_content(model=settings.gemini_model, contents=prompt)
        return {
            "success": True,
            "original_text": text,
            "translated_text": response.text,
            "target_language": target_language,
            "context_info": context_info,
            "translation_date": datetime.now(UTC).isoformat(),
        }


def _strip_json_fence(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```json"):
        stripped = stripped[7:]
    if stripped.startswith("```"):
        stripped = stripped[3:]
    if stripped.endswith("```"):
        stripped = stripped[:-3]
    return stripped.strip()
