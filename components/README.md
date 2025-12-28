# GSS Components

Genesis System SDK (GSS) provides reusable, production-ready components organized by domain.

## 📁 Directory Structure

```
components/
├── auth/           # Authentication & authorization
├── backend/        # Server-side frameworks & services
├── database/       # Data storage & caching
├── frontend/       # Client-side frameworks & UI
├── infrastructure/ # DevOps, monitoring, orchestration
├── llm/            # AI/LLM integrations
└── validation/     # Schema validation & typing
```

## 🎯 Quick Component Selection

| I need to... | Use this component |
|--------------|-------------------|
| Build a FastAPI backend | `backend/fastapi-service` |
| Build a React frontend | `frontend/react-vite` |
| Build a Next.js app | `frontend/nextjs` |
| Add PostgreSQL database | `database/postgres` |
| Add Redis caching | `database/redis` |
| Add Keycloak authentication | `auth/keycloak` |
| Add LLM with structured output | `llm/langchain/structured-output` |
| Add simple LLM calls | `llm/api-direct/openrouter` |
| Add observability | `infrastructure/opentelemetry` |
| Add workflow orchestration | `infrastructure/temporal` |
| Add Zod validation | `validation/zod` |

## 🔍 Decision Trees

### Backend Selection
```
Do you need Python?
├── YES → backend/fastapi-service
└── NO (Node.js) → backend/express-service (future)
```

### Frontend Selection
```
Do you need SSR/SEO?
├── YES → frontend/nextjs
└── NO (SPA is fine) → frontend/react-vite
```

### LLM Selection
```
Do you need structured/typed JSON output?
├── YES → llm/langchain/structured-output
│         (Uses LangChain with_structured_output for reliable Pydantic output)
└── NO (simple prompt/response)
    └── llm/api-direct/openrouter
        (Direct HTTP calls, minimal dependencies)
```

### Auth Selection
```
Do you need enterprise SSO/OIDC?
├── YES → auth/keycloak
└── NO (simple auth) → Consider NextAuth.js or similar
```

## 📖 Component Structure

Each component follows a standard structure:

```
component-name/
├── component.yaml     # Component metadata, patterns, gotchas
├── README.md          # Human-readable documentation
├── templates/         # Code templates to copy
├── schemas/           # JSON schemas (if applicable)
└── examples/          # Usage examples
```

## 🔗 Using Components

### In Blueprint Definitions

```yaml
# blueprints/my-app/blueprint.yaml
components:
  - path: backend/fastapi-service
  - path: frontend/react-vite
  - path: auth/keycloak
  - path: llm/langchain/structured-output
```

### In Genesis Core Tasks

```yaml
# Task definition
task:
  name: Add AI resume analysis
  gss_components:
    - llm/langchain/structured-output
```

## 🆕 Adding New Components

1. Identify the appropriate domain directory
2. Create component directory with standard structure
3. Add `component.yaml` with patterns and gotchas
4. Add `README.md` with usage guide
5. Update this README's quick selection table

## 📚 Domain READMEs

Each domain directory has its own README with:
- Detailed component descriptions
- Domain-specific decision guides
- Best practices for that domain
- Integration examples between components in that domain

---

*Last updated: December 2025*
