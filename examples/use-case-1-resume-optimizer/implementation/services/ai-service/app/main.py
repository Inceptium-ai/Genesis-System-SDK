"""
Resumax AI Service - FastAPI Application
=========================================
AI-powered resume optimization using OpenRouter/Claude
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from datetime import datetime

# =============================================================================
# Configuration
# =============================================================================

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-haiku-4.5")
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")

# =============================================================================
# FastAPI App
# =============================================================================

app = FastAPI(
    title="Resumax AI Service",
    description="AI-powered resume optimization",
    version="0.1.0",
)

# CORS - Allow all origins in development (file://, localhost:*, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# =============================================================================
# Models
# =============================================================================

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str

class OptimizeRequest(BaseModel):
    resume_text: str
    job_description: str

class OptimizeResponse(BaseModel):
    optimized_text: str
    suggestions: list[str]
    score: int
    model_used: str

class RoastRequest(BaseModel):
    resume_text: str

class RoastResponse(BaseModel):
    score: int
    feedback: list[str]
    model_used: str

# =============================================================================
# Health Endpoints
# =============================================================================

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health/ready")
async def readiness():
    """Readiness check - verifies dependencies"""
    checks = {
        "openrouter": OPENROUTER_API_KEY is not None,
        "database_configured": DATABASE_URL is not None,
        "redis_configured": REDIS_URL is not None,
    }
    all_ready = all(checks.values())
    return {
        "ready": all_ready,
        "checks": checks
    }

# =============================================================================
# AI Endpoints
# =============================================================================

@app.post("/api/ai/optimize", response_model=OptimizeResponse)
async def optimize_resume(request: OptimizeRequest):
    """
    Optimize resume for a specific job description.
    Uses OpenRouter/Claude to rewrite bullet points.
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    prompt = f"""You are an expert resume optimizer. Analyze this resume against the job description and improve the bullet points.

RESUME:
{request.resume_text}

JOB DESCRIPTION:
{request.job_description}

Provide:
1. An optimized version of the resume with improved bullet points (use the "Accomplished X by doing Y, resulting in Z" format)
2. 3-5 specific suggestions for improvement
3. A score from 0-100 based on how well the resume matches the job

Format your response as:
OPTIMIZED RESUME:
[optimized resume text here]

SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]

SCORE: [number]"""

    try:
        response = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert resume writer and career coach."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7,
        )
        
        content = response.choices[0].message.content
        
        # Parse response (simple parsing)
        optimized_text = ""
        suggestions = []
        score = 70
        
        if "OPTIMIZED RESUME:" in content:
            parts = content.split("OPTIMIZED RESUME:")[1]
            if "SUGGESTIONS:" in parts:
                optimized_text = parts.split("SUGGESTIONS:")[0].strip()
                rest = parts.split("SUGGESTIONS:")[1]
                if "SCORE:" in rest:
                    suggestions_text = rest.split("SCORE:")[0].strip()
                    suggestions = [s.strip().lstrip("- ") for s in suggestions_text.split("\n") if s.strip().startswith("-")]
                    score_text = rest.split("SCORE:")[1].strip()
                    try:
                        score = int(''.join(filter(str.isdigit, score_text[:5])))
                    except:
                        score = 70
        else:
            optimized_text = content
            suggestions = ["Consider tailoring more to the job description"]
        
        return OptimizeResponse(
            optimized_text=optimized_text,
            suggestions=suggestions[:5],
            score=min(100, max(0, score)),
            model_used=OPENROUTER_MODEL
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")


@app.post("/api/ai/roast", response_model=RoastResponse)
async def roast_resume(request: RoastRequest):
    """
    Get brutally honest feedback on a resume.
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    prompt = f"""You are a brutally honest resume critic (but constructive). Analyze this resume and provide:

1. A score from 0-100 (be harsh but fair)
2. 5-7 specific pieces of feedback on what needs improvement

Focus on:
- Impact and quantification
- Action verbs
- Relevance and clarity
- Format and structure
- Keywords and ATS compatibility

RESUME:
{request.resume_text}

Format your response as:
SCORE: [number]

FEEDBACK:
- [feedback 1]
- [feedback 2]
..."""

    try:
        response = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": "You are a harsh but helpful resume critic."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7,
        )
        
        content = response.choices[0].message.content
        
        # Parse response
        score = 50
        feedback = []
        
        if "SCORE:" in content:
            score_text = content.split("SCORE:")[1].split("\n")[0].strip()
            try:
                score = int(''.join(filter(str.isdigit, score_text[:5])))
            except:
                score = 50
        
        if "FEEDBACK:" in content:
            feedback_text = content.split("FEEDBACK:")[1].strip()
            feedback = [f.strip().lstrip("- ") for f in feedback_text.split("\n") if f.strip().startswith("-")]
        
        if not feedback:
            feedback = ["Unable to parse feedback - please try again"]
        
        return RoastResponse(
            score=min(100, max(0, score)),
            feedback=feedback[:7],
            model_used=OPENROUTER_MODEL
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
