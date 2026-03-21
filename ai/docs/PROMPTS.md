# Prompting and Structured Output Guide

This document provides a bird's-eye overview of how prompting is designed across the application, how safety is enforced, and how structured output is validated for production use.

It is the consolidated reference for non-Live prompts and their schemas. For real-time voice architecture, see `ai/docs/LIVE.md`.

## Goals

- Keep model behavior predictable and auditable.
- Keep user output useful, localized, and safe.
- Convert model output into database-ready structures with strict schema validation.
- Maintain GDPR-aware behavior, especially for health-related personalization.

## Prompting Techniques (Bird's-Eye)

We use a layered prompting strategy with explicit contracts:

1. Role framing
- Each prompt starts with a narrow role (coach, evaluator, translator, moderator, extractor).
- Role scope is constrained to one task family to reduce drift.

2. Input contract declaration
- Prompt text explicitly lists expected input fields.
- This reduces hidden assumptions and helps backend code keep stable payloads.

3. Rule-first constraints
- Prompts include numbered rules for language, safety, personalization, and output behavior.
- Rules are designed to be deterministic and testable.

4. Context-aware but consent-bounded behavior
- Prompts use user context (skill, locale, recipe step, profile) when available.
- Sensitive adaptation is gated by consent flags.

5. Output-contract coupling
- Every prompt points to a specific schema file.
- Prompt + schema are versioned together using `v1` naming and `schema_version` field.

6. Failure-aware wording
- Prompts instruct the model to ask focused clarifications when context is missing.
- Where action cannot be safely completed, prompts require safe fallback text.

## Safety and Compliance Model

Safety is enforced in multiple layers:

1. Prompt-level guardrails
- Unsafe requests require refusal + safer alternative.
- No hidden prompt leakage.
- No fabricated success for actions that were not executed.

2. Consent-level gating
- `health_data_consent_granted` controls whether allergy/intolerance data may influence output.
- If false, prompts must avoid health-based personalization.

3. Runtime validation
- Backend validates model output against JSON schema before applying side effects.
- Invalid outputs trigger retry/fallback flow.

4. Audit logging
- Store request/response payloads, model name, token and latency metadata.
- Keep prompt version identifiers in payload metadata for reproducibility.

## Structured Output with Schemas

Schemas are stored in `ai/schemas/*.json` and follow OpenAPI/JSON Schema-compatible structure.

Shared conventions:
- `schema_version` is required and currently must equal `v1`.
- `additionalProperties: false` is used broadly to prevent silent shape drift.
- Enums mirror app/domain enums where possible.
- Numeric bounds are explicit for confidence scores, levels, and durations.

Recommended runtime flow:

1. Send model request with prompt + context payload.
2. Parse JSON output.
3. Validate against feature schema.
4. If valid: persist/apply.
5. If invalid: retry once with validation error summary.
6. If still invalid: return safe fallback and log failure for review.

Minimal retry guidance:
- Retry count: 1 (or 2 max for non-latency-critical jobs).
- Retry prompt addition: include concise validator errors, do not replace original constraints.
- Never bypass validation for mutating operations.

## Context Contract (Cross-Cutting)

Common fields used across prompts:

- `locale`: output language lock (`cs` or `en`).
- `user_profile`: skill, dietary preferences, personalization flags.
- `health_data_consent_granted`: explicit sensitive-data gate.
- `context`: screen/flow details such as recipe, current step, session state.

Design rule:
- Missing non-critical context -> continue conservatively.
- Missing critical context -> ask one focused clarification (or mark warning in structured output).

## Prompt and Schema Registry

