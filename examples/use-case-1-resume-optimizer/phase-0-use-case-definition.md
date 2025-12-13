# Phase 0 — Use Case Definition

## AI Resume Optimization App

**Blueprint Type:** Blueprint C — AI Platform / AI Webapp  
**Experiment ID:** UC1-RESUME-OPT  
**Version:** 1.0.0  
**Date:** 2024-12-12

---

## 1. Use Case Summary

**Name:** AI Resume Optimization App (Resumax)

**Goal:** Users upload a resume + job description → receive AI-optimized bullet points, ATS-friendly formatting, tailored cover letter, and brutally honest "roast" feedback.

**Key Value Proposition:**
- Transform generic resumes into job-specific, high-impact documents
- Provide quantitative scoring (Resumax Score 0-100)
- Enable rapid iteration with version history
- Export ATS-friendly PDF/DOCX formats

---

## 2. User Personas

### 2.1 Primary: Job Seeker

| Attribute | Description |
|-----------|-------------|
| **Role** | Active job searcher or career switcher |
| **Goals** | Optimize resume for specific jobs, get honest feedback, manage multiple versions |
| **Pain Points** | Generic resumes don't pass ATS, unclear what recruiters want, time-consuming manual tailoring |
| **Technical Level** | Low-Medium (expects simple upload + paste experience) |
| **Usage Frequency** | High during job search (10-50 applications), sporadic otherwise |

### 2.2 Secondary: Admin/Ops

| Attribute | Description |
|-----------|-------------|
| **Role** | Platform operator, customer support |
| **Goals** | Monitor usage, inspect failed runs, manage users, view analytics |
| **Pain Points** | Lack of visibility into AI pipeline failures, user complaints |
| **Technical Level** | Medium-High |
| **Usage Frequency** | Daily |

---

## 3. Core User Stories

### Authentication & Access (3 stories)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-01 | As a user, I can sign up/login with Google or Microsoft OAuth so I don't need to remember another password | P0 | OAuth flow completes, user record created, session established |
| US-02 | As a user, I can see my subscription tier (Free/Pro/Lifetime) and upgrade from settings | P1 | Tier displayed accurately, Stripe checkout opens on upgrade click |
| US-03 | As an admin, I can view all users, their plans, and usage metrics | P1 | Admin dashboard shows user list with filters, usage stats |

### Resume Management (3 stories)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-04 | As a user, I can upload my resume (PDF/DOCX) and the system parses it to text | P0 | File upload works, text extraction succeeds, preview shown |
| US-05 | As a user, I can view all my saved resumes with version history | P0 | Resume list shows all versions, can view/download any version |
| US-06 | As a user, I can delete any of my resumes | P1 | Deletion confirmed, data removed, no orphan records |

### AI Optimization Pipeline (4 stories)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-07 | As a user, I can paste a job description and optimize my resume against it | P0 | JD analyzed, bullets rewritten, optimized version generated in <60s |
| US-08 | As a user, I can see streaming progress while optimization runs | P0 | Real-time progress indicator, partial results shown |
| US-09 | As a user, I can "roast" my resume to get a score (0-100) and brutal feedback | P0 | Score calculated, actionable feedback provided, <30s response |
| US-10 | As a user, I can generate a tailored cover letter based on my resume + JD | P1 | Cover letter generated, editable, exportable |

### Export & Output (2 stories)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-11 | As a user, I can export my optimized resume as ATS-friendly PDF | P0 | PDF generated with clean formatting, downloadable |
| US-12 | As a user, I can choose from 2-3 professional templates for my resume | P1 | Templates selectable, preview updates, export respects choice |

---

## 4. Non-Functional Requirements

### 4.1 Security

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Authentication | OAuth 2.0 via Keycloak | Enterprise-grade SSO, no password storage |
| Authorization | RBAC (user, admin) | Role-based feature access |
| Data Encryption | TLS 1.3 in transit, AES-256 at rest | Protect sensitive resume data |
| Secrets Management | Environment variables + secrets manager | No hardcoded credentials |
| CSRF Protection | Enabled on all mutations | Prevent cross-site attacks |
| CORS | Strict origin whitelist | API security |
| Rate Limiting | 100 req/min per user | Prevent abuse |

### 4.2 Performance & Scale

| Metric | Target | Notes |
|--------|--------|-------|
| Optimization Latency | < 60s p95 | For full resume optimization |
| Roast Latency | < 30s p95 | Simpler pipeline |
| PDF Generation | < 10s p95 | Async if needed |
| Concurrent Users | 100 initial, 1000 target | Horizontal scaling via k8s |
| Resume Parse Time | < 5s | File size limit: 10MB |
| Database Queries | < 100ms p95 | Index optimization |

### 4.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Availability | 99.5% | Multi-AZ deployment |
| Workflow Durability | Resumable after failure | Temporal workflows |
| Data Backup | Daily with 30-day retention | Postgres pg_dump + S3 |
| Error Handling | Graceful degradation | Retry logic, user notification |

