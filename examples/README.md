# Examples (Use Cases)

Working examples that validate Genesis SDK components and provide reference implementations.

---

## 🎯 Purpose

These examples serve **three key goals**:

### 1. 🧪 Contributor Testing
Quick-deploy environments to test changes, enhancements, and new features before submitting PRs.

```bash
# Make changes to a component
# Deploy a use case to test
cd examples/use-case-3-keycloak-auth/implementation
docker compose up -d

# Verify your changes work
# Submit your PR with confidence
```

### 2. 🤖 LLM Reference
Real working code that AI agents can learn from and reference. Every pattern shown here has been **validated to work** — no hallucinated configurations.

### 3. 📋 Copy-Paste Templates
Starting points that AI coders can copy and modify. Grab relevant pieces for your implementation without starting from scratch.

---

## 📦 Available Examples

| Example | Tests | Components Used |
|---------|-------|-----------------|
| **use-case-1-resume-optimizer** | Full stack AI webapp | FastAPI, React, Keycloak, Temporal, OTEL, Postgres, Redis |
| **use-case-2-embedded-auth** | Embedded authentication | FastAPI, React, SuperTokens patterns |
| **use-case-3-keycloak-auth** | OAuth flow + custom themes | FastAPI, React, Keycloak, Custom Theme |

---

## 🚀 Quick Start

Each example has the same structure:

```
use-case-X/
├── phase-0-use-case-definition.md   # What we're validating
├── implementation/
│   ├── docker-compose.yml           # One-command start
│   ├── config/                      # Component configs
│   └── services/                    # Custom code
└── phase-6-experiment-report.md     # Findings & gotchas
```

### Running an Example

```bash
cd examples/use-case-3-keycloak-auth/implementation

# Start all services
docker compose up -d

# Access points
open http://localhost:3000    # Frontend
open http://localhost:8000    # Backend API
open http://localhost:8080    # Keycloak Admin

# Tear down
docker compose down -v
```

---

## 🔧 For Contributors

### Testing Component Changes

1. **Make changes** to a component in `/components`
2. **Pick a relevant example** that uses that component
3. **Deploy the example** with your changes
4. **Verify functionality** — does it still work?
5. **Update the example** if behavior changed
6. **Submit PR** with both component and example updates

### Adding New Examples

When adding a new component or integration pattern:

1. Create `use-case-N-{descriptive-name}/`
2. Write `phase-0-use-case-definition.md` — what you're validating
3. Implement in `implementation/` with working docker-compose
4. Document findings in `phase-6-experiment-report.md`
5. Submit PR

---

## 🤖 For AI Agents

### How to Use These Examples

When building an application:

1. **Identify relevant components** from `/components`
2. **Find an example** that uses similar patterns
3. **Copy the integration patterns** — configs, docker-compose snippets, code
4. **Adapt to your use case** — change names, add features

### What's Validated

Every example has been:
- ✅ Built and deployed successfully
- ✅ Tested for basic functionality
- ✅ Documented with gotchas and lessons learned

Trust these patterns — they work.

---

## 📚 Example Details

### Use Case 1: Resume Optimizer (Resumax)

**Purpose:** Validate full Blueprint C stack

**Components:** FastAPI + React + Keycloak + Postgres + Redis + Temporal + OpenTelemetry

**Key Learnings:**
- Keycloak realm configuration patterns
- Temporal workflow integration
- OpenTelemetry tracing setup
- Multi-container orchestration

### Use Case 2: Embedded Auth

**Purpose:** Validate embedded authentication patterns (SuperTokens-style)

**Components:** FastAPI + React + SuperTokens integration

**Key Learnings:**
- Session-based auth in SPA
- Cookie handling patterns
- Auth UI embedding

### Use Case 3: Keycloak Auth

**Purpose:** Validate OAuth2/OIDC flow + custom theming

**Components:** FastAPI + React + Keycloak + Custom Theme

**Key Learnings:**
- keycloak-js integration
- JWT validation in FastAPI
- CSS-only custom themes (no FreeMarker)
- Silent SSO check

---

## 📝 Example File Reference

### docker-compose.yml
The main entry point. One command to start everything.

### config/
Component-specific configurations:
- `keycloak/realm.json` — Realm export with clients, roles
- `postgres/init.sql` — Database initialization
- `otel/collector.yaml` — Tracing configuration

### services/
Custom application code:
- `frontend/` — React application
- `backend/` — FastAPI application
- `ai-service/` — LLM integration service

---

*Part of the Genesis System SDK*
