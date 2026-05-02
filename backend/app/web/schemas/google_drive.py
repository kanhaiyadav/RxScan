from pydantic import BaseModel


class AuthorizationUrlResponse(BaseModel):
    authorization_url: str
    state: str


class DriveConnectionStatus(BaseModel):
    connected: bool
    scopes: list[str] = []
    expires_at: str | None = None
