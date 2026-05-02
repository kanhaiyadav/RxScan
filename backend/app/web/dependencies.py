import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.errors import AuthenticationError
from app.core.security import decode_access_token
from app.services.auth import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise AuthenticationError("Missing bearer token")
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid or expired token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token subject")
    return await AuthService().get_current_user(user_id)


async def current_user_id(user: dict = Depends(current_user)) -> str:
    return user["$id"]
