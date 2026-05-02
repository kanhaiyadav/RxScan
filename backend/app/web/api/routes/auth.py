from fastapi import APIRouter, Depends

from app.services.auth import AuthService
from app.web.dependencies import current_user
from app.web.schemas.auth import SignInRequest, SignUpRequest, TokenResponse
from app.web.schemas.common import MessageResponse
from app.web.schemas.user import UserPublic

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def sign_up(payload: SignUpRequest) -> dict:
    return await AuthService().sign_up(payload.email, payload.password, payload.name)


@router.post("/signin", response_model=TokenResponse)
async def sign_in(payload: SignInRequest) -> dict:
    return await AuthService().sign_in(payload.email, payload.password)


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(current_user)) -> dict:
    return user


@router.post("/signout", response_model=MessageResponse)
async def sign_out() -> MessageResponse:
    return MessageResponse(message="Signed out")
