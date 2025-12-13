"""
FastAPI Backend with SuperTokens Authentication

This is the reference implementation for embedded auth in Genesis apps.
"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from supertokens_python import init, InputAppInfo, SupertokensConfig
from supertokens_python.recipe import emailpassword, session, dashboard
from supertokens_python.recipe.session.framework.fastapi import verify_session
from supertokens_python.recipe.session import SessionContainer
from supertokens_python import get_all_cors_headers
from supertokens_python.framework.fastapi import get_middleware

# ============================================
# CONFIGURATION
# ============================================

SUPERTOKENS_CONNECTION_URI = os.getenv("SUPERTOKENS_CONNECTION_URI", "http://localhost:3567")
APP_NAME = os.getenv("APP_NAME", "EmbeddedAuthDemo")
API_DOMAIN = os.getenv("API_DOMAIN", "http://localhost:8001")
WEBSITE_DOMAIN = os.getenv("WEBSITE_DOMAIN", "http://localhost:5174")

# ============================================
# SUPERTOKENS INITIALIZATION
# ============================================

init(
    app_info=InputAppInfo(
        app_name=APP_NAME,
        api_domain=API_DOMAIN,
        website_domain=WEBSITE_DOMAIN,
        api_base_path="/auth",
        website_base_path="/auth"
    ),
    supertokens_config=SupertokensConfig(
        connection_uri=SUPERTOKENS_CONNECTION_URI,
    ),
    framework="fastapi",
    recipe_list=[
        emailpassword.init(),
        session.init(),
        dashboard.init()  # Enable admin dashboard
    ],
    mode="asgi"
)

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Embedded Auth Demo API",
    description="FastAPI + SuperTokens reference implementation",
    version="1.0.0"
)

# Add SuperTokens middleware
app.add_middleware(get_middleware())

# Add CORS middleware (must be after SuperTokens middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEBSITE_DOMAIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"] + get_all_cors_headers(),
)

# ============================================
# PUBLIC ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Public endpoint - no auth required"""
    return {
        "message": "Embedded Auth Demo API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

# ============================================
# PROTECTED ENDPOINTS
# ============================================

@app.get("/api/me")
async def get_current_user(session: SessionContainer = Depends(verify_session())):
    """Get current user info - requires authentication"""
    user_id = session.get_user_id()
    return {
        "user_id": user_id,
        "message": f"Hello, user {user_id}!"
    }

@app.get("/api/protected")
async def protected_route(session: SessionContainer = Depends(verify_session())):
    """Example protected endpoint"""
    user_id = session.get_user_id()
    return {
        "message": "This is a protected endpoint",
        "user_id": user_id,
        "access": "granted"
    }

@app.post("/api/data")
async def create_data(
    data: dict,
    session: SessionContainer = Depends(verify_session())
):
    """Example protected POST endpoint"""
    user_id = session.get_user_id()
    return {
        "message": "Data created successfully",
        "user_id": user_id,
        "data": data
    }

# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
