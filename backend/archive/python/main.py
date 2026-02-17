from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime
from typing import List

import models, schemas, auth
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mahamez Dienstplanung API")

# CORS
origins = [
    "http://localhost:5173", # Vite default
    "https://dienstplan.swr.de",
    "https://mahamez.swr.de",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Content-Security-Policy: default-src 'self'; (Simplified for development)
    return response

@app.post("/api/auth/login", response_model=schemas.Token)
async def login(request: Request, login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    # Check if account is locked
    if user and user.locked_until and user.locked_until > datetime.datetime.utcnow():
        remaining = (user.locked_until - datetime.datetime.utcnow()).total_seconds()
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account gesperrt fr {int(remaining)} Sekunden"
        )

    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 10:
                user.locked_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
                auth.log_event(db, "login_locked", user_id=user.id, email=user.email, ip=request.client.host)
            else:
                auth.log_event(db, "login_failed", user_id=user.id, email=user.email, ip=request.client.host)
            db.commit()
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email oder Passwort falsch",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Success
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.datetime.utcnow()
    user.last_login_ip = request.client.host
    user.last_login_device = request.headers.get("user-agent")
    
    # Check new IP notification logic would go here
    
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    refresh_token = auth.create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token
    db_refresh = models.RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS),
        ip_address=request.client.host,
        device_info=request.headers.get("user-agent")
    )
    db.add(db_refresh)
    db.commit()
    
    auth.log_event(db, "login_success", user_id=user.id, email=user.email, ip=request.client.host)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}",
            "role": user.role
        }
    }

@app.get("/api/auth/me", response_model=schemas.UserOut)
async def get_me(request: Request, db: Session = Depends(get_db)):
    # This needs a dependency to get current user from token
    # For now, placeholder
    raise HTTPException(status_code=501, detail="Not implemented")

@app.post("/api/auth/logout")
async def logout(refresh_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == refresh_data.refresh_token).first()
    if db_token:
        db_token.revoked = True
        db_token.revoked_at = datetime.datetime.utcnow()
        db.commit()
        auth.log_event(db, "logout", user_id=db_token.user_id)
    return {"message": "Erfolgreich ausgeloggt"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
