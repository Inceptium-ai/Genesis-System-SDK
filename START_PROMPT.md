# GSS Start Prompt

> Copy and paste the prompt below into your AI coding assistant (Cline, Cursor, Claude, etc.) to start building with Genesis System SDK.

---

## The Prompt

```
I want to build an app using Genesis System SDK (GSS).

**Repository:** https://github.com/Inceptium-ai/Genesis-System-SDK.git

**My idea:** "<describe your app idea here>"

---

**GSS Implementation Instructions:**

1. Clone/fetch the GSS repo and read `AI_INSTRUCTIONS.md` first — this is your behavioral contract
2. Review available components in `/components` and their `component.yaml` files
3. For a full-stack AI web app, start with `blueprints/blueprint-c-ai-webapp`
4. **Always read the `gotchas` section** in component.yaml before implementing
5. Copy Docker configs and pinned package versions **exactly** — only adapt business logic
6. Use patterns from `/schemas/patterns/` for API responses, pagination, and error handling
7. Verify each component works using smoke tests from component.yaml
8. **Set up a `gss/` directory in the project root** to maintain architectural documentation:
   - Copy `blueprint.yaml` and customize for this project
   - Include component configs for each technology used (e.g., `keycloak.yaml`, `postgres.yaml`)
   - Add schemas/patterns being used
   - **Update `gss/blueprint.yaml` as the architecture evolves** — this is the project's source of truth
   - Add new custom components and schemas as the app grows

**Help me:**
- Select the appropriate GSS components for my idea
- **Set up the `gss/` directory structure** for maintaining architecture documentation
- Set up the project structure following GSS patterns
- Create a working docker-compose.yml
- Generate environment configuration (.env.example)
- Build the core functionality
- Create a README with setup instructions
```

---

## Available Components

| Component | Use For |
|-----------|---------|
| `fastapi-ai-service` | Python API with LLM integration |
| `react-vite-frontend` | React SPA with Tailwind |
| `nextjs-frontend` | Next.js 14 App Router |
| `keycloak` | Authentication, SSO, RBAC |
| `postgres` | Database |
| `redis` | Caching, rate limiting |
| `temporal` | Workflow orchestration |
| `opentelemetry` | Distributed tracing |

---

## Example Ideas

**AI SaaS Dashboard:**
> "A SaaS analytics dashboard with user authentication, role-based access control, and AI-powered data insights"

**Resume Optimizer:**
> "A resume optimization tool that uses LLMs to improve resume content and match job descriptions"

**Workflow Automation:**
> "A project management app with automated task workflows and team collaboration features"

**Content Platform:**
> "A content creation platform with AI writing assistance and multi-user collaboration"

---

## Quick Reference

- **Full stack AI app?** → Use `blueprint-c-ai-webapp`
- **Need auth?** → Include `keycloak` component
- **Python backend?** → Use `fastapi-ai-service`
- **TypeScript patterns?** → Check `/schemas/patterns/`
- **Having issues?** → Read `troubleshooting` section in component.yaml

---

*Part of the [Genesis System SDK](https://github.com/Inceptium-ai/Genesis-System-SDK) — Accelerating AI-driven development*
