# Gemini Live integrace (aktualni stav)

Tento dokument popisuje aktualni implementaci realtime hlasoveho asistenta v projektu zemLOVEka.

## Stav implementace

Live voice je nasazeny a pouziva ho herni asistent Sefkuchar v UI.

Architektura:
- Prohlizec se pripojuje na Gemini Live pres WebSocket pomoci `@google/genai`.
- Backend mintuje kratkodobe (ephemeral) tokeny a sklada runtime konfiguraci pro kazdou session.
- Primarni API klic zustava pouze na serveru.

Hlavni implementacni soubory:
- Klientsky hook: `app/components/game/ai/useLiveChefSession.ts`
- UI komponenta: `app/components/game/ChefFab.tsx`
- Mic worklet: `public/audio-worklets/mic-capture-processor.js`
- Playback worklet: `public/audio-worklets/live-playback-processor.js`
- Token endpoint: `app/api/ai/live/token/route.ts`
- Session config endpoint: `app/api/ai/live/session-config/route.ts`
- Logovani turnu: `app/api/ai/live/log-turn/route.ts`
- Live utility: `app/lib/ai/live.ts`, `app/lib/ai/liveContext.ts`

Poznamka:
- Hlasovy asistent pouziva uz jen Live API flow; non-live `POST /api/ai/voice-turn` endpoint byl odstranen.

## Model, SDK a API verze

- Env promenna modelu: `GEMINI_LIVE_MODEL`
- Vychozi model: `gemini-2.5-flash-native-audio-preview-12-2025`
- SDK: `@google/genai`
- Verze Live API: `v1alpha`

## End-to-end flow

1. Klient zavola `POST /api/ai/live/token`.
2. Backend overi uzivatele (`getSession`) a pripravi runtime kontext.
3. Backend vytvori omezeny ephemeral token (`authTokens.create`) a vrati:
   - token
   - model
   - live config
4. Klient otevre session pres `ai.live.connect({ model, config, callbacks })`.
5. Klient streamuje mikrofon pres `sendRealtimeInput({ audio: ... })`.
6. Klient prijima transcript/audio, aktualizuje stream zpravy a prehrava PCM vystup.
7. Tool calls se vykonaji na klientovi a vraci se zpet pres `sendToolResponse(...)`.
8. Metadata/transkripty turnu se ukladaji pres `POST /api/ai/live/log-turn`.

## Implementovane endpointy

### `POST /api/ai/live/token`

Ucel:
- Mint ephemeral tokenu s omezenim pro Live session.
- Sestaveni a vraceni konfigurace, kterou klient opravdu pouzije.

Autorizace:
- Vyžaduje prihlasenou session (`getSession`), jinak `401`.

Body (pouzita pole):
- `locale`
- `screen_context`
- `cooking_session_id` (volitelne)
- `cooking_context` (volitelny klientsky kontext)
- `uses`, `expire_time`, `new_session_expire_time` (volitelna kontrola zivotnosti tokenu)

Response:
- `token`
- `expireTime`
- `newSessionExpireTime`
- `model`
- `config`
- `apiVersion`

Poznamky:
- Vydani tokenu se loguje do `public.ai_interactions` (`interaction_kind = voice`).
- Token je ve ulozenem payloadu redigovany (maskovany).

### `POST /api/ai/live/session-config`

Ucel:
- Sestavi `model + config` bez mintu tokenu.

Aktualni vyuziti:
- Kompatibilita/fallback. Primarni flow ma brat config z `/api/ai/live/token`.

### `POST /api/ai/live/log-turn`

Ucel:
- Persistuje metadata a transkripty na urovni turnu.

Implementace:
- Uklada se pres `logAiInteraction(...)` do `public.ai_interactions`.

## Runtime kontext a consent pravidla

Runtime kontext se sklada v `buildLiveRuntimeContext(...)` z:
- `locale` + `screen_context`
- uzivatelskeho profilu (`getAiUserContext`)
- kontextu vareni z DB (`getCookingSessionContext`)
- volitelneho klientskem dodaneho kontextu (`sanitizeCookingContext`)

