# Phase 5 — Verification Checklist

## AI Resume Optimization App (Resumax)

**Blueprint:** C — AI Platform / AI Webapp  
**Experiment ID:** UC1-RESUME-OPT

---

## 1. Authentication Tests

### AUTH-01: User Login Flow
```bash
# Test: Google OAuth login through Keycloak
# Steps:
1. Navigate to http://localhost:3000
2. Click "Sign In"
3. Verify redirect to Keycloak login page
4. Click "Sign in with Google" (if configured) or use test credentials
5. Verify redirect back to dashboard with user session

# Test credentials:
Username: testuser
Password: testpass123!

# Verification:
curl -s http://localhost:8080/realms/resumax/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=resumax-web" \
  -d "username=testuser" \
  -d "password=testpass123!" \
  | jq -e '.access_token'
```

**Expected:** Access token returned, user redirected to dashboard

### AUTH-02: Session Persistence
```bash
# Test: Session persists across page refresh
1. Login successfully
2. Note session indicator in UI
3. Refresh page (F5)
4. Verify still logged in (no redirect to login)
```

**Expected:** User remains authenticated after refresh

### AUTH-03: Protected Route Guard
```bash
# Test: Unauthenticated access to protected routes
curl -I http://localhost:3000/dashboard
# Expected: 302 redirect to /auth or Keycloak login

curl -I http://localhost:8000/api/resumes
# Expected: 401 Unauthorized
```

**Expected:** Protected routes redirect/reject unauthenticated requests

### AUTH-04: Role-Based Access
```bash
# Test: Admin vs User role access
# Login as testuser (role: user)
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:8000/api/admin/users
# Expected: 403 Forbidden

# Login as admin (role: admin)
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8000/api/admin/users
# Expected: 200 OK with user list
```

**Expected:** Admin endpoints accessible only to admin role

---

## 2. Resume Management Tests

### RESUME-01: File Upload (PDF)
```bash
# Test: Upload PDF resume
curl -X POST http://localhost:8000/api/resumes/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_resume.pdf" \
  | jq

# Expected response:
{
  "id": "uuid",
  "name": "test_resume.pdf",
  "status": "parsed",
  "parsed_text": "..."
}
```

**Expected:** PDF uploaded and parsed successfully

### RESUME-02: File Upload (DOCX)
```bash
# Test: Upload DOCX resume
curl -X POST http://localhost:8000/api/resumes/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_resume.docx"
```

**Expected:** DOCX uploaded and parsed successfully

### RESUME-03: List Resumes
```bash
# Test: Retrieve user's resumes
curl http://localhost:8000/api/resumes \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Expected: Array of resume objects belonging to user
```

**Expected:** Returns only current user's resumes

### RESUME-04: Version History
```bash
# Test: Retrieve version history for a resume
curl http://localhost:8000/api/resumes/{resume_id}/versions \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Expected: Array of versions with timestamps and source
```

**Expected:** All versions listed chronologically

### RESUME-05: Delete Resume
```bash
# Test: Delete a resume
curl -X DELETE http://localhost:8000/api/resumes/{resume_id} \
  -H "Authorization: Bearer $TOKEN"

# Verify deleted
curl http://localhost:8000/api/resumes/{resume_id} \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not Found
```

**Expected:** Resume and all versions deleted

---

## 3. AI Pipeline Tests

### OPT-01: Start Optimization
```bash
# Test: Start resume optimization workflow
curl -X POST http://localhost:8000/api/ai/optimize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "uuid",
    "job_description": "We are looking for a software engineer..."
  }' \
  | jq

# Expected response:
{
  "run_id": "uuid",
  "status": "pending",
  "workflow_id": "..."
}
```

**Expected:** Optimization run created, workflow started

### OPT-02: Stream Progress
```bash
# Test: SSE stream receives updates
curl -N http://localhost:8000/api/ai/runs/{run_id}/stream \
  -H "Authorization: Bearer $TOKEN"

# Expected: Event stream with progress updates
data: {"step": "analyzing_jd", "progress": 25}
data: {"step": "identifying_gaps", "progress": 50}
data: {"step": "rewriting_bullets", "progress": 75}
data: {"step": "completed", "progress": 100}
```

