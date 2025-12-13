# Embedded Auth Implementation

SuperTokens-based embedded authentication for consumer SaaS apps.

## Quick Start

### 1. Start Infrastructure

```bash
cd implementation
docker compose up -d postgres supertokens-core
```

Wait for SuperTokens to be ready:
```bash
curl http://localhost:3567/hello
# Should return: Hello
```

### 2. Start Backend

```bash
# Option A: With Docker
docker compose up -d backend

# Option B: Local development
cd services/backend
pip install -r requirements.txt
SUPERTOKENS_CONNECTION_URI=http://localhost:3567 \
API_DOMAIN=http://localhost:8001 \
WEBSITE_DOMAIN=http://localhost:5174 \
uvicorn main:app --reload --port 8001
```

Backend API: http://localhost:8001
- Docs: http://localhost:8001/docs
- Health: http://localhost:8001/health

### 3. Start Frontend

```bash
cd services/frontend
npm install
npm run dev
```

Frontend: http://localhost:5174

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Postgres | 5433 | Database |
| SuperTokens Core | 3567 | Auth server |
| Backend (FastAPI) | 8001 | API server |
| Frontend (React) | 5174 | Web app |

## Test Auth Flow

1. Open http://localhost:5174
2. Click "Sign Up"
3. Enter email and password
4. You're logged in!
5. Click "Protected Content" to test protected API
6. Click "Logout" to sign out

## API Endpoints

### Public
- `GET /` - API info
- `GET /health` - Health check

### Protected (require auth)
- `GET /api/me` - Get current user
- `GET /api/protected` - Example protected endpoint
- `POST /api/data` - Example protected POST

## Files

```
implementation/
├── docker-compose.yml          # All services
├── services/
│   ├── backend/
│   │   ├── main.py             # FastAPI + SuperTokens
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── frontend/
│       ├── src/
│       │   ├── main.tsx        # App entry
│       │   ├── App.tsx         # Main component
│       │   └── config.ts       # SuperTokens config
│       ├── package.json
│       └── vite.config.ts
```

## Cleanup

```bash
docker compose down -v
```
