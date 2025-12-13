# Use Case 2: Embedded Authentication System

## Overview

**Goal:** Build a reusable, embedded authentication capability for consumer-facing SaaS applications that Genesis agents can reliably implement.

**Key Insight:** Consumer apps need in-app login forms, not redirect-based SSO. The auth experience must be native to the application.

## Problem Statement

Most authentication solutions force users to redirect to an external login page (Keycloak, Auth0, Okta). This is fine for enterprise/internal tools but creates poor UX for consumer SaaS products where:

- Users expect branded, in-app login experiences
- Session management should be invisible
- Password reset and registration should happen inline
- Social logins should feel native

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Login form is embedded in app UI | ✅ No redirects |
| Registration is in-app | ✅ Native modal/page |
| Password reset is in-app | ✅ Email flow works |
| Session persists across refreshes | ✅ Cookie-based |
| Backend validates tokens | ✅ FastAPI middleware |
| Pattern is reusable | ✅ Drop-in module |

## Technology Choice: SuperTokens

### Why SuperTokens?

1. **Open Source** - Self-hosted, no vendor lock-in
2. **Embedded UI** - Pre-built React components or bring your own
3. **Session-based** - Cookie-based sessions (not just tokens)
4. **Full-featured** - Email/password, social, MFA, roles
5. **Multi-stack** - Works with React, Next.js, Node, Python, Go

### Comparison

| Feature | SuperTokens | Keycloak | Auth0 |
|---------|-------------|----------|-------|
| Embedded UI | ✅ Native | ❌ Redirect | ❌ Redirect |
| Open Source | ✅ Yes | ✅ Yes | ❌ No |
| Self-hosted | ✅ Yes | ✅ Yes | ⚠️ Limited |
| Session cookies | ✅ Yes | ⚠️ Token-based | ✅ Yes |
| React SDK | ✅ Excellent | ⚠️ Basic | ✅ Good |
| Python SDK | ✅ Yes | ✅ Yes | ✅ Yes |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Login Modal     │  │ Register Modal  │                   │
│  │ (in-app UI)     │  │ (in-app UI)     │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                             │
│           └────────┬───────────┘                             │
│                    │                                         │
│  ┌─────────────────▼─────────────────┐                      │
│  │      SuperTokens React SDK        │                      │
│  │   - SessionAuth wrapper           │                      │
│  │   - Pre-built UI components       │                      │
│  │   - useSessionContext hook        │                      │
│  └─────────────────┬─────────────────┘                      │
└────────────────────┼────────────────────────────────────────┘
                     │ HTTP (cookies)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                          │
│  ┌─────────────────────────────────────┐                    │
│  │    SuperTokens Python SDK          │                    │
│  │  - Session verification middleware │                    │
│  │  - User management APIs            │                    │
│  └─────────────────┬───────────────────┘                    │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SuperTokens Core (Docker)                      │
│  - User storage (Postgres)                                  │
│  - Session management                                       │
│  - Email templates                                          │
└─────────────────────────────────────────────────────────────┘
```

## Features to Implement

### Phase 1: Core Auth
- [x] Email/password sign up
- [x] Email/password login
- [x] Session management (cookies)
- [x] Logout
- [x] Protected routes (frontend)
- [x] Protected endpoints (backend)

### Phase 2: Enhanced Features
- [ ] Password reset via email
- [ ] Email verification
- [ ] Remember me
- [ ] Role-based access control

### Phase 3: Social Login (optional)
- [ ] Google OAuth
- [ ] GitHub OAuth

## API Contract

### Frontend Module
```typescript
// useAuth hook
interface UseAuth {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// SessionAuth wrapper
<SessionAuth>
  <ProtectedApp />
</SessionAuth>
```

### Backend Dependency
```python
# FastAPI dependency
from supertokens_python.recipe.session.framework.fastapi import verify_session
from supertokens_python.recipe.session import SessionContainer

@app.get("/api/protected")
async def protected_route(session: SessionContainer = Depends(verify_session())):
    user_id = session.get_user_id()
    return {"message": f"Hello {user_id}"}
```

## Docker Services

```yaml
services:
  supertokens-core:
    image: supertokens/supertokens-postgresql:7.0
    ports:
      - "3567:3567"
    environment:
      - POSTGRESQL_CONNECTION_URI=postgresql://user:pass@postgres:5432/supertokens
```

## Extraction to Catalog

After validation, extract:
1. `catalog/components/supertokens/component.yaml` - Component definition
2. `catalog/components/supertokens/snippets/` - Reusable code snippets
3. Update `catalog/blueprints/` - Add auth to SaaS blueprint

## Resources

- [SuperTokens Docs](https://supertokens.com/docs)
- [Python SDK](https://supertokens.com/docs/emailpassword/pre-built-ui/setup/backend)
- [React SDK](https://supertokens.com/docs/emailpassword/pre-built-ui/setup/frontend)
