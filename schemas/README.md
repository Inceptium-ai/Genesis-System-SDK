# Genesis SDK Schemas

This directory contains **structural schemas** - generic, reusable patterns that apply across any domain. These are NOT domain-specific models (like "Resume" or "Product") but rather common patterns every application needs.

## Schema Types

### `/patterns/` - TypeScript Patterns
Reusable TypeScript interfaces for common application patterns:

- **api-response.ts** - Standard API response wrapper
- **pagination.ts** - Pagination request/response patterns
- **error-handling.ts** - Error response structure
- **auth-user.ts** - Generic authenticated user shape

### `/validation/` - JSON Schemas
JSON Schema definitions for validating GSS artifacts:

- **component.schema.json** - Validate component.yaml files
- **blueprint.schema.json** - Validate blueprint.yaml files

## Usage

### TypeScript Patterns

Copy the patterns you need into your project's `src/types/` directory and adapt as needed:

```typescript
// In your project
import type { ApiResponse, PaginatedResponse } from '@/types/api';

// Use in API handlers
export async function GET(): Promise<ApiResponse<User[]>> {
  return {
    success: true,
    data: users,
    meta: { timestamp: new Date().toISOString() }
  };
}
```

### Validation Schemas

Use JSON schemas to validate your component and blueprint files:

```bash
# Using ajv-cli
npm install -g ajv-cli
ajv validate -s schemas/validation/component.schema.json -d components/my-component/component.yaml

# Or in CI/CD
npx ajv-cli validate -s schemas/validation/component.schema.json -d components/*/component.yaml
```

## Philosophy

These schemas follow the GSS core principle:
- **Components & Blueprints** = Generic, modular building blocks
- **Examples** = Domain-specific implementations (e.g., Resume Optimizer)

The patterns here should help you build ANY application, not just specific use cases.

## Adding New Patterns

When adding new patterns, ask:
1. Is this pattern domain-agnostic? (✅ Pagination, ❌ Resume)
2. Would this help ANY application? (✅ Error handling, ❌ Job matching)
3. Does this solve a common integration gotcha? (✅ API response format, ❌ Industry-specific validation)
