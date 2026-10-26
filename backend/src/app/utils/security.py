import bcrypt

# bcrypt only uses the first 72 bytes of the input
BCRYPT_MAX_BYTES = 72


class SecurePassword:
    def hash_pwd(self, password: str) -> str:
        secret = password.encode("utf-8")
        if len(secret) > BCRYPT_MAX_BYTES:
            raise ValueError(f"Password cannot be longer than {BCRYPT_MAX_BYTES} bytes")
        return bcrypt.hashpw(secret, bcrypt.gensalt()).decode("utf-8")

    def verify_pwd(self, plain_password: str, hashed_password: str) -> bool:
        secret = plain_password.encode("utf-8")
        if len(secret) > BCRYPT_MAX_BYTES:
            return False
        try:
            return bcrypt.checkpw(secret, hashed_password.encode("utf-8"))
        except ValueError:  # malformed hash
            return False
