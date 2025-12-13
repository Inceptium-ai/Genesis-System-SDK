# Use Case 3: Keycloak Auth Demo - Experiment Report

**Date:** December 13, 2025  
**Status:** ✅ Complete  
**Components Tested:** Keycloak, React (keycloak-js), FastAPI (JWT validation)

---

## 📋 Executive Summary

This experiment validated the **standard OAuth 2.0 flow** with Keycloak for SPA (Single Page Application) authentication. We successfully implemented:
- React frontend with keycloak-js integration
- FastAPI backend with JWT token verification
- Custom Keycloak theme for app-native look and feel
- Docker Compose orchestration for all services

---

## ✅ What Worked Well

### 1. Standard OAuth Flow with keycloak-js
- Clean integration using `@react-keycloak/web` provider
- Automatic token management and refresh
- PKCE support out of the box

### 2. Custom Theme Implementation
- CSS-only customization extends Keycloak's default theme
- Theme mounted via Docker volume: `./themes:/opt/keycloak/themes`
- Realm config specifies theme: `"loginTheme": "genesis"`

### 3. JWT Validation in FastAPI
- `python-jose` for JWT decoding
- JWKS endpoint auto-discovery from Keycloak
- Clean dependency injection pattern for protected routes

### 4. Docker Orchestration
- Health checks for Postgres → Keycloak startup order
- Realm auto-import on first start
- Hot reload for development

---

## 🔴 Gotchas & Critical Lessons

### 1. Redirect URI Must Match EXACTLY
```
❌ Error: Invalid parameter: redirect_uri
```
**Problem:** Keycloak validates redirect URIs character-by-character, including port numbers.

**Solution:** Update realm config when changing frontend port:
```json
"redirectUris": ["http://localhost:3000/*"],
"webOrigins": ["http://localhost:3000"]
```

### 2. Realm Config Only Imports on First Start
**Problem:** Editing `genesis-realm.json` and restarting doesn't apply changes.

**Solution:** Wipe Postgres data to force re-import:
```bash
docker compose down --volumes
docker compose up -d
```

### 3. Docker Networking for Vite Dev Server
**Problem:** Vite defaults to `localhost` which isn't accessible from outside container.

**Solution:** Configure vite.config.ts:
```typescript
server: {
  host: '0.0.0.0',  // Bind to all interfaces
  watch: {
    usePolling: true  // Required for Docker on macOS/Windows
  }
}
```

### 4. Keycloak Takes ~30-60 Seconds to Start
**Problem:** Frontend tries to connect before Keycloak is ready.

**Mitigation:** Add loading state in frontend, configure keycloak-js with `checkLoginIframe: false` to prevent iframe errors.

### 5. Theme CSS Loading Order
**Problem:** Custom CSS styles not applying.

**Solution:** Use `!important` strategically and ensure `theme.properties` specifies:
```
parent=keycloak
styles=css/genesis.css
```

---

## 📁 Files Created

### Implementation Structure
```
use-case-3-keycloak-auth/
├── phase-0-use-case-definition.md
├── phase-6-experiment-report.md      # This file
└── implementation/
    ├── docker-compose.yml
    ├── config/
    │   └── keycloak/
    │       ├── genesis-realm.json    # Realm with users, clients, roles
    │       └── themes/
    │           └── genesis/
    │               └── login/
    │                   ├── theme.properties
    │                   └── resources/css/genesis.css
    └── services/
        ├── frontend/
        │   ├── Dockerfile
        │   ├── package.json
        │   ├── vite.config.ts
        │   └── src/
        │       ├── main.tsx          # Keycloak provider setup
        │       └── App.tsx           # Auth UI components
        └── backend/
            ├── Dockerfile
            ├── requirements.txt
            └── main.py               # FastAPI with JWT validation
```

---

## 🎨 Custom Theme Implementation

### Theme Structure
```
themes/genesis/login/
├── theme.properties          # Extends keycloak, imports CSS
└── resources/
    └── css/
        └── genesis.css       # Custom styles
```

### Key CSS Variables
```css
:root {
  --genesis-orange: #ea580c;
  --genesis-orange-hover: #c2410c;
  --genesis-bg: #f8fafc;
  --genesis-card-bg: #ffffff;
  --genesis-text-primary: #1e293b;
  --genesis-text-secondary: #64748b;
  --genesis-border: #e2e8f0;
}
```

### What the Theme Customizes
- ✅ Header logo color (orange)
- ✅ Background gradient (light gray)
- ✅ Card styling (rounded corners, shadow)
- ✅ Input field focus states (orange border)
- ✅ Primary button (orange with hover effect)
- ✅ Links and text colors
- ✅ Alert styling

---

## 🔧 Docker Compose Configuration

### Key Patterns
```yaml
services:
  keycloak:
    volumes:
      # Realm import on first start
      - ./config/keycloak:/opt/keycloak/data/import
      # Custom themes
      - ./config/keycloak/themes:/opt/keycloak/themes
    command: start-dev --import-realm
    depends_on:
      postgres:
        condition: service_healthy  # Wait for DB
```

---

## 📊 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| demo@genesis.com | demo123 | user |
| admin@genesis.com | admin123 | user, admin |

---

## 🚀 How to Run

```bash
cd use-case-3-keycloak-auth/implementation
docker compose down --volumes  # Clean start
docker compose up -d
# Wait ~30 seconds for Keycloak
open http://localhost:3000
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8002 |
| Keycloak Admin | http://localhost:8080 (admin/admin) |

---

## 📝 Recommendations for Catalog Component

Based on this experiment, the `keycloak-custom-theme` component should include:

1. **Template theme files** - Pre-configured theme.properties and CSS
2. **CSS variable documentation** - Easy to customize colors
3. **Docker volume mount pattern** - Standard mounting approach
4. **Realm config template** - With loginTheme already set
5. **Troubleshooting guide** - Common gotchas and solutions

---

## 🔗 Related Components

- `keycloak` - Base Keycloak component
- `react-vite-frontend` - React SPA setup
- `fastapi-ai-service` - Backend with JWT support

---

## ✨ Key Takeaways

1. **Custom themes are CSS-only** - No need to learn FreeMarker for basic customization
2. **Volume mounts make it portable** - Theme lives in app repo, not Keycloak image
3. **Realm re-import requires volume wipe** - Plan for this in development workflow
4. **keycloak-js handles complexity** - Token refresh, PKCE, etc. are automatic
