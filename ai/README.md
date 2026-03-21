# Balicek AI prompt engineeringu

Tato slozka obsahuje produkcne pripravene prompty a schema assety pro Gemini integraci.

- Prompty: `ai/prompts/*.md`
- Schema strukturovaneho vystupu (kompatibilni s OpenAPI/JSON Schema): `ai/schemas/*.json`
- Dokumentace:
  - `docs/API_PROMPTS.md` (konsolidovana non-Live prompt strategie + safety + schema strategie)
  - `docs/LIVE.md` (architektura Gemini Live a implementacni poznamky)

Konvence:

- Kazdy prompt vraci pouze striktni JSON.
- Kazde schema vyzaduje `schema_version` s enum `v1`.
- Omezeni pro zdravotni data musi respektovat explicitni souhlas.
- Jazyk vystupu musi nasledovat pozadovane locale (`cs` nebo `en`).