### 4.4 Cost Constraints

| Component | Target $/month (initial) | Notes |
|-----------|--------------------------|-------|
| AI (OpenRouter/Claude Haiku 4.5) | $50-200 | ~$1/M input, $5/M output |
| Infrastructure | $100-300 | VPS/k8s cluster |
| Database (Postgres) | $20-50 | Managed or self-hosted |
| Stripe Fees | 2.9% + $0.30 per transaction | Standard rate |

### 4.5 Observability

| Requirement | Implementation |
|-------------|----------------|
| Distributed Tracing | OpenTelemetry → Jaeger/Tempo |
| Metrics | Prometheus + Grafana |
| Logging | Structured JSON logs → aggregator |
| AI Pipeline Monitoring | Langfuse for LLM observability |
| Alerting | PagerDuty/Slack integration |

---

## 5. Data Model Sketch

### 5.1 Entity Relationship Diagram (Conceptual)

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Subscription  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ user_id (FK)    │
│ email           │       │ plan (enum)     │
│ name            │       │ stripe_customer │
│ keycloak_id     │       │ status          │
│ created_at      │       │ valid_until     │
│ updated_at      │       └─────────────────┘
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│     Resume      │       │  ResumeVersion  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ resume_id (FK)  │
│ user_id (FK)    │       │ version_num     │
│ name            │       │ content_json    │
│ original_file   │       │ source (enum)   │
│ parsed_text     │       │ created_at      │
│ created_at      │       └─────────────────┘
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────┐
│              OptimizationRun                │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ resume_id (FK)                              │
│ input_version_id (FK)                       │
│ output_version_id (FK, nullable)            │
│ job_description_text                        │
│ run_type (enum: optimize|roast|cover_letter)│
│ status (enum: pending|running|completed|failed) │
│ resumax_score (int, nullable)               │
│ ai_feedback_json (jsonb)                    │
│ workflow_id (temporal)                      │
│ tokens_used                                 │
│ duration_ms                                 │
│ error_message                               │
│ created_at                                  │
│ completed_at                                │
└─────────────────────────────────────────────┘

┌─────────────────┐
│   ExportJob     │
├─────────────────┤
│ id (PK)         │
│ version_id (FK) │
│ format (enum)   │
│ template_id     │
│ status          │
│ output_url      │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│    Template     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ preview_url     │
│ latex_template  │
│ is_active       │
└─────────────────┘

┌─────────────────┐
│   AuditLog      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ action          │
│ entity_type     │
│ entity_id       │
│ metadata_json   │
│ created_at      │
└─────────────────┘
```

### 5.2 Enums

```sql
-- Plan tiers
CREATE TYPE plan_tier AS ENUM ('free', 'pro', 'lifetime');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- Run types
CREATE TYPE run_type AS ENUM ('optimize', 'roast', 'cover_letter');

-- Run status
CREATE TYPE run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Export format
CREATE TYPE export_format AS ENUM ('pdf', 'docx', 'txt');

-- Version source
CREATE TYPE version_source AS ENUM ('upload', 'optimization', 'manual_edit');
```

---

## 6. API Surface Sketch

### 6.1 Authentication Endpoints (via Keycloak)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/login` | Redirect to Keycloak login |
| GET | `/api/auth/callback` | OAuth callback handler |
| POST | `/api/auth/logout` | Logout and invalidate session |
| GET | `/api/auth/me` | Get current user info + plan |

### 6.2 Resume Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/resumes` | List user's resumes | User |
| POST | `/api/resumes/upload` | Upload new resume (multipart) | User |
| GET | `/api/resumes/:id` | Get resume details + versions | User |
| DELETE | `/api/resumes/:id` | Delete resume | User |
| GET | `/api/resumes/:id/versions` | List all versions | User |
| GET | `/api/resumes/:id/versions/:vid` | Get specific version | User |

### 6.3 AI Pipeline Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/optimize` | Start optimization run | User (Pro) |
| POST | `/api/ai/roast` | Start roast analysis | User |
| POST | `/api/ai/cover-letter` | Generate cover letter | User (Pro) |
| GET | `/api/ai/runs/:id` | Get run status/result | User |
| GET | `/api/ai/runs/:id/stream` | SSE stream for progress | User |
| GET | `/api/ai/history` | List user's optimization runs | User |

### 6.4 Export Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/export` | Start export job | User |
| GET | `/api/export/:id` | Get export status | User |
| GET | `/api/export/:id/download` | Download exported file | User |
| GET | `/api/templates` | List available templates | Public |

### 6.5 Billing Endpoints (Stripe)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/billing/checkout` | Create Stripe checkout session | User |
| POST | `/api/billing/portal` | Create Stripe billing portal | User |
| POST | `/api/billing/webhook` | Stripe webhook handler | Stripe |
| GET | `/api/billing/subscription` | Get subscription details | User |