| Prompt | Purpose | Schema | Suggested model class | Suggested API route |
|---|---|---|---|---|
| `ai/prompts/01-chef-assistant-chat-v1.md` | In-app cooking chat guidance + action intents | `ai/schemas/chat_assistant_response_v1.json` | Gemini Flash | `/api/ai/chat` |
| `ai/prompts/02-chef-assistant-voice-v1.md` | Voice transcript handling for concise spoken guidance | `ai/schemas/voice_assistant_response_v1.json` | Gemini Flash / Live-adjacent text mode | `/api/ai/voice-turn` |
| `ai/prompts/03-onboarding-evaluator-v1.md` | Onboarding analysis to skill level and normalized profile | `ai/schemas/onboarding_evaluation_v1.json` | Gemini Flash | `/api/ai/onboarding/evaluate` |
| `ai/prompts/04-recipe-allergy-adaptation-v1.md` | Safety-focused recipe adaptation | `ai/schemas/recipe_adaptation_v1.json` | Gemini Flash | `/api/ai/recipe/adapt` |
| `ai/prompts/05-recipe-customization-v1.md` | Free-form recipe customization | `ai/schemas/recipe_customization_v1.json` | Gemini Flash | `/api/ai/recipe/customize` |
| `ai/prompts/06-meal-plan-generator-v1.md` | Multi-day personalized meal plan | `ai/schemas/meal_plan_generation_v1.json` | Gemini Flash | `/api/ai/meal-plan/generate` |
| `ai/prompts/07-fridge-recipe-generator-v1.md` | Pantry/fridge-based recipe generation | `ai/schemas/fridge_recipe_generation_v1.json` | Gemini Flash | `/api/ai/fridge/generate` |
| `ai/prompts/08-challenge-generator-v1.md` | Personal/community challenge generation | `ai/schemas/challenge_generation_v1.json` | Gemini 3.1 Flash-Lite or Flash | `/api/ai/challenges/generate` |
| `ai/prompts/09-image-moderation-v1.md` | NSFW/relevance moderation classification | `ai/schemas/image_moderation_v1.json` | Gemini 3.1 Flash-Lite vision | `/api/ai/moderation/image` |
| `ai/prompts/10-receipt-ocr-extraction-v1.md` | Receipt OCR extraction for pantry ingestion | `ai/schemas/receipt_ocr_v1.json` | Gemini 3.1 Flash-Lite vision | `/api/ai/ocr/receipt` |
| `ai/prompts/11-recipe-translation-v1.md` | CZ/EN recipe translation preserving structure | `ai/schemas/recipe_translation_v1.json` | Gemini 3.1 Flash-Lite / Flash | `/api/ai/recipe/translate` |

Note: Live native audio prompt is documented separately in `ai/prompts/12-live-chef-native-audio-v1.md` and `ai/docs/LIVE.md`.

## Data Mapping and Audit Notes

When integrating each feature, log at least:
- prompt identifier and version
- schema identifier and version
- model name/version
- request payload hash or id
- response payload
- latency and token usage where available
- success/failure and validation errors

Storage guidance:
- Use `public.ai_interactions` for per-call logs.
- Use `interaction_kind` aligned to feature intent (`chat`, `voice`, `onboarding_eval`, `recipe_adaptation`, etc.).
- Use `public.ai_generated_assets` for generated objects persisted to domain entities.

## Review Checklist

Prompt quality:
- Prompt has clear role, input contract, and numbered rules.
- Prompt references exactly one schema.
- Prompt includes locale and safety behavior.

Schema quality:
- `additionalProperties: false` on objects where shape must be stable.
- Required fields are complete for downstream writes.
- Enum values match app/domain constraints.

Runtime quality:
- Validation happens before side effects.
- Invalid outputs are retried/fallbacked and logged.
- Consent flags are enforced before personalization.

## Maintenance Rules

Versioning:
- Do not silently repurpose existing `v1` semantics.
- For behavior changes, create new prompt/schema versions (`v2`) and migrate routes deliberately.

Documentation updates:
- Any new prompt requires:
  - prompt file in `ai/prompts/`
  - schema file in `ai/schemas/`
  - registry entry in this document
  - route-level integration and logging plan

Testing expectations:
- Happy path examples
- Edge cases (missing context, consent off, malformed user input)
- Adversarial cases (prompt injection, unsafe requests)
- Validation-failure and fallback behavior
