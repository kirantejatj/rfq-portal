from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.schema import CEUser, Applicant

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/ce/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id_str is None or role is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    if role in ["CE", "ADMIN", "SUPER_ADMIN"]:
        user = db.query(CEUser).filter(CEUser.ce_id == user_id, CEUser.is_active == True).first()
        if user is None:
            raise credentials_exception
        return {"user": user, "role": user.role, "id": user.ce_id, "name": user.name, "mobile": user.mobile_no}
    elif role == "APPLICANT":
        user = db.query(Applicant).filter(Applicant.applicant_id == user_id, Applicant.is_active == True).first()
        if user is None:
            raise credentials_exception
        return {"user": user, "role": "APPLICANT", "id": user.applicant_id, "name": user.firm_name, "mobile": user.mobile_no}
    else:
        raise credentials_exception

def require_ce(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["CE", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Chief Engineer privileges required"
        )
    return current_user

def require_applicant(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "APPLICANT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Applicant login required"
        )
    return current_user