**Expected:** Real-time progress events received

### OPT-03: Optimization Result Format
```bash
# Test: Completed optimization has correct format
curl http://localhost:8000/api/ai/runs/{run_id} \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.result.optimized_bullets'

# Expected: Bullets in "accomplish X through Y using Z" format
```

**Expected:** Bullets follow impact-focused format

### OPT-04: Roast Resume
```bash
# Test: Resume roast returns score and feedback
curl -X POST http://localhost:8000/api/ai/roast \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resume_id": "uuid"}' \
  | jq

# Expected response includes:
{
  "run_id": "uuid",
  "status": "completed",
  "result": {
    "resumax_score": 72,
    "feedback": [...]
  }
}
```

**Expected:** Score 0-100 and actionable feedback returned

### OPT-05: Workflow Retry
```bash
# Test: Workflow retries on transient failure
# Simulate: Temporarily block OpenRouter API
# Start optimization
# Unblock API after 10 seconds
# Verify: Workflow completes successfully after retry
```

**Expected:** Workflow recovers from transient failures

### OPT-06: Error Handling
```bash
# Test: Failed optimization shows meaningful error
# Simulate: Invalid resume_id
curl -X POST http://localhost:8000/api/ai/optimize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resume_id": "invalid-uuid", "job_description": "..."}' \
  | jq

# Expected: Clear error message, not generic 500
```

**Expected:** User-friendly error messages

---

## 4. Export Tests

### EXPORT-01: Generate PDF
```bash
# Test: Export resume as PDF
curl -X POST http://localhost:8001/render \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {...},
    "template_id": "ats-optimized",
    "format": "pdf"
  }' \
  | jq

# Get download URL
curl http://localhost:8001/jobs/{job_id} | jq '.file_url'

# Download and verify
curl -o resume.pdf "$FILE_URL"
file resume.pdf  # Should be "PDF document"
```

**Expected:** Valid PDF downloaded

### EXPORT-02: ATS Compatibility
```bash
# Test: PDF is parseable (not image-based)
pdftotext resume.pdf - | head -20
# Should output readable text
```

**Expected:** Text extractable from PDF

### EXPORT-03: Template Selection
```bash
# Test: Different templates produce different outputs
for template in professional-classic modern-minimal ats-optimized; do
  curl -X POST http://localhost:8001/render \
    -d "{\"resume_data\":{...},\"template_id\":\"$template\",\"format\":\"pdf\"}"
done
# Verify: Visual differences between templates
```

**Expected:** Each template has distinct styling

---

## 5. Observability Tests

### OBS-01: OpenTelemetry Traces
```bash
# Test: Traces appear in Jaeger
1. Make API request to http://localhost:8000/api/resumes
2. Open Jaeger UI at http://localhost:16686
3. Search for service "resumax-ai-service"
4. Verify: Trace shows request details, timing

# Verify trace propagation across services
```

**Expected:** Full request trace visible in Jaeger

### OBS-02: Langfuse LLM Traces
```bash
# Test: LLM calls appear in Langfuse
1. Run an optimization or roast
2. Open Langfuse dashboard
3. Verify: Trace shows:
   - Prompt content
   - Response content
   - Token count
   - Latency
   - Cost estimate
```

**Expected:** LLM calls traced with all metrics

### OBS-03: Structured Logs
```bash
# Test: Logs are JSON formatted
docker compose logs ai-service | tail -5 | jq

# Expected: Valid JSON with fields:
{
  "timestamp": "...",
  "level": "INFO",
  "message": "...",
  "trace_id": "...",
  "span_id": "..."
}
```

**Expected:** Structured JSON logs with trace context

---

## 6. Security Tests

### SEC-01: No Secrets in Logs
```bash
# Test: API keys not logged
docker compose logs ai-service 2>&1 | grep -i "sk-or-v1"
# Expected: No matches

docker compose logs ai-service 2>&1 | grep -i "password"
# Expected: No plaintext passwords
```

**Expected:** No sensitive data in logs

### SEC-02: CORS Configuration
```bash
# Test: Only allowed origins work
curl -I http://localhost:8000/api/resumes \
  -H "Origin: http://evil.com" \
  -H "Authorization: Bearer $TOKEN"

# Check Access-Control-Allow-Origin header
# Expected: Not "http://evil.com"
```

