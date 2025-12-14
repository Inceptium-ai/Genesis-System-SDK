# Contributing to Genesis System SDK

Welcome to the Genesis System SDK! This guide explains the philosophy behind GSS, what goes where, and how to contribute effectively.

---

## 🧠 The GSS Philosophy

### Why GSS Exists

Traditional development involves AI agents hallucinating architecture, reinventing auth poorly, and creating integration debt. GSS exists to give AI systems **pre-approved, production-ready building blocks** that work together out of the box.

### The Core Principle: Use-Case Agnostic

> **Components and Schemas must work for ANY application, not just yours.**

This is the foundational rule of GSS. When you build a Resume Builder, E-commerce platform, or CRM - they all need:
- Authentication (Keycloak)
- Databases (Postgres)
- API patterns (response wrappers, pagination)
- Error handling (error boundaries, defensive coding)

GSS extracts these universal patterns so AI agents can assemble applications without reinventing fundamentals.

---

## 📁 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            EXAMPLES                                      │
│                                                                          │
│    Domain-specific implementations that PROVE components work            │
│    (Resume Optimizer, E-commerce, CRM, etc.)                            │
│                                                                          │
│    ✅ Business logic lives here                                         │
│    ✅ Domain models live here (Resume, Product, Contact)                │
│    ✅ Custom UI specific to use case                                    │
│                                                                          │
│                           ↑ Implements ↑                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                           BLUEPRINTS                                     │
│                                                                          │
│    White-label starter kits / app templates                             │
│    Compose multiple components into working stacks                       │
│    (ai-webapp, saas-platform, data-pipeline)                            │
│                                                                          │
│    ✅ Docker Compose configurations                                     │
│    ✅ Pre-wired component integrations                                  │
│    ✅ Customizable for specific use cases                               │
│                                                                          │
│                           ↑ Composes ↑                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                            SCHEMAS                                       │
│                                                                          │
│    Reusable TypeScript patterns & JSON validators                       │
│    (api-response, pagination, defensive-coding, error-boundary)         │
│                                                                          │
│    ✅ Framework-agnostic patterns                                       │
│    ✅ Copy into any project                                             │
│    ❌ No domain-specific types                                          │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                           COMPONENTS                                     │
│                                                                          │
│    Fundamental building blocks - MAXIMUM AGNOSTICISM                    │
│    (keycloak, postgres, nextjs-frontend, redis, temporal)               │
│                                                                          │
│    ✅ Works for ANY application                                         │
│    ✅ Complete documentation (gotchas, patterns, tests)                 │
│    ✅ Integration guidance for common pairings                          │
│    ❌ No business logic                                                 │
│    ❌ No domain-specific code                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 What Goes Where

### Decision Tree

When contributing, ask yourself:

```
Is this specific to a domain (Resume, Product, Order)?
  └─ YES → Goes in /examples/
  └─ NO → Continue...

Does this compose multiple components into a stack?
  └─ YES → Goes in /blueprints/
  └─ NO → Continue...

Is this a code pattern (TypeScript, React)?
  └─ YES → Goes in /schemas/patterns/
  └─ NO → Continue...

Is this a validation schema (JSON Schema)?
  └─ YES → Goes in /schemas/validation/
  └─ NO → Continue...

Is this a standalone technology/service?
  └─ YES → Goes in /components/
```

### Quick Reference

| What You're Adding | Location | Specificity Level |
|-------------------|----------|-------------------|
| Postgres setup, patterns | `/components/postgres/` | 100% agnostic |
| API response wrapper | `/schemas/patterns/api-response.ts` | 100% agnostic |
| AI webapp starter kit | `/blueprints/ai-webapp/` | Semi-agnostic (customizable) |
| Resume data model | `/examples/resume-optimizer/` | Domain-specific |
| Keycloak + Next.js auth | `/components/keycloak/` (patterns section) | 100% agnostic |
| Shopping cart logic | `/examples/ecommerce/` | Domain-specific |

---

## 🧩 Contributing Components

Components are the **most important** part of GSS. They must be:

1. **Technology-specific, domain-agnostic**: `keycloak` knows about OAuth/OIDC, not about resumes
2. **Completely documented**: Gotchas, patterns, tests, troubleshooting
3. **AI-consumable**: Written so AI agents can implement without guessing

### Component Structure

```
components/
└── my-component/
    └── component.yaml    # Required: The complete component specification
```

