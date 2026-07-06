"""Bcrypt-backed implementation of the `PasswordHasher` port.

Uses the `bcrypt` package directly rather than going through `passlib`.
`passlib` has been unmaintained since 2020, and its bcrypt backend
detection (`_bcrypt.__about__.__version__`) is broken by modern `bcrypt`
releases (>=5.0, which removed that attribute) — it fails its own internal
self-test and raises a misleading
`ValueError: password cannot be longer than 72 bytes` even for short
passwords. Calling `bcrypt.hashpw`/`bcrypt.checkpw` directly avoids that
broken detection layer entirely while producing/verifying the exact same
standard bcrypt hash format (`$2b$<rounds>$<salt><digest>`), so no
previously-issued hash is invalidated.
"""

import bcrypt

from app.core.config import get_settings


class BcryptPasswordHasher:
    def __init__(self) -> None:
        settings = get_settings()
        self._rounds = settings.bcrypt_rounds

    def hash(self, plain_password: str) -> str:
        salt = bcrypt.gensalt(rounds=self._rounds)
        hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except ValueError:
            # Malformed hash or an over-length input — treat as "does not match"
            # rather than letting it surface as a 500 during login.
            return False
