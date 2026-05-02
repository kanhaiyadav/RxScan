from fastapi import APIRouter, Depends

from app.services.users import UserProfileService
from app.web.dependencies import current_user_id
from app.web.schemas.user import UserProfilePayload, UserProfileResponse

router = APIRouter()


@router.get("/me/profile", response_model=UserProfileResponse | None)
async def get_my_profile(user_id: str = Depends(current_user_id)) -> dict | None:
    return await UserProfileService().get_profile(user_id)


@router.put("/me/profile", response_model=UserProfileResponse)
async def upsert_my_profile(
    payload: UserProfilePayload,
    user_id: str = Depends(current_user_id),
) -> dict:
    return await UserProfileService().upsert_profile(
        user_id,
        payload.model_dump(exclude_none=True),
    )
