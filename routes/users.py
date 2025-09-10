from fastapi import APIRouter, Depends, HTTPException, Cookie, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from passlib.context import CryptContext

from models.users import ResponseSchema, TokenResponse, Register, Login
from repository.users import UsersRepo, JWTRepo
from tables.users import User
from config import get_db, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from auth import get_current_user

router = APIRouter(tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

# --------------------------
# Signup
# --------------------------
@router.post('/signup')
async def signup(request: Register, db: Session = Depends(get_db)):
    try:
        # check if email exists
        if UsersRepo.find_by_email(db, User, request.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Email already registered")

        # create new user
        _user = User(
            password=pwd_context.hash(request.password),
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name
        )
        UsersRepo.insert(db, _user)

        return ResponseSchema(
            code="200", 
            status="OK", 
            message="User successfully registered",
            result={"email": _user.email}
        ).dict()
        
    except HTTPException:
        raise
    except Exception as error:
        print("SIGNUP ERROR:", error)
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(error)}")


# --------------------------
# Signin
# --------------------------
@router.post('/signin')
async def signin(request: Login, db: Session = Depends(get_db)):
    try:
        _user = UsersRepo.find_by_email(db, User, request.email)
        if not _user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        if not pwd_context.verify(request.password, _user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )
            
        # Generate tokens
        access_token = JWTRepo.generate_token(
            {"sub": _user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = JWTRepo.generate_token(
            {"sub": _user.email},
            expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )

        # Return response with HttpOnly refresh cookie
        response = JSONResponse({
            "code": "200",
            "status": "OK",
            "message": "Successfully logged in",
            "result": {
                "access_token": access_token,
                "token_type": "bearer"
            }
        })
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False, # set True in production (HTTPS)
            samesite="lax",
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/refresh"
        )
        return response

    except HTTPException:
        raise
    except Exception as error:
        print("SIGNIN ERROR:", error)
        raise HTTPException(status_code=500, detail=f"Signin failed: {str(error)}")

# --------------------------
# Get current user (/me)
# --------------------------
@router.get("/me", response_model=ResponseSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return ResponseSchema(
        code="200",
        status="OK",
        message="User fetched successfully",
        result={
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "created_at": current_user.created_at,
        }
    )

# --------------------------
# Refresh token
# --------------------------
@router.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    payload = JWTRepo.decode_token(refresh_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    email = payload["sub"]

    # generate new tokens
    new_access = JWTRepo.generate_token(
        {"sub": email},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    new_refresh = JWTRepo.generate_token(
        {"sub": email},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    # return new access token, set new refresh cookie
    response = JSONResponse({
        "code": "200",
        "status": "OK",
        "message": "Token refreshed",
        "result": TokenResponse(access_token=new_access).dict()
    })
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/refresh"
    )
    return response

@router.post("/signout")
async def signout():
    resp = JSONResponse({"code": "200", "status": "OK", "message": "Signed out"})
    resp.delete_cookie("refresh_token", path="/refresh")
    return resp