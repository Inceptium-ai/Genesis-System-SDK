# AI Agent Instructions for Genesis System SDK

> **Read this first before implementing anything with GSS.**

This document explains how AI agents should use the Genesis System SDK to build applications. It covers what to copy verbatim, what to adapt, and how to navigate the SDK effectively.

---

## 🎯 What This SDK Is

**Genesis System SDK** is an AI-native standard library for building full-stack applications. It provides:
- **Components**: Fundamental building blocks (auth, database, frontend frameworks)
- **Blueprints**: Pre-wired application stacks (starter kits)
- **Schemas/Patterns**: Reusable TypeScript code patterns
- **Examples**: Domain-specific reference implementations

**Your goal**: Assemble applications from these tested primitives rather than generating architecture from scratch.

---

## 🧭 Navigation: Where to Find What

```
Genesis-System-SDK/
│
├── components/           ← START HERE for specific technologies
│   ├── nextjs-frontend/    (Next.js 14 App Router patterns)
│   ├── react-vite-frontend/ (React SPA patterns)
│   ├── keycloak/           (Authentication/OIDC)
│   ├── fastapi-ai-service/ (Python AI backend)
│   ├── postgres/           (Database)
│   ├── redis/              (Caching)
│   └── ...
│
├── blueprints/           ← START HERE for full application stacks
│   └── blueprint-c-ai-webapp/
│
├── schemas/patterns/     ← Copy these TypeScript patterns
│   ├── api-response.ts     (API response wrapper)
│   ├── pagination.ts       (Pagination helpers)
│   ├── defensive-coding.ts (Null-safety utilities)
│   ├── error-boundary.tsx  (React error handling)
│   └── auth-user.ts        (Auth user shapes)
│
└── examples/             ← Reference for domain-specific code
    ├── use-case-1-resume-optimizer/
    └── ...
```

---

## 🚀 Implementation Workflow

### Step 1: Identify the Stack

**For a common app type**, start with a blueprint:
```
blueprints/blueprint-c-ai-webapp/  → Full AI web app stack
```

**For a custom stack**, identify needed components:
```
- Need auth? → components/keycloak/
- Need Next.js? → components/nextjs-frontend/
- Need Python API? → components/fastapi-ai-service/
```

### Step 2: Read the component.yaml

Every component has a `component.yaml` file. Read these sections in order:

1. **description** - What does this component do?
2. **environment** - What env vars are required?
3. **docker** - The Docker Compose snippet
4. **patterns** - Integration code examples
5. **gotchas** - ⚠️ READ THIS BEFORE IMPLEMENTING
6. **troubleshooting** - Common issues and fixes

### Step 3: Copy or Adapt

See the detailed guide below for what to copy exactly vs. what to adapt.

### Step 4: Verify

Use the `tests.smoke` section in component.yaml to verify the implementation works.

---

## 🔒 What to COPY EXACTLY (Don't Modify)

These elements are tested together and should be used as-is:

### Docker Compose Snippets
```yaml
# From component.yaml docker.compose_snippet
# COPY EXACTLY - ports, service names, health checks
```

### Package.json Dependencies (Pinned Versions)
```json
{
  "dependencies": {
    "react": "18.2.0",        // ← Keep exact version
    "next": "14.0.4",         // ← Keep exact version
    "keycloak-js": "24.0.4"   // ← Keep exact version
  }
}
```

### Environment Variable Names
```env
KEYCLOAK_URL=             # ← Name must match exactly
KEYCLOAK_REALM=           # ← Name must match exactly
NEXT_PUBLIC_KEYCLOAK_URL= # ← Prefix matters for Next.js
```

### Static Files
```
public/silent-check-sso.html  ← Copy exactly from component.yaml
```

### Port Configurations
```yaml
ports:
  default: 8080
  alternate: 8084  # Use this if default conflicts
```

---

## 🔧 What to ADAPT & CUSTOMIZE

These should be modified based on the specific application:

### Application Names
```yaml
# Change these to your app name
APP_NAME=my-app
container_name: my-app-frontend
```

### Business Logic
All business logic goes in your implementation, not from GSS:
```typescript
// This is YOUR code, not from GSS
async function processResume(text: string) {
  // Domain-specific logic here
}
```

### UI Components and Styling
GSS provides patterns, but styling is yours:
```tsx
// Pattern from GSS:
function ErrorBoundary({ children }) { ... }

// Your styling:
<div className="your-custom-classes">
```

### Route Structures
Use patterns as inspiration, adapt URLs to your domain:
```
GSS pattern:     /[id]/page.tsx
Your app:        /resumes/[resumeId]/page.tsx
```

