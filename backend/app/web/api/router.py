from fastapi import APIRouter

from app.web.api.routes import auth, extraction, google_drive, health, health_profiles, prescriptions, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(health_profiles.router, prefix="/health-profile", tags=["health-profile"])
api_router.include_router(prescriptions.router, tags=["prescriptions"])
api_router.include_router(extraction.router, tags=["gemini"])
api_router.include_router(google_drive.router, prefix="/google-drive", tags=["google-drive"])
