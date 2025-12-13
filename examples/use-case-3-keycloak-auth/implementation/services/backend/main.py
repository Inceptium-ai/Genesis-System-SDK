"""
FastAPI Backend with Keycloak JWT Authentication

This demonstrates the Genesis pattern for Keycloak integration:
- JWT token validation
- Role-based access control
- ZERO custom auth code in the application!
"""
import os
import httpx
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

# ============================================
# CONFIGURATION
# ============================================

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_PUBLIC_URL = os.getenv("KEYCLOAK_PUBLIC_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "genesis")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "genesis-app")

JWKS_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
ISSUER = f"{KEYCLOAK_PUBLIC_URL}/realms/{KEYCLOAK_REALM}"

# ============================================
# JWT VALIDATION
# ============================================

security = HTTPBearer()

# Cache for JWKS keys
jwks_cache = {"keys": None}

async def get_jwks():
    """Fetch JWKS keys from Keycloak"""
    if jwks_cache["keys"] is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(JWKS_URL)
            if response.status_code == 200:
                jwks_cache["keys"] = response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Could not fetch JWKS keys"
                )
    return jwks_cache["keys"]

class TokenData(BaseModel):
    sub: str  # User ID
    email: Optional[str] = None
    preferred_username: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    realm_access: Optional[dict] = None

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """Verify JWT token from Keycloak"""
    token = credentials.credentials
    
    try:
        # Get JWKS keys
        jwks = await get_jwks()
        
        # Decode without verification first to get the key id
        unverified_header = jwt.get_unverified_header(token)
        
        # Find the matching key
        rsa_key = None
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header["kid"]:
                rsa_key = key
                break
        
        if rsa_key is None:
            # Refresh JWKS cache and retry
            jwks_cache["keys"] = None
            jwks = await get_jwks()
            for key in jwks.get("keys", []):
                if key["kid"] == unverified_header["kid"]:
                    rsa_key = key
                    break
        
        if rsa_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate key"
            )
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience="account",
            issuer=ISSUER,
            options={"verify_aud": False}  # Keycloak uses 'account' as default audience
        )
        
        return TokenData(
            sub=payload.get("sub"),
            email=payload.get("email"),
            preferred_username=payload.get("preferred_username"),
            given_name=payload.get("given_name"),
            family_name=payload.get("family_name"),
            realm_access=payload.get("realm_access", {})
        )
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

def require_role(role: str):
    """Dependency to require a specific role"""
    async def role_checker(token_data: TokenData = Depends(verify_token)):
        roles = token_data.realm_access.get("roles", []) if token_data.realm_access else []
        if role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' required"
            )
        return token_data
    return role_checker

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Keycloak Auth Demo API",
    description="FastAPI + Keycloak JWT authentication pattern",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176", "http://127.0.0.1:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# PUBLIC ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {
        "message": "Keycloak Auth Demo API",
        "docs": "/docs",
        "keycloak_admin": f"{KEYCLOAK_PUBLIC_URL}/admin"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# ============================================
# PROTECTED ENDPOINTS
# ============================================

@app.get("/api/me")
async def get_current_user(token_data: TokenData = Depends(verify_token)):
    """Get current user info from JWT token - requires authentication"""
    return {
        "user_id": token_data.sub,
        "email": token_data.email,
        "username": token_data.preferred_username,
        "name": f"{token_data.given_name or ''} {token_data.family_name or ''}".strip(),
        "roles": token_data.realm_access.get("roles", []) if token_data.realm_access else []
    }

@app.get("/api/protected")
async def protected_route(token_data: TokenData = Depends(verify_token)):
    """Example protected endpoint - any authenticated user"""
    return {
        "message": "This is a protected endpoint",
        "user_id": token_data.sub,
        "access": "granted"
    }

@app.get("/api/admin")
async def admin_route(token_data: TokenData = Depends(require_role("admin"))):
    """Admin-only endpoint - requires 'admin' role"""
    return {
        "message": "Welcome to the admin area!",
        "user_id": token_data.sub,
        "access": "admin"
    }

# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