### Domain Models and Schemas
GSS provides structural patterns, you provide domain types:
```typescript
// From GSS schemas/patterns/api-response.ts:
export interface ApiResponse<T> { ... }

// Your domain type:
interface Resume { ... }

// Combined:
const response: ApiResponse<Resume> = await fetch('/api/resumes');
```

---

## 📖 What to REFERENCE (Don't Copy Directly)

Read and understand, but implement appropriately for your context:

### Patterns in component.yaml
The `patterns` section shows how integrations work. Understand the concept, then implement for your specific use case.

### Gotchas Section
**ALWAYS READ THIS BEFORE IMPLEMENTING.** These are hard-won lessons:
```yaml
gotchas:
  - issue: keycloak-js initializes twice in Next.js dev mode
    cause: Hot Module Replacement
    solution: Use singleton pattern with initPromise
```

### Troubleshooting Section
Reference when you encounter issues:
```yaml
troubleshooting:
  - symptom: CORS error on login
    solution: Check Web Origins in Keycloak admin
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Don't: Change Pinned Versions
```json
// BAD - Will cause compatibility issues
"keycloak-js": "^24.0.0"

// GOOD - Use exact pinned version from component.yaml
"keycloak-js": "24.0.4"
```

### ❌ Don't: Skip the Gotchas Section
Many hours of debugging are encoded in gotchas. Read them first.

### ❌ Don't: Put Domain Logic in Components
```
BAD:  components/keycloak/resume-auth.ts    ← Resume shouldn't be in Keycloak
GOOD: examples/resume-optimizer/src/auth.ts ← Domain logic in your app
```

### ❌ Don't: Ignore Port Conflicts
```yaml
# If port 8080 is in use:
ports:
  - "8084:8080"  # Use alternate from component.yaml
```

### ❌ Don't: Use || Instead of ?? for Defaults
```typescript
// BAD - Empty string becomes 'default'
const name = user.name || 'default';

// GOOD - Only null/undefined becomes 'default'
const name = user.name ?? 'default';
```

---

## ✅ Verification Steps

After implementing, verify each component works:

### 1. Docker Services Start
```bash
docker compose up -d
docker compose ps  # All services should be "Up" or "healthy"
```

### 2. Health Checks Pass
```bash
# From component.yaml tests.smoke section
curl -sf http://localhost:8080/health/ready  # Keycloak
curl -sf http://localhost:3000               # Frontend
curl -sf http://localhost:8000/health        # Backend
```

### 3. Integration Works
```bash
# Test auth flow
# Test API endpoints
# Test frontend renders
```

---

## 📋 Quick Reference: Component Reading Order

When implementing a component, read the component.yaml in this order:

| Order | Section | Why |
|-------|---------|-----|
| 1 | `description` | Understand what it does |
| 2 | `ports` | Know the networking |
| 3 | `environment` | Set up required config |
| 4 | `docker` | Get the compose snippet |
| 5 | `gotchas` | Avoid known pitfalls |
| 6 | `patterns` | See integration code |
| 7 | `tests` | Know how to verify |
| 8 | `troubleshooting` | Reference if issues |

---

## 🔄 When to Update Components

If you discover issues while building an application:

1. **Missing gotcha?** → Add to component.yaml gotchas section
2. **Unclear pattern?** → Improve the patterns section
3. **New integration?** → Add to patterns section
4. **Common error?** → Add to troubleshooting section

This feedback loop improves GSS for everyone.

---

## 📚 Schema/Pattern Usage

### How to Use schemas/patterns/*.ts Files

1. **Copy** the file to your project's `src/lib/` or `src/types/`
2. **Import** the types/functions you need
3. **Adapt** if necessary for your specific types

```typescript
// Copy defensive-coding.ts to src/lib/utils.ts
// Then use:
import { isEmpty, valueOrDefault, getSafeUser } from '@/lib/utils';

const user = getSafeUser(session);
const content = valueOrDefault(apiData?.content, defaultContent);
```

### Pattern Files Available

| Pattern | Use Case |
|---------|----------|
| `api-response.ts` | Wrap all API responses consistently |
| `pagination.ts` | Add pagination to list endpoints |
| `auth-user.ts` | Handle authenticated user state |
| `defensive-coding.ts` | Prevent null/undefined errors |
| `error-boundary.tsx` | Catch React render errors |

---

## 🎯 Summary: The GSS Approach

1. **Components are building blocks** - Use them for any app type
2. **Blueprints are starter kits** - Fork and customize
3. **Schemas are patterns** - Copy into your project
4. **Examples are references** - Learn from, don't copy wholesale
5. **Gotchas are gold** - Always read before implementing
6. **Pinned versions matter** - Don't change them
7. **Verify after implementing** - Use smoke tests

---

*This document should be read by AI agents before using any GSS component. When in doubt, check the component.yaml for authoritative guidance.*
