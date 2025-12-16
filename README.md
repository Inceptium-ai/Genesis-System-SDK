# Genesis System SDK

<div align="center">

### 🎯 Give AI everything it needs to develop in one shot

**Genesis** *(the beginning)* • **System** *(end-to-end integration)* • **SDK** *(AI-consumable components and blueprints)*

</div>

> An AI-native SDK of **pre-approved, production-ready components** that agents compose into complete applications — without hallucinating architecture.

---

## 🚀 Quick Start

```bash
git clone https://github.com/Inceptium-ai/Genesis-System-SDK.git
cd Genesis-System-SDK/blueprints/blueprint-c-ai-webapp
cp .env.example .env
docker compose up -d

# Access: localhost:3000 (Frontend) | localhost:8000 (API) | localhost:8080 (Keycloak)
```

---

## 🤖 Building with AI

Using Cline, Cursor, or another AI coding assistant? See **[START_PROMPT.md](START_PROMPT.md)** for a ready-to-use prompt.

---

## 📦 What's in the SDK

| Folder | Purpose |
|--------|---------|
| `components/` | Standalone building blocks (auth, DB, frontend, etc.) |
| `blueprints/` | Pre-wired application stacks |
| `schemas/` | Reusable TypeScript patterns |
| `examples/` | Working reference implementations |

---

## 🧩 Available Components

| Component | Description |
|-----------|-------------|
| `fastapi-ai-service` | Python API with LLM integration |
| `react-vite-frontend` | React + Vite SPA with Tailwind |
| `nextjs-frontend` | Next.js 14 App Router |
| `keycloak` | OIDC auth, SSO, RBAC |
| `postgres` | PostgreSQL database |
| `redis` | Cache, rate limiting, sessions |
| `temporal` | Durable workflow orchestration |
| `opentelemetry` | Distributed tracing |

Each component has a `component.yaml` contract that defines ports, env vars, Docker config, and integration patterns.

---

## 🔑 Why GSS?

- **No hallucinated architecture** — AI selects from pre-tested components
- **Production-ready from day one** — Auth, DB, and observability included
- **Contracts over tutorials** — `component.yaml` files AI agents can consume

---

## 📖 Documentation

- **[AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md)** — How AI agents should use GSS
- **[SPEC.md](SPEC.md)** — Component and blueprint specification
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute

---

## 📜 License

MIT — Use freely, contribute back.

---

*Part of the [Genesis Platform](https://github.com/Inceptium-ai) — Accelerating AI-driven development*
