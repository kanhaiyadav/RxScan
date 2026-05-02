from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from app.services.google_drive import GoogleDriveService
from app.web.dependencies import current_user_id
from app.web.schemas.google_drive import AuthorizationUrlResponse, DriveConnectionStatus

router = APIRouter()


@router.post("/authorization-url", response_model=AuthorizationUrlResponse)
async def authorization_url(user_id: str = Depends(current_user_id)) -> dict[str, str]:
    return await GoogleDriveService().create_authorization_url(user_id)


@router.get("/status", response_model=DriveConnectionStatus)
async def status(user_id: str = Depends(current_user_id)) -> dict:
    return await GoogleDriveService().connection_status(user_id)


@router.get("/oauth/callback", response_class=HTMLResponse)
async def oauth_callback(request: Request, state: str) -> str:
    await GoogleDriveService().handle_callback(state, str(request.url))
    return """
    <html>
      <body>
        <h1>Google Drive connected</h1>
        <p>You can close this tab and return to RxScan.</p>
      </body>
    </html>
    """
