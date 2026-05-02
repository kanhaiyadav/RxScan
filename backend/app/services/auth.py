from app.core.errors import AuthenticationError
from app.core.security import create_access_token, hash_password, verify_password
from app.data.mappers import appwrite_shape
from app.data.repositories.users import UserRepository


class AuthService:
    def __init__(self, repository: UserRepository | None = None) -> None:
        self.repository = repository or UserRepository()

    async def sign_up(self, email: str, password: str, name: str | None) -> dict:
        user = await self.repository.create(email, hash_password(password), name)
        return self._token_payload(user)

    async def sign_in(self, email: str, password: str) -> dict:
        user = await self.repository.get_by_email(email)
        if not user or not verify_password(password, user["password_hash"]):
            raise AuthenticationError("Invalid email or password")
        return self._token_payload(user)

    async def get_current_user(self, user_id: str) -> dict:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User no longer exists")
        return self.to_public_user(user)

    def _token_payload(self, user: dict) -> dict:
        public_user = self.to_public_user(user)
        token = create_access_token(subject=user["id"], extra_claims={"email": user["email"]})
        return {"access_token": token, "token_type": "bearer", "user": public_user}

    @staticmethod
    def to_public_user(user: dict) -> dict:
        shaped = appwrite_shape(user)
        return {
            "$id": shaped["$id"],
            "email": shaped["email"],
            "name": shaped.get("name", ""),
            "emailVerification": shaped.get("email_verification", False),
            "registration": shaped.get("registration"),
        }
