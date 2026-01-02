# Genesis System SDK - Integrations

**Version:** 1.0.0  
**Date:** January 2, 2026

## Overview

The `integrations/` directory contains third-party services that connect to external APIs or protocols. Unlike components (which are generic building blocks you own), integrations interface with services that have their own protocols, authentication flows, and behavior contracts.

## Component vs Integration Distinction

| Aspect | Component | Integration |
|--------|-----------|-------------|
| **What it is** | Generic building block you control | 3rd party service with defined protocol |
| **Code ownership** | You own all the code | You call their API/implement their protocol |
| **Protocol** | None specific | OAuth, Webhooks, REST API, SDK |
| **Behavior contract** | ❌ No | ✅ Yes - defines expected behaviors |
| **Examples** | React, FastAPI, PostgreSQL | Keycloak, Stripe, Twilio, OpenAI |
| **Validation** | Build succeeds | Protocol implemented correctly |

## Directory Structure

```
integrations/
├── README.md                  # This file
├── auth/                      # Authentication integrations
│   ├── keycloak/              # OIDC identity provider
│   │   └── integration.yaml
│   └── auth0/                 # Auth0 (future)
│       └── integration.yaml
├── payments/                  # Payment integrations
│   └── stripe/                # Stripe payments
│       └── integration.yaml
├── communications/            # Communication integrations
│   └── twilio/                # SMS/Voice
│       └── integration.yaml
├── ai/                        # AI service integrations
│   └── openai/                # OpenAI/OpenRouter
│       └── integration.yaml
└── storage/                   # Cloud storage integrations
    └── s3/                    # AWS S3
        └── integration.yaml
```

## Integration YAML Schema

Each integration has an `integration.yaml` file with:

```yaml
name: integration-name
type: integration
category: auth|payments|communications|ai|storage
version: x.y.z
source: docker-image or external-api

# What protocol does this integration use?
protocol: OIDC|REST|Webhooks|SDK
protocol_version: 1.0

# Behavior contracts define expected behaviors
behavior_contracts:
  - name: contract_name
    trigger: What initiates this behavior
    steps:
      - Description of each step
    validation:
      - How to verify this works correctly

# Configuration requirements
configuration:
  required:
    - setting_name
  optional:
    - setting_name

# Environment variables
environment_variables:
  - VAR_NAME

# Ports (for self-hosted integrations)
ports:
  - 8080

# Common issues and solutions
gotchas:
  - description of issue and solution
```

## Why Behavior Contracts?

Behavior contracts solve a critical problem discovered in V15-V20 testing: **multi-service integrations fail silently when protocols aren't implemented correctly.**

Example from V20:
- Frontend got a token from Keycloak ✅
- Token didn't include backend's audience ❌
- Backend rejected all API calls with 401 ❌
- Users couldn't determine what went wrong

With behavior contracts:
1. **Clear expectations** - Each integration defines exactly what should happen
2. **Validation rules** - Automated checks can verify the protocol works
3. **Troubleshooting** - When something fails, contracts show where to look
4. **AI guidance** - LLMs know exactly what to implement for each integration

## Usage in Blueprints

Blueprints reference integrations separately from components:

```yaml
# blueprints/my-blueprint/blueprint.yaml

components:
  required:
    - name: fastapi-backend
      catalog: components/backend/fastapi
    - name: react-frontend  
      catalog: components/frontend/react-vite

integrations:
  required:
    - name: keycloak
      catalog: integrations/auth/keycloak
  optional:
    - name: stripe
      catalog: integrations/payments/stripe
```

## Creating a New Integration

1. Create directory: `integrations/{category}/{name}/`
2. Create `integration.yaml` with required fields
3. Add behavior contracts for all protocols
4. Document gotchas from real-world testing
5. Add to relevant blueprints

## Current Integrations

| Integration | Category | Protocol | Status |
|-------------|----------|----------|--------|
| Keycloak | auth | OIDC | ✅ Complete |
| OpenAI/OpenRouter | ai | REST | 🔄 Planned |
| Stripe | payments | REST + Webhooks | 🔄 Planned |
| Twilio | communications | REST | 🔄 Planned |
| S3 | storage | REST | 🔄 Planned |

---

*This directory is part of the Genesis System SDK v3 enhancement.*