**Expected:** CORS blocks unauthorized origins

### SEC-03: Rate Limiting
```bash
# Test: Rate limiting enforced
for i in {1..200}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:8000/api/resumes \
    -H "Authorization: Bearer $TOKEN"
done | uniq -c

# Expected: 429 Too Many Requests after ~100 requests
```

**Expected:** Rate limit kicks in after threshold

### SEC-04: SQL Injection
```bash
# Test: SQL injection prevented
curl http://localhost:8000/api/resumes \
  -H "Authorization: Bearer $TOKEN" \
  -G --data-urlencode "filter='; DROP TABLE resumes; --"

# Expected: No database error, safe handling
```

**Expected:** Input sanitized, no SQL injection possible

---

## 7. Infrastructure Tests

### INFRA-01: All Services Healthy
```bash
# Test: All containers running
docker compose ps

# Expected: All services show "healthy" status
NAME                    STATUS
resumax-postgres        Up (healthy)
resumax-redis           Up (healthy)
resumax-keycloak        Up (healthy)
resumax-temporal        Up (healthy)
resumax-ai-service      Up (healthy)
resumax-pdf-service     Up (healthy)
resumax-frontend        Up (healthy)
resumax-jaeger          Up (healthy)
resumax-minio           Up (healthy)
```

**Expected:** All services healthy

### INFRA-02: Service Recovery
```bash
# Test: Services recover after restart
docker compose restart ai-service
sleep 30
curl http://localhost:8000/health
# Expected: 200 OK
```

**Expected:** Service recovers after restart

### INFRA-03: Database Persistence
```bash
# Test: Data persists across restart
1. Create a resume
2. docker compose down
3. docker compose up -d
4. Verify resume still exists
```

**Expected:** Data persisted in volumes

---

## 8. End-to-End Smoke Test

```bash
#!/bin/bash
# Full E2E test script

set -e

echo "1. Login..."
TOKEN=$(curl -s http://localhost:8080/realms/resumax/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=resumax-web" \
  -d "username=testuser" \
  -d "password=testpass123!" | jq -r '.access_token')

echo "2. Upload resume..."
RESUME_ID=$(curl -s -X POST http://localhost:8000/api/resumes/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_resume.pdf" | jq -r '.id')

echo "3. Start optimization..."
RUN_ID=$(curl -s -X POST http://localhost:8000/api/ai/optimize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"resume_id\":\"$RESUME_ID\",\"job_description\":\"Software Engineer at FAANG\"}" \
  | jq -r '.run_id')

echo "4. Wait for completion..."
sleep 60
STATUS=$(curl -s http://localhost:8000/api/ai/runs/$RUN_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r '.status')

if [ "$STATUS" != "completed" ]; then
  echo "FAILED: Optimization did not complete"
  exit 1
fi

echo "5. Export PDF..."
VERSION_ID=$(curl -s http://localhost:8000/api/resumes/$RESUME_ID/versions \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

JOB_ID=$(curl -s -X POST http://localhost:8001/render \
  -H "Content-Type: application/json" \
  -d "{\"version_id\":\"$VERSION_ID\",\"template_id\":\"ats-optimized\",\"format\":\"pdf\"}" \
  | jq -r '.job_id')

sleep 10
FILE_URL=$(curl -s http://localhost:8001/jobs/$JOB_ID | jq -r '.file_url')

curl -s -o resume.pdf "$FILE_URL"
file resume.pdf | grep -q "PDF" || exit 1

echo "✅ E2E Test Passed!"
```

---

## Verification Summary

| Category | Test Count | Status |
|----------|------------|--------|
| Authentication | 4 | ⬜ |
| Resume Management | 5 | ⬜ |
| AI Pipeline | 6 | ⬜ |
| Export | 3 | ⬜ |
| Observability | 3 | ⬜ |
| Security | 4 | ⬜ |
| Infrastructure | 3 | ⬜ |
| E2E Smoke | 1 | ⬜ |

**Total Tests:** 29

**Acceptance Threshold:** All P0 tests must pass before MVP release.