### 6.6 Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| GET | `/api/admin/runs` | List all optimization runs | Admin |
| GET | `/api/admin/runs/:id` | Inspect specific run | Admin |
| GET | `/api/admin/metrics` | System metrics dashboard | Admin |

### 6.7 Health & Internal

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | None |
| GET | `/health/ready` | Readiness check | None |
| GET | `/health/live` | Liveness check | None |

---

## 7. Acceptance Criteria Checklist

### 7.1 Must Have (P0) — MVP

- [ ] **AUTH-01**: User can sign up/login via Google OAuth through Keycloak
- [ ] **AUTH-02**: User session persists across page refreshes
- [ ] **AUTH-03**: Protected routes redirect to login when unauthenticated

- [ ] **RESUME-01**: User can upload PDF/DOCX resume (max 10MB)
- [ ] **RESUME-02**: System extracts text from uploaded resume
- [ ] **RESUME-03**: User can view list of their resumes

- [ ] **OPT-01**: User can paste job description and start optimization
- [ ] **OPT-02**: System streams progress during optimization
- [ ] **OPT-03**: Optimized resume shows rewritten bullets in "accomplish X through Y using Z" format
- [ ] **OPT-04**: User can save optimized version to resume history

- [ ] **ROAST-01**: User can roast their resume
- [ ] **ROAST-02**: System returns Resumax Score (0-100)
- [ ] **ROAST-03**: System provides actionable improvement suggestions

- [ ] **EXPORT-01**: User can export resume as PDF
- [ ] **EXPORT-02**: PDF is ATS-friendly (parseable, clean formatting)

- [ ] **OBS-01**: All API calls are traced via OpenTelemetry
- [ ] **OBS-02**: AI pipeline has Langfuse observability

### 7.2 Should Have (P1) — Full Feature Set

- [ ] **AUTH-04**: User can sign up/login via Microsoft OAuth
- [ ] **AUTH-05**: Admin role can access admin dashboard
- [ ] **AUTH-06**: Role-based feature gating works

- [ ] **RESUME-04**: User can view version history for each resume
- [ ] **RESUME-05**: User can delete resumes

- [ ] **OPT-05**: User can generate tailored cover letter
- [ ] **OPT-06**: Workflow retries failed steps automatically
- [ ] **OPT-07**: Failed runs show meaningful error messages

- [ ] **EXPORT-03**: User can choose from 2-3 templates
- [ ] **EXPORT-04**: User can export as DOCX

- [ ] **BILLING-01**: Free users limited to 1 optimization, 1 roast
- [ ] **BILLING-02**: User can upgrade to Pro via Stripe
- [ ] **BILLING-03**: Pro features unlock after successful payment

### 7.3 Nice to Have (P2) — Future Enhancements

- [ ] **OPT-08**: Semantic job matching using pgvector embeddings
- [ ] **ADMIN-01**: Admin can inspect individual AI runs
- [ ] **ADMIN-02**: Admin can view system-wide metrics
- [ ] **EXPORT-05**: Custom template builder

---

## 8. Constraints & Assumptions

### 8.1 Constraints

1. **AI Provider**: Must use OpenRouter with Claude Haiku 4.5 ($1/M in, $5/M out)
2. **Budget**: Initial infrastructure budget ~$200-300/month
3. **Timeline**: MVP in 2-3 weeks of focused effort
4. **Team**: Assumes single developer with AI agent assistance
5. **Catalog Components**: Must use approved catalog components only

### 8.2 Assumptions

1. Users have Google/Microsoft accounts for OAuth
2. Job descriptions are provided as plain text (no URL scraping needed)
3. Resume formats are standard (not scanned images requiring OCR)
4. English language only for V1
5. Single geographic region deployment initially

### 8.3 Out of Scope (V1)

- Resume editor (manual editing in-app)
- Batch optimization (multiple JDs at once)
- LinkedIn integration
- Job board scraping
- Team/organization accounts
- White-label/B2B features

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI model rate limits | Medium | High | Implement queue + retry, monitor usage |
| Poor optimization quality | Medium | High | Iterative prompt engineering, user feedback loop |
| PDF generation complexity | Medium | Medium | Use modular service, fallback to simpler format |
| Keycloak learning curve | Low | Medium | Use Docker quick-start, documented configs |
| Cost overruns (AI tokens) | Medium | Medium | Usage limits per tier, cost monitoring |
| Workflow complexity with Temporal | Medium | Medium | Start with simple workflows, gradual complexity |

---

## Next Steps

→ **Phase 1**: Component Graph Selection (YAML configuration)

This will define:
- Exact components and versions
- Integration topology
- Configuration requirements
- Expected contracts

---

*Document generated as part of Genesis Component Catalog Experiment UC1*
