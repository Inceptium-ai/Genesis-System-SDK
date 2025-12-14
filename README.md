# Genesis System SDK

<div align="center">

### 🎯 Give AI everything it needs to develop in one shot

**Genesis** *(the beginning)* • **System** *(end-to-end integration)* • **SDK** *(AI-consumable components and blueprints)*

</div>

> An AI-native SDK of **pre-approved, production-ready components** that agents compose into complete applications — without hallucinating architecture.

Genesis is not another framework. It's an **SDK designed for AI agents** — a standard library of primitives that work together out of the box.

---

## 🧠 The Vision

Traditional SDKs give **humans** APIs, helpers, and documentation.

Genesis gives **AI systems**:
- **Pre-approved components** with known-good integration patterns
- **Contracts + tests** that define exactly what works
- **Opinionated defaults** that prevent architectural mistakes
- **Composable blueprints** for common application patterns

Agents don't *learn how to build apps*. They **select from a known set of primitives** and assemble them.

---

## 📦 What's in the SDK

```
Genesis-System-SDK/
├── components/           # AI-consumable SDK modules
│   ├── fastapi-ai-service/
│   ├── react-vite-frontend/
│   ├── keycloak/
│   ├── keycloak-custom-theme/
│   ├── postgres/
│   ├── redis/
│   ├── temporal/
│   └── opentelemetry/
│
├── blueprints/           # Composed SDK bundles
│   └── blueprint-c-ai-webapp/
│
├── schemas/              # JSON schemas for validation
└── docs/                 # Guides and specifications
```

---

## 🧩 Components = SDK Modules

Each component is an AI-consumable SDK module:

| SDK Concept | Genesis Equivalent |
|-------------|-------------------|
| API surface | `component.yaml` contract |
| Config options | Input schema |
| Return values | Output schema |
| Examples | Reference use cases |
| Documentation | Integration playbooks |
| Tests | Golden smoke tests |

### Available Components (9 total)

| Component | Description | Category |
|-----------|-------------|----------|
| **fastapi-ai-service** | Python API with LLM integration | Backend |
| **react-vite-frontend** | React + TypeScript + Tailwind | Frontend |
| **keycloak** | OIDC auth, SSO, RBAC | Identity |
| **keycloak-custom-theme** | CSS-only theme customization | Identity |
| **postgres** | PostgreSQL database | Infrastructure |
| **redis** | Cache, rate limiting, sessions | Infrastructure |
| **temporal** | Durable workflow orchestration | Workflow |
| **opentelemetry** | Distributed tracing | Observability |

---

## 🧱 Blueprints = Composed Stacks

Blueprints are pre-configured application stacks, similar to `create-next-app` or `rails new` — but **cross-stack**.

### Blueprint C: AI Web Application

```yaml
blueprint: ai-webapp
includes:
  - fastapi-ai-service
  - react-vite-frontend
  - keycloak
  - postgres
  - redis
  - temporal
  - opentelemetry
```

Gives you: A complete AI-powered web app with auth, workflows, caching, and observability.

---

## 🚀 Quick Start

```bash
# Clone the SDK
git clone https://github.com/Petaflopminingco/Genesis-System-SDK.git
cd Genesis-System-SDK

# Use a blueprint
cd blueprints/blueprint-c-ai-webapp
cp .env.example .env
# Add your OPENROUTER_API_KEY

docker compose up -d

# Access
open http://localhost:3000   # Frontend
open http://localhost:8000   # API
open http://localhost:8080   # Keycloak
```

---

## 📑 Component Contract Standard

Every component has a `component.yaml` defining its contract:

```yaml
apiVersion: genesis.ai/v1
kind: Component
metadata:
  name: component-name
  version: 1.0.0
  category: backend | frontend | identity | infrastructure | workflow | observability
  
spec:
  # What the component provides
  description: ...
  
  # Required dependencies
  dependencies:
    required: [...]
    optional: [...]
  
  # Configuration schema
  config:
    ports: {...}
    environment: {...}
  
  # Docker Compose snippet
  docker_compose: {...}
  
  # Integration patterns
  patterns: {...}
  
  # Implementation guide for agents
  implementation_instructions: |
    ...
```

---

## 🔑 Why This Matters

### Most AI app builders fail because:
- Agents hallucinate architecture
- Auth is reinvented badly
- Edge cases pile up
- Integrations rot

### Genesis avoids this by:
- **Restricting choice** to known-good options
- **Encoding institutional knowledge** in contracts
- **Treating integrations as first-class artifacts**
- **Testing every path**

That's what *real SDKs* do — adapted for AI.

---

## 🧪 Contributing

Components are validated through **use cases** — real application scenarios that prove the components work together.

1. **Fork the repo**
2. **Create a branch** for your component
3. **Write the `component.yaml`** following the standard
4. **Test with an existing use case** (or create a new one)
5. **Submit a PR** with your validation results

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

---

## 📊 Industry Position

Genesis sits between:
- **LangChain** → LLM orchestration SDK
- **Firebase/Supabase** → Backend SDKs
- **Rails/Django** → Opinionated frameworks

...but for **end-to-end systems**, not single layers.

There is currently **no dominant "AI app SDK"** at this level. Genesis is carving that space.

---

## 📜 License

MIT — Use freely, contribute back.

---

*Part of the Genesis Platform — Accelerating AI-driven development*
