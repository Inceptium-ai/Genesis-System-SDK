# Backend Components

This directory contains components for building backend services and APIs.

## 📁 Structure

```
backend/
└── fastapi-base/        # Pure FastAPI scaffold (no LLM dependencies)
```

## 🎯 When to Use Which

```
┌─ What type of backend do you need?
│   │
│   ├── Pure REST API (no AI) → backend/fastapi-base
│   │   - Clean FastAPI structure
│   │   - Async SQLAlchemy ready
│   │   - Docker containerized
│   │   - Health checks included
│   │
│   ├── API with LLM calls → llm/api-direct/fastapi-ai-service  
│   │   - FastAPI + OpenRouter integration
│   │   - Basic prompt patterns
│   │   - Good for simple AI features
│   │
│   └── API with reliable structured LLM output → backend/fastapi-base + llm/api-direct/structured-output
│       - Compose both components
│       - 100% reliable JSON schema compliance
│       - Production-ready AI backend
```

## 📊 Comparison

| Feature | fastapi-base | fastapi-ai-service (in llm/) |
|---------|--------------|------------------------------|
| **Purpose** | General backend | LLM-focused backend |
| **LLM deps** | ❌ None | ✅ httpx for OpenRouter |
| **Database** | ✅ SQLAlchemy async | ❌ Optional |
| **Docker** | ✅ Production ready | ✅ Production ready |
| **Best For** | Any Python API | AI-powered services |

## 🔧 Composability

Backend components are designed to compose with other GSS components:

```yaml
# Example: Resume AI App Backend
components:
  - backend/fastapi-base           # Core API structure
  - llm/api-direct/structured-output  # Reliable LLM output
  - auth/keycloak                  # Authentication
  - database/postgres              # Data storage
```

## ⚠️ Common Setup Issues

### CORS Configuration

**Problem:** Frontend can't reach backend in development
**Solution:** See CORS patterns in fastapi-base component

### Async Database

**Problem:** SQLAlchemy blocking calls
**Solution:** Use `asyncpg` driver and async session patterns

### Docker Networking

**Problem:** Services can't communicate
**Solution:** Use Docker service names, not `localhost`

---

*Last updated: December 2025*
