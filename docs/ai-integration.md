# AI Integration

The backend exposes two AI capabilities used by the topic-creation flow:

- **Generate** — produce N questions for a topic (optionally from source text).
- **Format** — convert messy user-pasted text into structured questions.

Both routes are served by `api/src/ai/ai.service.ts`, which delegates to a
provider implementing the `AiProvider` interface
(`api/src/ai/providers/types.ts`).

## Available providers

| Provider  | File                                          | When it's used                                                                |
| --------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| `stub`    | `api/src/ai/providers/stub.provider.ts`       | Default. Returns deterministic placeholders. Useful for dev with no API key.  |
| `anthropic` | `api/src/ai/providers/anthropic.provider.ts` | Calls `https://api.anthropic.com/v1/messages` over `fetch`. No SDK required. |

Provider selection happens in `AiService` from environment variables.

## Enabling Anthropic

Add the following to `api/.env` and restart the API:

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6   # or claude-haiku-4-5-20251001 for cheaper/faster
```

The provider posts a JSON-only prompt and parses the first `[ ... ]` block from
the response. The prompt enforces per-type shape rules (one correct for
single-choice, two fixed answers for true/false, etc.) so the same answer
schema validated by `api/src/topics/question-types.ts` comes back.

## Adding another provider (e.g. OpenAI, Gemini)

1. Create `api/src/ai/providers/openai.provider.ts` implementing `AiProvider`.
2. Inject it in `api/src/ai/ai.module.ts` (add to `providers` list).
3. Extend the selection logic in `api/src/ai/ai.service.ts` constructor:

   ```ts
   if (choice === 'openai' && process.env.OPENAI_API_KEY) {
     this.provider = openai;
   }
   ```

4. No DTO, controller, or mobile change is needed — the rest of the system
   only knows about the interface.

## Endpoints

Both require the `Authorization: Bearer <jwt>` header.

### `POST /topics/ai/generate`

Request:

```json
{
  "topicTitle": "JavaScript closures",
  "sourceText": "(optional)",
  "type": "SINGLE_CHOICE",
  "count": 5,
  "difficulty": "MEDIUM",
  "language": "en"
}
```

Response: array of `AiQuestionDraft` (not persisted — saved only when the
client posts to `POST /topics`).

### `POST /topics/ai/format`

Request:

```json
{
  "rawText": "1. What is TCP? ...",
  "type": "SINGLE_CHOICE",
  "topicTitle": "Networking"
}
```

Response: array of `AiQuestionDraft` parsed from the raw text.

## Mobile usage

`mobile/src/api/topics.api.ts` exposes `topicsApi.generate(...)` and
`topicsApi.format(...)`. The AI screen
(`mobile/app/topic-create/ai.tsx`) calls `generate`, the manual editor's
"AI format" modal (`mobile/app/topic-create/manual.tsx`) calls `format`.
