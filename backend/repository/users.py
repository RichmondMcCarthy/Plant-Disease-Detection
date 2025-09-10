from typing import TypeVar, Type, Generic
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
from config import SECRET_KEY, ALGORITHM

T = TypeVar("T")

# Base Repo
class BaseRepo:
    @staticmethod
    def insert(db: Session, model: Type[T]):
        db.add(model)
        db.commit()
        db.refresh(model)
        return model

# Users Repo
class UsersRepo(BaseRepo):
    @staticmethod
    def find_by_email(db: Session, model: Type[T], email: str):
        return db.query(model).filter(model.email == email).first()

# JWT Repo
class JWTRepo:
    @staticmethod
    def generate_token(data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str):
        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return decoded_token
        except JWTError:
            return None
