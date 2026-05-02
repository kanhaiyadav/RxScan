from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RxScan API"
    environment: str = "local"
    api_prefix: str = "/api"
    frontend_origins_raw: str = Field(
        default="http://localhost:3000,http://localhost:8081,http://localhost:19006",
        alias="FRONTEND_ORIGINS",
    )

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "rxscan"

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.0-flash"

    google_oauth_client_id: str | None = None
    google_oauth_client_secret: str | None = None
    google_oauth_redirect_uri: str = "http://localhost:8000/api/google-drive/oauth/callback"
    google_drive_folder_name: str = "RxScan Prescriptions"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
