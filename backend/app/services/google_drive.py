import asyncio
import io
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from app.core.config import settings
from app.core.errors import AuthenticationError, IntegrationNotConfiguredError
from app.data.repositories.google_drive import GoogleDriveTokenRepository, OAuthStateRepository

DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file"]


class GoogleDriveService:
    def __init__(
        self,
        token_repository: GoogleDriveTokenRepository | None = None,
        state_repository: OAuthStateRepository | None = None,
    ) -> None:
        self.token_repository = token_repository or GoogleDriveTokenRepository()
        self.state_repository = state_repository or OAuthStateRepository()

    async def create_authorization_url(self, user_id: str) -> dict[str, str]:
        self._require_config()
        state = secrets.token_urlsafe(32)
        await self.state_repository.create(
            state=state,
            user_id=user_id,
            expires_at=datetime.now(UTC) + timedelta(minutes=10),
        )
        flow = self._flow(state=state)
        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return {"authorization_url": authorization_url, "state": state}

    async def handle_callback(self, state: str, authorization_response: str) -> str:
        self._require_config()
        oauth_state = await self.state_repository.pop(state)
        if not oauth_state:
            raise AuthenticationError("Invalid or expired Google OAuth state")

        flow = self._flow(state=state)
        flow.fetch_token(authorization_response=authorization_response)
        credentials = flow.credentials
        await self.token_repository.upsert(
            oauth_state["user_id"],
            self._credentials_to_payload(credentials),
        )
        return oauth_state["user_id"]

    async def connection_status(self, user_id: str) -> dict[str, Any]:
        token = await self.token_repository.get_by_user_id(user_id)
        if not token:
            return {"connected": False, "scopes": [], "expires_at": None}
        return {
            "connected": True,
            "scopes": token.get("scopes", []),
            "expires_at": token.get("expires_at"),
        }

    async def upload_prescription(
        self,
        user_id: str,
        file_name: str,
        content_type: str,
        content: bytes,
    ) -> dict[str, Any]:
        credentials = await self._credentials_for_user(user_id)
        return await asyncio.to_thread(
            self._upload_file_sync,
            credentials,
            file_name,
            content_type,
            content,
        )

    async def delete_file(self, user_id: str, file_id: str) -> bool:
        credentials = await self._credentials_for_user(user_id)
        await asyncio.to_thread(self._delete_file_sync, credentials, file_id)
        return True

    async def _credentials_for_user(self, user_id: str) -> Credentials:
        self._require_config()
        token = await self.token_repository.get_by_user_id(user_id)
        if not token:
            raise AuthenticationError("Google Drive is not connected for this user")

        credentials = Credentials(
            token=token.get("token"),
            refresh_token=token.get("refresh_token"),
            token_uri=token.get("token_uri"),
            client_id=settings.google_oauth_client_id,
            client_secret=settings.google_oauth_client_secret,
            scopes=token.get("scopes", DRIVE_SCOPES),
        )

        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            await self.token_repository.upsert(user_id, self._credentials_to_payload(credentials))

        return credentials

    def _upload_file_sync(
        self,
        credentials: Credentials,
        file_name: str,
        content_type: str,
        content: bytes,
    ) -> dict[str, Any]:
        drive = build("drive", "v3", credentials=credentials, cache_discovery=False)
        folder_id = self._ensure_folder(drive)
        media = MediaIoBaseUpload(io.BytesIO(content), mimetype=content_type, resumable=False)
        metadata = {"name": file_name, "parents": [folder_id]}
        file = (
            drive.files()
            .create(
                body=metadata,
                media_body=media,
                fields="id,name,size,webViewLink,webContentLink",
            )
            .execute()
        )
        return {
            "fileUrl": file.get("webViewLink") or file.get("webContentLink"),
            "key": file["id"],
            "size": int(file.get("size") or len(content)),
            "driveFileId": file["id"],
        }

    def _delete_file_sync(self, credentials: Credentials, file_id: str) -> None:
        drive = build("drive", "v3", credentials=credentials, cache_discovery=False)
        drive.files().delete(fileId=file_id).execute()

    def _ensure_folder(self, drive) -> str:
        escaped_name = settings.google_drive_folder_name.replace("'", "\\'")
        query = (
            "mimeType='application/vnd.google-apps.folder' "
            f"and name='{escaped_name}' and trashed=false"
        )
        response = drive.files().list(q=query, fields="files(id,name)", pageSize=1).execute()
        files = response.get("files", [])
        if files:
            return files[0]["id"]

        folder = (
            drive.files()
            .create(
                body={
                    "name": settings.google_drive_folder_name,
                    "mimeType": "application/vnd.google-apps.folder",
                },
                fields="id",
            )
            .execute()
        )
        return folder["id"]

    def _flow(self, state: str | None = None) -> Flow:
        config = {
            "web": {
                "client_id": settings.google_oauth_client_id,
                "client_secret": settings.google_oauth_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.google_oauth_redirect_uri],
            }
        }
        return Flow.from_client_config(
            config,
            scopes=DRIVE_SCOPES,
            state=state,
            redirect_uri=settings.google_oauth_redirect_uri,
        )

    @staticmethod
    def _credentials_to_payload(credentials: Credentials) -> dict[str, Any]:
        expires_at = credentials.expiry.replace(tzinfo=UTC).isoformat() if credentials.expiry else None
        return {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "scopes": list(credentials.scopes or DRIVE_SCOPES),
            "expires_at": expires_at,
        }

    @staticmethod
    def _require_config() -> None:
        if not (
            settings.google_oauth_client_id
            and settings.google_oauth_client_secret
            and settings.google_oauth_redirect_uri
        ):
            raise IntegrationNotConfiguredError("Google Drive OAuth")
