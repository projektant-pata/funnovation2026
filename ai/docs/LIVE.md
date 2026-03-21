# Gemini Live Integration Notes (Option 1: Ephemeral Token + Browser Direct)

This document is for future implementers and reviewers wiring real-time voice in žemLOVEka.

## Decision

Chosen architecture: browser client connects directly to Gemini Live API using short-lived ephemeral tokens minted by our backend.

Why this option:
- Lower end-to-end latency than server WebSocket proxy.
- Simpler infrastructure for hackathon demo.
- API key stays server-side.

Current blocker:
- Function calling handlers are not wired yet because action targets are blocked by other team workstreams.
- Prompt already defines tool intents and contracts in `ai/prompts/12-live-chef-native-audio-v1.md`.

## Model and SDK

- Model: `gemini-2.5-flash-native-audio-preview-12-2025`
- JS SDK: `@google/genai`

Do not use deprecated Live models or deprecated SDKs.

## High-Level Flow

1. Client requests ephemeral token from backend endpoint.
2. Backend validates session/user and mints ephemeral token with server API key.
3. Client opens Live session directly with Gemini using ephemeral token.
4. Client streams mic audio chunks via `sendRealtimeInput({ audio: ... })`.
5. Client receives output audio chunks and plays them from a queue.
6. Optional transcripts are rendered in the Chef sidebar.
7. On disconnect/token expiry, client obtains a new ephemeral token and reconnects.

## Endpoint Suggestions

Recommended routes:
- `POST /api/ai/live/token`
- `POST /api/ai/live/session-config`
- `POST /api/ai/live/log-turn` (optional batching to reduce write load)

### `POST /api/ai/live/token`

Purpose:
- Mint short-lived token for Live API.

Server responsibilities:
- Authenticate user (if present).
- Validate feature gating and abuse controls.
- Never return long-lived API key to client.

Response shape suggestion:

```json
{
	"success": true,
	"token": "<ephemeral-token>",
	"expiresAt": "2026-03-21T12:00:00Z"
}
```

### `POST /api/ai/live/session-config`

Purpose:
- Build per-session instruction and context payload from DB/profile/session state.
- Resolve locale and consent flags.

Inputs:
- `locale`
- `cooking_session_id` (optional)
- `screen_context`

Output:
- `model`
- `systemInstruction`
- `tools` declaration (even if handlers are currently stubbed)

## Prompt Source of Truth

Live system prompt:
- `ai/prompts/12-live-chef-native-audio-v1.md`

Notes:
- Keep this prompt immutable by version and reference version in logs.
- If changing behavior, create `v2` file instead of silent in-place semantic changes.

## Live API Configuration Notes

Use `sendRealtimeInput` for all live user inputs:
- audio
- video
- text

Do not send user turns via `sendClientContent`.
Use `sendClientContent` only for appending prior conversation history when needed.

Audio format expectations:
- Input: PCM16 LE, mono, 16kHz (`audio/pcm;rate=16000`)
- Output: PCM16 LE, mono, 24kHz

On interruption (`interrupted = true`):
- Stop playback immediately.
- Flush queued audio chunks.
- Continue with latest user intent only.

## Function Calling (Planned Wiring)

Current status:
- Prompt contracts are defined; runtime handlers are pending.

Planned tool intents:
- `timer_set` `{ "seconds": number }`
- `timer_start` `{ "seconds": number }`
- `timer_pause` `{}`
- `timer_resume` `{}`
- `timer_cancel` `{}`
- `step_next` `{}`
- `step_previous` `{}`
- `step_go_to` `{ "step_number": number }`

Implementation rule:
- Model should not claim success until tool result confirms success.
- If tool unavailable/fails, fallback to concise manual guidance.

## Data, Consent, and Safety Requirements

Must enforce:
- If health consent is missing, do not apply allergy personalization.
- If AI personalization is disabled, use generic guidance.
- Keep API keys server-only.

Database alignment references:
- `schema.sql` `public.ai_interactions` for turn logging.
- `schema.sql` `public.ai_interaction_kind` includes `voice`.
- `schema.sql` health consent integrity is enforced for stored allergy data.

## Logging Recommendations

At minimum per turn store:
- `interaction_kind = voice`
- `model_name`
- prompt version hash/id
- timing (`latency_ms`)
- token usage if available
- user transcript and model transcript
- tool call request/result payloads (when available)

Suggested extension for later migration:
- Add `conversation_id` and `turn_index` to `ai_interactions` for deterministic replay.

## Reviewer Checklist

Security:
- No Gemini API key in client bundle.
- Token endpoint validates auth/rate limits.

Correct API usage:
- Uses `sendRealtimeInput` for new live user input.
- Does not misuse `sendClientContent`.

Audio correctness:
- Input correctly encoded to PCM16 16kHz mono.
- Output playback handles PCM16 24kHz correctly.
- Playback queue flushes on interruption.

Safety and compliance:
- Consent flags passed into session context.
- Prompt version logged.
- Refusals/safe alternatives observed in risky prompts.

## Test Plan (Minimum)

1. Connect/disconnect and auto-reconnect with renewed ephemeral token.
2. Speech interruption test while model is speaking.
3. Mixed Czech/English user utterances with locale-locked output.
4. Consent-off scenario: allergy data must not affect advice.
5. Command utterances for timer and step navigation (once handlers are wired).
6. 10+ minute stability check with repeated turn-taking.
