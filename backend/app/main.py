from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.data.database import close_mongo, connect_mongo, ensure_indexes
from app.web.api.router import api_router
from app.web.errors import install_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_mongo()
    await ensure_indexes()
    yield
    await close_mongo()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)
install_exception_handlers(app)


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "healthy", "service": settings.app_name}
