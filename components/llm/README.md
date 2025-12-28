# LLM Components

This directory contains components for integrating Large Language Models (LLMs) into applications.

## 📁 Structure

```
llm/
├── langchain/              # LangChain-based integrations
│   └── structured-output/  # Reliable structured output with Pydantic
└── api-direct/             # Direct API integrations (minimal deps)
    └── openrouter/         # OpenRouter multi-provider API
```

## 🎯 When to Use Which

```
┌─ Do you need structured/typed JSON output?
│   │
│   ├── YES → langchain/structured-output
│   │         - Uses LangChain with_structured_output()
│   │         - Automatic fallback strategies
│   │         - Pydantic validation + retries
│   │         - 98%+ reliability for JSON schema compliance
│   │
│   └── NO (simple prompt → text response)
│       └── api-direct/openrouter
│           - Direct HTTP calls
│           - Minimal dependencies (httpx only)
│           - Full control over request/response
│
└─ Do you need agentic/multi-step workflows?
    └── YES → Consider LangGraph (future component)
```

## 📊 Comparison

| Feature | langchain/structured-output | api-direct/openrouter |
|---------|----------------------------|----------------------|
| **Dependencies** | langchain-core, pydantic | httpx only |
| **Structured Output** | ✅ Native support | ❌ Manual parsing |
| **Provider Agnostic** | ✅ OpenAI, Anthropic, etc | ✅ Via OpenRouter |
| **Retries** | ✅ Built-in | ❌ Manual |
| **Validation** | ✅ Pydantic | ❌ Manual |
| **Best For** | Apps needing reliable JSON | Simple text generation |

## 🔌 Provider Support

### Via LangChain
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5/3)
- Google (Gemini)
- Local models (Ollama)

### Via OpenRouter (api-direct)
- All OpenAI models
- All Anthropic models
- Many open-source models
- Single API key for all

## ⚠️ Common Issues

### JSON Parsing Failures

**Problem:** LLM returns malformed JSON
**Solution:** Use `langchain/structured-output` which:
1. First tries native provider structured output
2. Falls back to function/tool calling
3. Falls back to prompt + Pydantic parser
4. Auto-retries on validation failure

### Rate Limits

**Problem:** 429 errors from provider
**Solution:** Both components include:
- Exponential backoff
- Retry logic
- Rate limit headers handling

### Token Limits

**Problem:** Response truncated
**Solution:** 
- Use streaming for long outputs
- Chunk large documents before processing
- Set explicit max_tokens in requests

## 📖 Examples

### Example: Resume Analysis (Structured Output)

```python
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

class ResumeAnalysis(BaseModel):
    score: int = Field(description="Overall score 0-100")
    strengths: list[str] = Field(description="Key strengths")
    weaknesses: list[str] = Field(description="Areas to improve")

llm = ChatOpenAI(model="gpt-4o")
structured_llm = llm.with_structured_output(ResumeAnalysis)

result = structured_llm.invoke("Analyze this resume: ...")
# result is GUARANTEED to be valid ResumeAnalysis
```

### Example: Simple Chat (Direct API)

```python
import httpx

async with httpx.AsyncClient() as client:
    response = await client.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": "anthropic/claude-3-haiku",
            "messages": [{"role": "user", "content": "Hello!"}]
        }
    )
    print(response.json()["choices"][0]["message"]["content"])
```

## 🆕 Adding New LLM Components

When adding new LLM components:

1. Place in appropriate subdirectory (`langchain/` or `api-direct/`)
2. Include `component.yaml` with:
   - Required dependencies
   - Environment variables needed
   - Common gotchas
3. Include working code examples
4. Document provider compatibility
5. Add error handling patterns

---

*Last updated: December 2025*
