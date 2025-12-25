# Genesis System SDK

<div align="center">

### 🎯 Give AI everything it needs to develop in one shot

**Genesis** *(the beginning)* • **System** *(end-to-end integration)* • **SDK** *(AI-consumable components and blueprints)*

</div>

> An AI-native SDK of **pre-approved, production-ready components** that agents compose into complete applications — without hallucinating architecture.

---

## 🏠 Understanding GSS

**Think of GSS like building a house:**

| GSS Part | House Equivalent | What It Does |
|----------|-----------------|--------------|
| **Components** | 🔧 Major systems (plumbing, electrical) | Standalone technologies that run independently |
| **Schemas** | 📋 Building codes | Patterns you follow, not install |
| **Blueprints** | 📐 House plans | Pre-designed combinations of systems |
| **Examples** | 🏡 Model homes | Prove everything works together |

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

## 📁 Using GSS in Your Projects

**Best Practice:** Maintain a `gss/` directory in your project that mirrors the GSS structure. This serves as your project's **architectural source of truth**.

### Recommended Structure

```
my-app/
├── gss/                          # Your GSS directory
│   ├── blueprint.yaml            # 📐 Source of truth for app architecture
│   ├── components/               # 🔧 Component configs used in this project
│   │   ├── keycloak.yaml
│   │   ├── postgres.yaml
│   │   └── my-custom-api.yaml    # Your new components
│   └── schemas/                  # 📋 Patterns used in this project
│       ├── api-response.ts
│       └── my-domain-types.ts    # Your custom schemas
├── src/                          # Your application code
├── docker-compose.yml
└── ...
```

### Why This Matters

| What | Purpose |
|------|---------|
| **`blueprint.yaml`** | Single source of truth for your entire app architecture |
| **`components/`** | Config reference for each technology (ports, env vars, Docker) |
| **`schemas/`** | Type definitions and patterns your app follows |

### Development Workflow

1. **Start**: Copy relevant components and schemas from GSS into your `gss/` directory
2. **Build**: Reference these configs as you implement features  
3. **Grow**: Add your own custom components and schemas as your app evolves
4. **Update**: Keep `blueprint.yaml` current — it's what AI agents will read first

> 💡 **For AI Assistants**: The `gss/` directory gives you complete context about the project's architecture, technology choices, and configuration patterns.

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

## 🤝 Get Involved

Genesis SDK is actively looking for **contributors and maintainers**! Whether you're interested in:

- 🧩 **Adding new components** (databases, message queues, observability tools)
- 🏗️ **Creating blueprints** (SaaS starters, API platforms, data pipelines)
- 📝 **Improving documentation** (gotchas, patterns, examples)
- 🔧 **Maintaining existing code** (bug fixes, updates, reviews)

We'd love to have you on board!

### Contact

- **Email**: [yazdan@inceptium.ai](mailto:yazdan@inceptium.ai)
- **GitHub Issues**: [Report bugs or request features](https://github.com/Inceptium-ai/Genesis-System-SDK/issues)
- **GitHub Discussions**: [Ask questions or share ideas](https://github.com/Inceptium-ai/Genesis-System-SDK/discussions)

---

## 📜 License

MIT — Use freely, contribute back.

---

*Part of the [Genesis Platform](https://github.com/Inceptium-ai) — Accelerating AI-driven development*
