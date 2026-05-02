# RxScan Backend

FastAPI replacement for the Appwrite, Flask, and Node server responsibilities.

## What It Handles

- Email/password auth with JWT access tokens.
- MongoDB-backed user profiles, health profiles, and prescriptions.
- Gemini prescription extraction and translation endpoints.
- Google Drive OAuth and prescription image uploads into the user's own Drive.
- Health check endpoints compatible with the old services.

## Architecture

- `app/data`: MongoDB connection, collection names, and repositories.
- `app/services`: business logic and integrations.
- `app/web`: FastAPI routes, request validation, and HTTP dependencies.

Each layer depends inward only: web calls services, services call repositories, repositories call MongoDB.

## Local Setup

```bash
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Google Drive Setup

Create an OAuth client in Google Cloud and set:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

The redirect URI must match the value configured in Google Cloud. Users connect their own Google account through:

```http
POST /api/google-drive/authorization-url
Authorization: Bearer <token>
```

Then upload prescription files with:

```http
POST /api/prescriptions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