Merge pravidla:
- DB kontext a klientsky kontext se spojuji pres `mergeCookingContexts(...)`.
- Klientsky vstup je pred pouzitim sanitizovany a velikostne omezeny.

Consent pravidla:
- `allergies` se vkladaji pouze pri `health_data_consent_granted = true`.
- Personalizacni flagy se predavaji do runtime prompt kontextu.

## Live konfigurace (aktualni)

Sklada se v `buildLiveConnectConfig(...)`:
- `responseModalities: ['AUDIO']`
- `systemInstruction` z `ai/prompts/12-live-chef-native-audio-v1.md` + runtime JSON kontext
- deklarace nastroju (timer/kroky)
- zapnute `inputAudioTranscription` a `outputAudioTranscription`
- `sessionResumption: {}`
- `realtimeInputConfig`:
  - `automaticActivityDetection.disabled = false`
  - `automaticActivityDetection.prefixPaddingMs = 200`
  - `automaticActivityDetection.silenceDurationMs = 450`
  - `activityHandling = 'START_OF_ACTIVITY_INTERRUPTS'`

## Audio pipeline (aktualni)

Vstup:
- Zachyt mikrofonu pouziva `AudioWorkletNode` (`mic-capture-processor`).
- Worklet batchuje float vzorky (4096) na main thread.
- Klient downsampluje na PCM16 16 kHz mono a odesila base64 chunky.

Vystup:
- Live audio chunky se dekoduji do float32 a posilaji do playback worklet fronty.
- Prehravani bezi v `AudioContext({ sampleRate: 24000 })`.
- Playback fronta ma omezeny backlog (omezovani latency).
- `interrupt` okamzite vycisti playback frontu.

## Chovani transcriptu

- Streamovane input/output transcript updaty se mergeuji do aktivni zpravy.
- Partial chunky se mergeuji inkrementalne (ne nahrazenim celeho textu).
- Stream ID se finalizuje pri `finished`, `turnComplete` nebo `generationComplete`.

## Tool calling (aktualni)

Deklarovane intenty:
- `timer_set` `{ "seconds": number }`
- `timer_start` `{ "seconds": number }`
- `timer_pause` `{}`
- `timer_resume` `{}`
- `timer_cancel` `{}`
- `step_next` `{}`
- `step_previous` `{}`
- `step_go_to` `{ "step_number": number }`

Vykonani:
- Tool calls se parsuji v client hooku a vykonavaji pres `onToolAction`.
- Vysledky se vraci modelu pres `sendToolResponse({ functionResponses })`.
- Chyby se vraci explicitne; model nema tvrdit uspesne provedeni bez potvrzeni tool resultu.

## Bezpecnost, soukromi a audit

- Do browseru nikdy nejde dlouhodoby Gemini API klic.
- Browser dostane pouze ephemeral token a omezenou konfiguraci.
- Zdravotni/personalizacni data jsou pred prompt injectem podminenna souhlasem.
- Live token issuance i turn logy jsou auditovatelne v `public.ai_interactions`.

## Databazove body

- `public.ai_interactions`: vydani live tokenu + logovani turnu (`interaction_kind = voice`)
- `public.ai_generated_assets`: pouzivaji non-live endpointy, ne core live turn loop

## Operacni poznamky a troubleshooting

- Prvni frame `setupComplete` je ocekavany a neznamena chybu.
- Devtools mohou incoming setup frame zobrazit jako binarni/hex i kdyz payload je JSON.
- Pri zavreni socketu se session/mic korektne cisti a UI ukazuje close code/reason (pokud je k dispozici).
- Nejcastejsi symptom vysoke latency je rostouci playback backlog; overit `interrupt` a rychlost odberu fronty.

## Rychly checklist overeni

1. Spustit hlas v Chef UI a overit jednorazovy `setupComplete`.
2. Overit, ze odchozi mic chunky maji `audio/pcm;rate=16000`.
3. Overit, ze output transcript stream updatuje jednu aktivni zpravu (in-place).
4. Overit, ze preruseni okamzite cisti playback frontu.
5. Overit zapisy `live/log-turn` v `public.ai_interactions`.
