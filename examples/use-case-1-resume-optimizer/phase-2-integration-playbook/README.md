# Phase 2 — Integration Playbook

## AI Resume Optimization App (Resumax)

**Blueprint:** C — AI Platform / AI Webapp  
**Experiment ID:** UC1-RESUME-OPT  
**Version:** 1.0.0

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Local Dev Setup](#3-local-dev-setup)
4. [Secrets Management](#4-secrets-management)
5. [Component Configurations](#5-component-configurations)
6. [Bootstrap Commands](#6-bootstrap-commands)
7. [Common Failure Modes](#7-common-failure-modes)
8. [Verification Steps](#8-verification-steps)

---

## 1. Prerequisites

### Required Tools

| Tool | Minimum Version | Installation |
|------|-----------------|--------------|
| Docker | 24.0+ | [docker.com](https://docker.com) |
| Docker Compose | 2.20+ | Included with Docker Desktop |
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| pnpm | 8.x+ | `npm install -g pnpm` |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |

### System Requirements

- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 20GB free space
- **CPU:** 4 cores recommended
- **OS:** macOS, Linux, or Windows with WSL2

### Required External Accounts

| Service | Purpose | Signup |
|---------|---------|--------|
| OpenRouter | AI inference | [openrouter.ai](https://openrouter.ai) |
| Langfuse | LLM observability | [langfuse.com](https://langfuse.com) |
| Google Cloud Console | OAuth (optional) | [console.cloud.google.com](https://console.cloud.google.com) |
| Stripe | Billing (deferred) | [stripe.com](https://stripe.com) |

---

## 2. Quick Start

```bash
# Clone the repository
git clone https://github.com/genesislabs/resumax.git
cd resumax

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# Required: OPENROUTER_API_KEY, LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY

# Start all services
make dev

# Or manually:
docker compose up -d

# Wait for services to be healthy (about 60-90 seconds)
docker compose ps

# Open the app
open http://localhost:3000
```

**First-time setup takes 2-3 minutes** for image pulls and Keycloak initialization.

---

## 3. Local Dev Setup

### Directory Structure

```
resumax/
├── docker-compose.yml          # Main composition
├── docker-compose.override.yml # Dev overrides
├── .env                        # Local secrets (gitignored)
├── .env.example                # Template
├── Makefile                    # Common commands
│
├── frontend/                   # Next.js app
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│
├── services/
│   ├── ai-service/             # FastAPI AI backend
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   │
│   └── pdf-service/            # PDF generation
│       ├── Dockerfile
│       ├── requirements.txt
│       └── app/
│
├── config/
│   ├── keycloak/               # Realm export
│   ├── temporal/               # Workflow configs
│   └── otel/                   # OpenTelemetry config
│
├── scripts/
│   ├── setup.sh                # First-time setup
│   ├── seed-data.sh            # Sample data
│   └── reset.sh                # Clean restart
│
└── docs/
    └── playbook/
```

### Step-by-Step Setup

#### Step 1: Clone and Configure

```bash
# Clone repository
git clone https://github.com/genesislabs/resumax.git
cd resumax

# Create local environment file
cp .env.example .env

# Open and edit .env with your credentials
code .env  # or vim .env
```

#### Step 2: Configure External Services

**OpenRouter:**
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create a new API key
3. Add to `.env`: `OPENROUTER_API_KEY=sk-or-v1-...`

**Langfuse:**
1. Create account at [langfuse.com](https://langfuse.com)
2. Create a new project
3. Go to Settings → API Keys
4. Copy public and secret keys to `.env`

#### Step 3: Start Infrastructure

```bash
# Start database and core services first
docker compose up -d postgres redis

# Wait for databases to be ready
sleep 10

# Start remaining services
docker compose up -d

# Check all services are running
docker compose ps
```

#### Step 4: Initialize Keycloak

```bash
# The first startup auto-imports the realm
# Access admin console to verify
open http://localhost:8080/admin

# Login: admin / admin (change in production!)
```

#### Step 5: Start Development Servers

```bash
# Terminal 1: Frontend (hot reload)
cd frontend
pnpm install
pnpm dev

# Terminal 2: AI Service (hot reload)
cd services/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 3: PDF Service
cd services/pdf-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## 4. Secrets Management

### Strategy

| Environment | Approach |
|-------------|----------|
| Local Dev | `.env` file (gitignored) |
| CI/CD | GitHub Actions Secrets / GitLab CI Variables |
| Staging | AWS Secrets Manager / HashiCorp Vault |
| Production | AWS Secrets Manager / HashiCorp Vault + External Secrets Operator |

### Secret Categories

#### Category A: Development Only
These can be committed (for local dev convenience):

```bash
# .env.example (safe to commit)
POSTGRES_USER=resumax
POSTGRES_DB=resumax
KEYCLOAK_ADMIN=admin
REDIS_PASSWORD=localredis
```

#### Category B: User-Provided (Required)
These must be provided by the developer:

```bash
# Required for AI functionality
OPENROUTER_API_KEY=sk-or-v1-xxx

# Required for observability
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx
```

#### Category C: Generated Secrets
These should be generated per-environment:

```bash
# Generate with: openssl rand -base64 32
POSTGRES_PASSWORD=<generate>
KEYCLOAK_ADMIN_PASSWORD=<generate>
JWT_SECRET=<generate>
```

#### Category D: Deferred (Stripe)
```bash
# Not required until billing integration phase
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### .env Template

```bash
# =============================================================================
# RESUMAX LOCAL DEVELOPMENT ENVIRONMENT
# =============================================================================
# Copy this file to .env and fill in the values
# DO NOT commit .env to version control

# -----------------------------------------------------------------------------
# DATABASE
# -----------------------------------------------------------------------------
POSTGRES_USER=resumax
POSTGRES_PASSWORD=localdevpassword123
POSTGRES_DB=resumax
DATABASE_URL=postgresql://resumax:localdevpassword123@localhost:5432/resumax

# -----------------------------------------------------------------------------
# REDIS
# -----------------------------------------------------------------------------
REDIS_PASSWORD=localredis
REDIS_URL=redis://:localredis@localhost:6379/0

# -----------------------------------------------------------------------------
# KEYCLOAK
# -----------------------------------------------------------------------------
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=resumax
KEYCLOAK_CLIENT_ID=resumax-web

# -----------------------------------------------------------------------------
# AI / LLM (REQUIRED - Get from OpenRouter)
# -----------------------------------------------------------------------------
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
OPENROUTER_MODEL=anthropic/claude-haiku-4.5

# -----------------------------------------------------------------------------
# OBSERVABILITY (REQUIRED - Get from Langfuse)
# -----------------------------------------------------------------------------
LANGFUSE_PUBLIC_KEY=pk-lf-YOUR_KEY_HERE
LANGFUSE_SECRET_KEY=sk-lf-YOUR_KEY_HERE
LANGFUSE_HOST=https://cloud.langfuse.com

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# -----------------------------------------------------------------------------
# TEMPORAL
# -----------------------------------------------------------------------------
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=resumax

# -----------------------------------------------------------------------------
# FILE STORAGE (MinIO for local dev)
# -----------------------------------------------------------------------------
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=resumax-exports

# -----------------------------------------------------------------------------
# STRIPE (DEFERRED - Not required initially)
# -----------------------------------------------------------------------------
# STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
# STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# -----------------------------------------------------------------------------
# APPLICATION
# -----------------------------------------------------------------------------
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
```

---

## 5. Component Configurations

### 5.1 PostgreSQL

**Minimal Config:**
```yaml
# In docker-compose.yml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB}
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./config/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
  ports:
    - "5432:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**Init Script (config/postgres/init.sql):**
```sql
-- Create separate databases for Keycloak and Temporal
CREATE DATABASE keycloak;
CREATE DATABASE temporal;
CREATE DATABASE temporal_visibility;

-- Enable extensions
\c resumax;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 5.2 Redis

**Minimal Config:**
```yaml
redis:
  image: redis:7.2-alpine
  command: redis-server --requirepass ${REDIS_PASSWORD}
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### 5.3 Keycloak

**Minimal Config:**
```yaml
keycloak:
  image: quay.io/keycloak/keycloak:24.0
  command: start-dev --import-realm
  environment:
    KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN}
    KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
    KC_DB_USERNAME: ${POSTGRES_USER}
    KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
    KC_HEALTH_ENABLED: true
  volumes:
    - ./config/keycloak/resumax-realm.json:/opt/keycloak/data/import/resumax-realm.json
  ports:
    - "8080:8080"
  depends_on:
    postgres:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "exec 3<>/dev/tcp/127.0.0.1/8080"]
    interval: 30s
    timeout: 10s
    retries: 10
```

**Realm Export (config/keycloak/resumax-realm.json):** See `phase-2-integration-playbook/keycloak-realm.json`

### 5.4 Temporal

**Minimal Config:**
```yaml
temporal:
  image: temporalio/auto-setup:1.23
  environment:
    - DB=postgres
    - DB_PORT=5432
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PWD=${POSTGRES_PASSWORD}
    - POSTGRES_SEEDS=postgres
  ports:
    - "7233:7233"
  depends_on:
    postgres:
      condition: service_healthy

temporal-ui:
  image: temporalio/ui:2.22.0
  environment:
    - TEMPORAL_ADDRESS=temporal:7233
    - TEMPORAL_CORS_ORIGINS=http://localhost:3000
  ports:
    - "8088:8080"
  depends_on:
    - temporal
```

### 5.5 OpenTelemetry Collector

**Minimal Config (config/otel/collector.yaml):**
```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  logging:
    loglevel: info

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger, logging]
```

### 5.6 Jaeger

**Minimal Config:**
```yaml
jaeger:
  image: jaegertracing/all-in-one:1.54
  environment:
    - COLLECTOR_OTLP_ENABLED=true
  ports:
    - "16686:16686"  # UI
    - "14250:14250"  # gRPC
  healthcheck:
    test: ["CMD-SHELL", "wget -q --spider http://localhost:16686 || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
```

### 5.7 MinIO (Local S3)

**Minimal Config:**
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${S3_ACCESS_KEY}
    MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
  volumes:
    - minio_data:/data
  ports:
    - "9000:9000"
    - "9001:9001"
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
    interval: 30s
    timeout: 20s
    retries: 3
```

---

## 6. Bootstrap Commands

### Makefile

```makefile
.PHONY: dev setup clean reset logs test

# Start all services in development mode
dev:
	docker compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 30
	@echo "Services ready! Open http://localhost:3000"

# First-time setup
setup:
	@echo "Setting up Resumax development environment..."
	cp -n .env.example .env || true
	@echo "Please edit .env with your API keys, then run 'make dev'"

# Stop and clean all containers
clean:
	docker compose down -v
	docker system prune -f

# Full reset (removes all data)
reset:
	docker compose down -v
	rm -rf ./data/*
	docker compose up -d

# View logs
logs:
	docker compose logs -f

logs-ai:
	docker compose logs -f ai-service

logs-frontend:
	docker compose logs -f frontend

# Run tests
test:
	docker compose exec ai-service pytest
	docker compose exec frontend pnpm test

# Database migrations
migrate:
	docker compose exec ai-service alembic upgrade head

# Seed sample data
seed:
	docker compose exec ai-service python scripts/seed.py

# Check service health
health:
	@echo "=== Service Health ==="
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Create Keycloak test users
create-users:
	./scripts/create-keycloak-users.sh
```

### Script: First-Time Setup (scripts/setup.sh)

```bash
#!/bin/bash
set -e

echo "==================================="
echo "  Resumax Development Setup"
echo "==================================="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please edit with your API keys."
    echo ""
    echo "Required keys:"
    echo "  - OPENROUTER_API_KEY (from openrouter.ai)"
    echo "  - LANGFUSE_PUBLIC_KEY (from langfuse.com)"
    echo "  - LANGFUSE_SECRET_KEY (from langfuse.com)"
    echo ""
    read -p "Press enter after editing .env..."
fi

# Check required environment variables
source .env
if [ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" = "sk-or-v1-YOUR_KEY_HERE" ]; then
    echo "ERROR: OPENROUTER_API_KEY is not set in .env"
    exit 1
fi

# Pull images
echo "Pulling Docker images..."
docker compose pull

# Create necessary directories
mkdir -p data/postgres data/redis data/minio

# Start services
echo "Starting services..."
docker compose up -d

# Wait for services
echo "Waiting for services to initialize (this may take 1-2 minutes)..."
sleep 60

# Check health
echo ""
echo "=== Service Status ==="
docker compose ps

echo ""
echo "==================================="
echo "  Setup Complete!"
echo "==================================="
echo ""
echo "Access points:"
echo "  - Frontend:      http://localhost:3000"
echo "  - Keycloak:      http://localhost:8080 (admin/admin)"
echo "  - Temporal UI:   http://localhost:8088"
echo "  - Jaeger:        http://localhost:16686"
echo "  - MinIO Console: http://localhost:9001"
echo ""
echo "Next steps:"
echo "  1. Run 'make create-users' to create test users"
echo "  2. Open http://localhost:3000 and try logging in"
echo ""
```

---

## 7. Common Failure Modes

### 7.1 Keycloak Won't Start

**Symptoms:**
- Keycloak container exits immediately
- Log shows "Failed to connect to database"

**Diagnosis:**
```bash
docker compose logs keycloak
```

**Solutions:**
1. Ensure PostgreSQL is healthy first:
   ```bash
   docker compose up -d postgres
   sleep 10
   docker compose up -d keycloak
   ```

2. Check database exists:
   ```bash
   docker compose exec postgres psql -U resumax -c "\l"
   ```

3. Reset Keycloak database:
   ```bash
   docker compose exec postgres psql -U resumax -c "DROP DATABASE keycloak; CREATE DATABASE keycloak;"
   docker compose restart keycloak
   ```

### 7.2 Temporal Workflow Timeouts

**Symptoms:**
- Optimization runs stay in "pending" state
- Temporal UI shows workflow stuck

**Diagnosis:**
```bash
# Check Temporal UI
open http://localhost:8088

# Check worker logs
docker compose logs ai-service | grep -i temporal
```

**Solutions:**
1. Ensure worker is running:
   ```bash
   docker compose exec ai-service python -c "from app.workers import start_worker; start_worker()"
   ```

2. Check Temporal connectivity:
   ```bash
   docker compose exec ai-service python -c "
   from temporalio.client import Client
   import asyncio
   async def check(): 
       client = await Client.connect('temporal:7233')
       print('Connected!')
   asyncio.run(check())
   "
   ```

### 7.3 OpenRouter API Errors

**Symptoms:**
- "401 Unauthorized" in AI service logs
- "Rate limit exceeded"

**Diagnosis:**
```bash
# Test API key directly
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

**Solutions:**
1. Verify API key is correct in `.env`
2. Check OpenRouter dashboard for quota/billing
3. Add retry logic with exponential backoff

### 7.4 PDF Generation Fails

**Symptoms:**
- Export hangs or fails
- LaTeX compilation errors

**Diagnosis:**
```bash
docker compose logs pdf-service
docker compose exec pdf-service pdflatex --version
```

**Solutions:**
1. Ensure LaTeX is installed in container:
   ```bash
   docker compose exec pdf-service apt-get install -y texlive-latex-base
   ```

2. Check template syntax:
   ```bash
   docker compose exec pdf-service pdflatex /app/templates/test.tex
   ```

3. Fall back to WeasyPrint (HTML-based):
   ```python
   # Switch to HTML template instead of LaTeX
   ```

### 7.5 Redis Connection Issues

**Symptoms:**
- "NOAUTH Authentication required"
- Rate limiting not working

**Diagnosis:**
```bash
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

**Solutions:**
1. Verify REDIS_URL includes password:
   ```bash
   echo $REDIS_URL  # Should be redis://:password@host:6379/0
   ```

2. Check Redis logs:
   ```bash
   docker compose logs redis
   ```

### 7.6 Frontend Auth Loop

**Symptoms:**
- Login redirects back to login
- Session not persisting

**Diagnosis:**
```bash
# Check browser cookies
# Open DevTools → Application → Cookies

# Check Keycloak client settings
open http://localhost:8080/admin/master/console/#/resumax/clients
```

**Solutions:**
1. Verify redirect URIs match exactly
2. Check CORS settings in Keycloak client
3. Ensure frontend URL matches KEYCLOAK_URL/.well-known/openid-configuration

### 7.7 Container Memory Issues

**Symptoms:**
- Containers OOMKilled
- System becomes unresponsive

**Diagnosis:**
```bash
docker stats
```

**Solutions:**
1. Increase Docker memory limit (Docker Desktop → Settings)
2. Add resource limits to compose:
   ```yaml
   services:
     ai-service:
       deploy:
         resources:
           limits:
             memory: 2G
   ```

---

## 8. Verification Steps

### Service Health Check

```bash
# Run comprehensive health check
./scripts/verify.sh
```

**Script (scripts/verify.sh):**
```bash
#!/bin/bash

echo "=== Resumax Health Check ==="
echo ""

PASS=0
FAIL=0

check() {
    if eval "$2" > /dev/null 2>&1; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ $1"
        ((FAIL++))
    fi
}

# Database
check "PostgreSQL" "docker compose exec postgres pg_isready -U resumax"

# Redis
check "Redis" "docker compose exec redis redis-cli -a \$REDIS_PASSWORD ping"

# Keycloak
check "Keycloak" "curl -sf http://localhost:8080/health/ready"

# Temporal
check "Temporal" "curl -sf http://localhost:8088"

# Jaeger
check "Jaeger" "curl -sf http://localhost:16686"

# AI Service
check "AI Service" "curl -sf http://localhost:8000/health"

# PDF Service
check "PDF Service" "curl -sf http://localhost:8001/health"

# Frontend
check "Frontend" "curl -sf http://localhost:3000"

# MinIO
check "MinIO" "curl -sf http://localhost:9000/minio/health/live"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
```

### End-to-End Verification

1. **Auth Flow:**
   - Navigate to http://localhost:3000
   - Click "Sign In"
   - Should redirect to Keycloak
   - Login with test user
   - Should redirect back to dashboard

2. **Upload Resume:**
   - Click "Upload Resume"
   - Select a PDF file
   - Should see parsed text preview

3. **Run Optimization:**
   - Paste a job description
   - Click "Optimize"
   - Should see streaming progress
   - Should see optimized bullets

4. **Export PDF:**
   - Click "Export as PDF"
   - Should download ATS-friendly PDF

5. **Check Observability:**
   - Open http://localhost:16686 (Jaeger)
   - Should see traces for recent requests
   - Check Langfuse dashboard for LLM traces

---

## Next Phase

→ **Phase 3**: Component Contracts

Define detailed contracts (`component.yaml`) for each component including:
- Input/output schemas
- Health checks
- Smoke tests
- Golden configurations
- Upgrade notes
