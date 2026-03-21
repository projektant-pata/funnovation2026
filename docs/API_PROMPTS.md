# Prompty a strukturovane vystupy API (aktualni stav)

Tento dokument shrnuje aktualni non-live AI prompt stack, schema kontrakty a napojeni endpointu.

Pro realtime hlasovou architekturu viz `docs/LIVE.md`.

## Aktualni architektura

V projektu existuji dve AI vykonavaci vetve:

1. Strukturovana JSON generace (non-live)
- Pouziva se pro chat a task-style endpointy.
- Implementace: `generateStructuredJson(...)` v `app/lib/ai/gemini.ts`.
- Volani Gemini odesila `responseMimeType: application/json` + JSON schema.

2. Gemini Live native audio
- Samostatny flow pres Live API + ephemeral tokeny.
- Prompt: `ai/prompts/12-live-chef-native-audio-v1.md`.
- Detaily viz `docs/LIVE.md`.

## Konvence promptingu v kodu

Prompt assets a schema assets se nacitaji z disku pres:
- `loadPromptAsset(...)`
- `loadSchemaAsset(...)`
- soubor: `app/lib/ai/assets.ts`

Sdilena orchestracni vrstva pro non-live:
- `runStructuredTask(...)` v `app/lib/ai/task-runner.ts`
- zodpovednosti:
  - nacist prompt + schema
  - zavolat Gemini pro strukturovany JSON vystup
  - zalogovat request/response metadata do `public.ai_interactions`

## Bezpecnost a consent model (implementovano)

- Zdravotni personalizace je striktně consent-gated:
  - alergie se vkladaji jen pri `health_data_consent_granted = true`
- Kontext uzivatele se do promptu predava v normalizovanem tvaru.
- Strukturovane vystupy musi odpovidat route schema kontraktu.
- Chybove stavy se loguji; cast endpointu vraci explicitni degraded fallback response.

## Konfigurace modelu (aktualni defaulty)

Non-live helper:
- Default API base: `https://generativelanguage.googleapis.com/v1beta`
- Default model fallback: `gemini-3-flash-preview`
- Env override: `GEMINI_TEXT_MODEL`

Route-level override retezce:
- Chat: `GEMINI_CHAT_MODEL ?? GEMINI_TEXT_MODEL ?? gemini-3-flash-preview`
- Onboarding: `GEMINI_ONBOARDING_MODEL ?? GEMINI_TEXT_MODEL ?? gemini-3-flash-preview`

## Registr promptu a schemat (napojene endpointy)

| Prompt | Schema | Route | Interaction kind | Zdroj modelu |
|---|---|---|---|---|
| `ai/prompts/01-chef-assistant-chat-v1.md` | `ai/schemas/chat_assistant_response_v1.json` | `POST /api/ai/chat` | `chat` | `GEMINI_CHAT_MODEL ?? GEMINI_TEXT_MODEL` |
| `ai/prompts/03-onboarding-evaluator-v1.md` | `ai/schemas/onboarding_evaluation_v1.json` | `POST /api/ai/onboarding/evaluate` | `onboarding_eval` | `GEMINI_ONBOARDING_MODEL ?? GEMINI_TEXT_MODEL` |
| `ai/prompts/04-recipe-allergy-adaptation-v1.md` | `ai/schemas/recipe_adaptation_v1.json` | `POST /api/ai/recipe/adapt` | `recipe_adaptation` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/05-recipe-customization-v1.md` | `ai/schemas/recipe_customization_v1.json` | `POST /api/ai/recipe/customize` | `recipe_adaptation` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/06-meal-plan-generator-v1.md` | `ai/schemas/meal_plan_generation_v1.json` | `POST /api/ai/meal-plan/generate` | `meal_plan_generation` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/07-fridge-recipe-generator-v1.md` | `ai/schemas/fridge_recipe_generation_v1.json` | `POST /api/ai/fridge/generate` | `fridge_recipe` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/08-challenge-generator-v1.md` | `ai/schemas/challenge_generation_v1.json` | `POST /api/ai/challenges/generate` | `challenge_generation` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/09-image-moderation-v1.md` | `ai/schemas/image_moderation_v1.json` | `POST /api/ai/moderation/image` | `image_moderation` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/10-receipt-ocr-extraction-v1.md` | `ai/schemas/receipt_ocr_v1.json` | `POST /api/ai/ocr/receipt` | `ocr` | `GEMINI_TEXT_MODEL` |
| `ai/prompts/11-recipe-translation-v1.md` | `ai/schemas/recipe_translation_v1.json` | `POST /api/ai/recipe/translate` | `translation` | `GEMINI_TEXT_MODEL` |