### Required Sections in component.yaml

```yaml
# =============================================================================
# Component Header
# =============================================================================
name: my-component
version: 1.0.0
category: backend | frontend | identity | infrastructure | workflow | observability
validated: YYYY-MM-DD  # Date validated in a real example

description: |
  One paragraph explaining what this component does and when to use it.

# =============================================================================
# Ports & Networking
# =============================================================================
ports:
  default: 8080
  alternate: 8084  # For port conflicts
  conflicts_note: |
    Common conflicts and how to resolve them

# =============================================================================
# Environment Variables
# =============================================================================
environment:
  required:
    - name: MY_VAR
      description: What this is for
      sensitive: true/false
  optional:
    - name: MY_OPT_VAR
      default: "value"

# =============================================================================
# Docker
# =============================================================================
docker:
  image: official/image:tag
  compose_snippet: |
    # Ready-to-paste Docker Compose YAML

# =============================================================================
# Integration Patterns
# =============================================================================
patterns:
  pattern_name: |
    # Complete, runnable code examples
    # Not fragments - full implementations

# =============================================================================
# Gotchas
# =============================================================================
gotchas:
  - issue: What can go wrong
    cause: Why it happens
    solution: How to fix it

# =============================================================================
# Troubleshooting
# =============================================================================
troubleshooting:
  - symptom: What user sees
    cause: Root cause
    solution: Fix steps

# =============================================================================
# Tests
# =============================================================================
tests:
  smoke:
    - name: Basic functionality works
      command: curl -sf http://localhost:8080/health
      expected: "200"

# =============================================================================
# Implementation Instructions
# =============================================================================
implementation_instructions: |
  Step-by-step guide for AI agents implementing this component
```

### Component Checklist

Before submitting a component PR:

- [ ] **Name is generic** - `postgres` not `resume-database`
- [ ] **Version is pinned** - `24.0.x` not `latest`
- [ ] **Ports documented** - Including conflict resolution
- [ ] **Environment vars complete** - Required and optional
- [ ] **Docker snippet ready** - Copy-paste into docker-compose.yml
- [ ] **Patterns are complete** - Full files, not fragments
- [ ] **Gotchas documented** - Every trap you've encountered
- [ ] **Smoke tests exist** - Can verify it works
- [ ] **Validated in an example** - Proven in real use case

---

## 🏗️ Contributing Blueprints

Blueprints are **white-label starter kits** that compose multiple components. Think `create-react-app` but for entire application stacks.

### Blueprint Purpose

- Show how components work together
- Provide copy-paste-ready application foundations
- Include Docker Compose for entire stack
- Serve as templates for specific app types

### Blueprint Structure

```
blueprints/
└── my-blueprint/
    ├── blueprint.yaml       # Blueprint specification
    ├── docker-compose.yml   # Complete stack
    ├── .env.example         # Required environment variables
    └── README.md            # Getting started guide
```

### When to Create a Blueprint vs Extend Existing

**Create new blueprint when:**
- Fundamentally different architecture (e.g., serverless vs containerized)
- Different technology stack (e.g., Python-only vs Full-stack JS)
- Distinct use case category (e.g., data pipeline vs web app)

**Extend existing blueprint when:**
- Adding optional component (e.g., add Redis to ai-webapp)
- Improving integration patterns
- Fixing issues in existing setup

---

## 📚 Contributing Examples

Examples are **domain-specific implementations** that prove the SDK works for real applications.

### Example Purpose

- Validate that components work together
- Provide reference implementations
- Discover gaps in component documentation
- Show complete, working applications

### Example Structure

```
examples/
└── use-case-N-name/
    ├── README.md           # What this example demonstrates
    ├── docker-compose.yml  # Complete runnable stack
    └── [application code]  # The actual implementation
```

### Examples Are Feedback Generators

When building an example, you'll discover:
- Missing gotchas → Add to component
- Unclear patterns → Improve component documentation
- Common code patterns → Extract to schemas/patterns/
- Integration gaps → Document in component

**This feedback loop is critical!** Examples improve components.

---

## 📐 Contributing Schemas/Patterns

Patterns are **reusable TypeScript code** that applies across any domain.

### Pattern Criteria

Ask these questions before adding a pattern:

1. **Is it domain-agnostic?**
   - ✅ `ApiResponse<T>` - works for any data type
   - ❌ `ResumeResponse` - specific to resumes

