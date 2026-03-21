# AI Prompt Engineering Pack

This folder contains production-ready prompt and schema assets for Gemini integration.

- Prompts: `ai/prompts/*.md`
- Structured output schemas (OpenAPI/JSON Schema compatible): `ai/schemas/*.json`
- Documentation:
  - `ai/docs/PROMPTS.md` (consolidated non-Live prompting + safety + schema strategy)
  - `ai/docs/LIVE.md` (Gemini Live architecture and implementation notes)

Conventions:

- Every prompt returns strict JSON only.
- Every schema requires `schema_version` with enum `v1`.
- Health data constraints must respect explicit consent.
- Output language must follow the requested locale (`cs` or `en`).
