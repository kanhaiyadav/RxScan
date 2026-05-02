from fastapi import APIRouter, Depends

from app.services.health_profiles import HealthProfileService
from app.web.dependencies import current_user_id
from app.web.schemas.common import MessageResponse
from app.web.schemas.health_profile import HealthProfilePayload, HealthProfileResponse

router = APIRouter()


@router.get("", response_model=HealthProfileResponse | None)
async def get_health_profile(user_id: str = Depends(current_user_id)) -> dict | None:
    return await HealthProfileService().get(user_id)


@router.put("", response_model=HealthProfileResponse)
async def upsert_health_profile(
    payload: HealthProfilePayload,
    user_id: str = Depends(current_user_id),
) -> dict:
    return await HealthProfileService().upsert(
        user_id,
        payload.model_dump(by_alias=False, exclude_none=True),
    )


@router.delete("", response_model=MessageResponse)
async def delete_health_profile(user_id: str = Depends(current_user_id)) -> MessageResponse:
    await HealthProfileService().delete(user_id)
    return MessageResponse(message="Health profile deleted")
