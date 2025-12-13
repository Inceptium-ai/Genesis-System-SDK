# Use Case 3: Keycloak Enterprise Auth

## Objective
Demonstrate Keycloak integration for enterprise-grade authentication with:
- Built-in admin console (zero custom code)
- User self-registration
- OIDC/JWT token-based auth
- Role-based access control (RBAC)

## Why Keycloak over SuperTokens?
| Feature | Keycloak | SuperTokens |
|---------|----------|-------------|
| Admin Console | ✅ Built-in | ❌ Custom code needed |
| User Management | ✅ Zero code | ❌ Build your own |
| RBAC | ✅ Built-in | ❌ Roll your own |
| SSO/SAML | ✅ Enterprise | ⚠️ Limited |
| Resource Usage | ~500MB | ~50MB |

## Components Used
- **Keycloak** - Identity Provider with admin console
- **Postgres** - Keycloak database
- **React + Vite** - Frontend with keycloak-js client
- **FastAPI** - Backend with JWT verification

## Integration Pattern
```
User → React App → Keycloak Login → JWT Token → FastAPI (verify JWT)
                      ↓
              Admin Console (built-in)
```

## Expected Outcome
1. User can sign up / sign in via Keycloak
2. Frontend receives JWT token
3. Backend validates JWT and extracts user info
4. Admin can manage users at Keycloak admin console
5. Zero custom auth code in the application!

## Ports
- Frontend: 5176
- Backend: 8002
- Keycloak: 8080
- Keycloak Admin: http://localhost:8080/admin (admin/admin)
