from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import JWT


class JWTService:

    @staticmethod
    def create_token(user_id: str, token_type: str) -> str:
        if token_type == "access":
            expire = datetime.now(timezone.utc) + timedelta(hours=int(JWT["ACCESS_TOKEN_EXPIRE_HOURS"]))
        else: 
            expire = datetime.now(timezone.utc) + timedelta(days=int(JWT["REFRESH_TOKEN_EXPIRE_DAYS"]))

        payload = {
            "sub": str(user_id),
            "type": token_type,
            "exp": expire,
        }

        return jwt.encode(payload, JWT["SECRET_KEY"], algorithm=JWT["ALGORITHM"])


    @staticmethod
    def verify_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, JWT["SECRET_KEY"], algorithms=[JWT["ALGORITHM"]])
            return payload
        except jwt.ExpiredSignatureError:
            raise Exception("Token has expired")
        except jwt.InvalidTokenError:
            raise Exception("Invalid token")