Live prompt (separatni flow):
- `ai/prompts/12-live-chef-native-audio-v1.md`

## Perzistence a side effects endpointu

Endpointy, ktere ukladaji vygenerovane domenní entity:
- `/api/ai/recipe/adapt` -> volitelna perzistence receptu (`recipes`)
- `/api/ai/recipe/customize` -> volitelna perzistence receptu (`recipes`)
- `/api/ai/meal-plan/generate` -> volitelna perzistence (`meal_plans`, `meal_plan_items`)
- `/api/ai/fridge/generate` -> volitelna perzistence receptu (`recipes`)
- `/api/ai/challenges/generate` -> volitelna perzistence (`challenges`, `personal_challenges`)
- `/api/ai/ocr/receipt` -> perzistence do OCR tabulek (jobs/items)
- `/api/ai/moderation/image` -> perzistence do `image_moderation_logs`
- `/api/ai/recipe/translate` -> volitelna perzistence do `recipe_translations`

Vsechny strukturovane route loguji interakce pres `logAiInteraction(...)` primo nebo pres `runStructuredTask(...)`.

## Logging a audit pole

Primarni tabulky:
- `public.ai_interactions`
- `public.ai_generated_assets`

Logovana metadata typicky obsahuji:
- typ interakce (`interaction_kind`)
- model
- prompt text (nebo prompt identifikator + kontext)
- user message / response text (pokud je dostupny)
- request/response payload
- latenci
- token usage (pokud provider vraci)
- success/failure + error message

## Validace a parsovani JSON vystupu

`generateStructuredJson(...)` aktualne:
- vyzaduje JSON response se schema guidance
- bere prvni text part z Gemini odpovedi
- robustne parsuje JSON ve variantach:
  - cisty JSON
  - fenced JSON blok
  - prvni validni JSON blok z mixovaneho textu
- vyhodi chybu, pokud JSON chybi nebo je nevalidni

Route-level vrstva pak rozhoduje, zda:
- vratit chybu
- vratit degraded fallback payload
- persistovat vygenerovane entity

## Doplnene prakticke detaily

- **Kontrakt je nadrizeny promptu:** schema je zdroj pravdy pro API; prompt se muze ladit, schema je zavazne.
- **Verzovani:** pri zmene struktury vystupu vytvor novy `vN` prompt i schema, nerecykluj stavajici semantiku potichu.
- **Idempotence perzistence:** tam, kde endpoint umi `persist`/`persist_recipe`, testuj oba rezimy (on/off), aby nevznikaly duplicitni zapisy.
- **Locale discipline:** vystupni texty musi respektovat `locale` (`cs`/`en`), i kdyz interni metadata zustavaji technicka.
- **Observabilita:** pri regresi nejdriv kontroluj `public.ai_interactions` (prompt context, latency, parse error).

## Udrzbova pravidla

- Drz prompt a schema verze v souladu (`v1`, `v2`, ...).
- Nemen potichu semantiku existujiciho promptu.
- Pri pridani nove AI funkce pridej vzdy vsechno:
  - prompt soubor do `ai/prompts/`
  - schema soubor do `ai/schemas/`
  - route wiring do `app/api/ai/...`
  - aktualizaci registru v tomto dokumentu

## Rychly smoke checklist

1. Spustit alespon jedno volani pro kazdou non-live route a overit validni parse JSON.
2. Overit, ze se pro kazde volani zapisuje `ai_interactions`.
3. Overit, ze pri `consent = off` nejdou alergie do prompt kontextu.
4. Overit prepinace perzistence (`persist`, `persist_recipe`).
5. Overit degraded fallback chovani u `chat` a `onboarding` pri chybe modelu.