2. **Would ANY app benefit?**
   - ✅ `pagination.ts` - every list API needs this
   - ❌ `jobMatch.ts` - only resume/job apps need this

3. **Does it solve a common gotcha?**
   - ✅ `defensive-coding.ts` - prevents null/undefined errors
   - ❌ `myUtility.ts` - convenience not necessity

### Pattern Structure

```typescript
/**
 * Genesis SDK - Pattern Name
 * 
 * Clear description of what this pattern does.
 * When to use it and how to use it.
 * 
 * Copy to your project's src/lib/ or src/types/ directory.
 */

// =============================================================================
// SECTION NAME
// =============================================================================

// Fully typed, documented exports
export interface MyPattern<T> { ... }
export function myHelper<T>(...): T { ... }

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Example usage in real code
const result = myHelper(data);
*/
```

---

## 🔄 The Feedback Loop

```
      ┌─────────────────────────────────────────┐
      │                                         │
      │  1. Build Example using Components      │
      │                                         │
      └──────────────────┬──────────────────────┘
                         │
                         ▼
      ┌─────────────────────────────────────────┐
      │                                         │
      │  2. Discover Gaps/Issues                │
      │     - Missing gotchas                   │
      │     - Unclear patterns                  │
      │     - Integration problems              │
      │                                         │
      └──────────────────┬──────────────────────┘
                         │
                         ▼
      ┌─────────────────────────────────────────┐
      │                                         │
      │  3. Fix Components/Schemas              │
      │     - Add documentation                 │
      │     - Add patterns                      │
      │     - Add tests                         │
      │                                         │
      └──────────────────┬──────────────────────┘
                         │
                         ▼
      ┌─────────────────────────────────────────┐
      │                                         │
      │  4. Try Next Example                    │
      │     (Should be easier!)                 │
      │                                         │
      └──────────────────┬──────────────────────┘
                         │
                         └──────────► Loop back to 1
```

---

## ✅ Quality Checklist

### For All Contributions

- [ ] Follows the appropriate structure for its type
- [ ] Has clear, accurate documentation
- [ ] Works end-to-end (tested)
- [ ] Doesn't break existing functionality

### For Components

- [ ] Templates have **pinned versions** (not `^` or `latest`)
- [ ] **Gotchas** section is populated
- [ ] **Smoke tests** exist and pass
- [ ] **Port conflicts** are documented
- [ ] Validated in at least one example

### For Blueprints

- [ ] Docker Compose starts all services
- [ ] `.env.example` has all required vars
- [ ] README explains getting started
- [ ] Health checks pass for all services

### For Examples

- [ ] Demonstrates real use case
- [ ] Documents gaps discovered (in PR description)
- [ ] Works with `docker compose up`

### For Patterns

- [ ] 100% domain-agnostic
- [ ] Fully typed (TypeScript)
- [ ] Has usage examples
- [ ] Solves common problem

---

## 🚀 PR Process

### Branch Naming

```
component/keycloak-nextjs-patterns
blueprint/ai-webapp-redis
example/resume-optimizer
pattern/defensive-coding
fix/keycloak-typo
docs/contributing-guide
```

### Commit Message Format

```
type: Short description

Longer description if needed.

- Bullet points for multiple changes
- Another change

Closes #123 (if applicable)
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### What Reviewers Look For

1. **Correct placement** - Is this in the right directory?
2. **Agnosticism** - Is it domain-agnostic (if required)?
3. **Completeness** - Are gotchas, tests, patterns included?
4. **Quality** - Is the code clean, documented, tested?
5. **Integration** - Does it work with existing components?

---

## 🤖 Writing for AI Agents

Remember: **AI agents are the primary consumers of GSS.**

### Do:
- Write explicit, unambiguous instructions
- Provide complete, copy-paste code
- Document every decision and edge case
- Use consistent naming conventions
- Include verification commands

### Don't:
- Leave implementation details "obvious"
- Use fragments that need context
- Assume prior knowledge
- Use inconsistent patterns across components

### The Test

Ask yourself: *"Could an AI agent implement this from the component.yaml alone, without searching the web or guessing?"*

If no, add more documentation.

---

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Ideas**: Open a GitHub Discussion first to gauge interest

---

*Thank you for contributing to Genesis System SDK! Together, we're building the standard library for AI-driven development.*
