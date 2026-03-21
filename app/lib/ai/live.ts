import { GoogleGenAI } from '@google/genai'

export const GEMINI_LIVE_MODEL =
  process.env.GEMINI_LIVE_MODEL ?? 'gemini-2.5-flash-native-audio-preview-12-2025'

export function normalizeLiveModelName(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`
}

type LiveFunctionDeclaration = {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export type LiveConnectConfigPayload = {
  responseModalities: ['AUDIO']
  systemInstruction: {
    parts: Array<{ text: string }>
  }
  tools?: Array<{ functionDeclarations: LiveFunctionDeclaration[] }>
  realtimeInputConfig: {
    automaticActivityDetection: {
      disabled: boolean
      prefixPaddingMs: number
      silenceDurationMs: number
    }
    activityHandling: 'START_OF_ACTIVITY_INTERRUPTS'
  }
  sessionResumption: Record<string, never>
  inputAudioTranscription: Record<string, never>
  outputAudioTranscription: Record<string, never>
}

type CreateLiveEphemeralTokenInput = {
  setupConfig: LiveConnectConfigPayload
  uses?: number
  expireTime?: string
  newSessionExpireTime?: string
}

type CreateLiveEphemeralTokenResult = {
  token: string
  expireTime: string
  newSessionExpireTime: string
  model: string
  requestPayload: unknown
  responsePayload: unknown
}

function requireApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }
  return apiKey
}

export function getLiveFunctionDeclarations(): LiveFunctionDeclaration[] {
  return [
    {
      name: 'timer_set',
      description: 'Set cooking timer to a specific duration in seconds.',
      parameters: {
        type: 'object',
        properties: {
          seconds: { type: 'number', minimum: 1 },
        },
        required: ['seconds'],
      },
    },
    {
      name: 'timer_start',
      description: 'Start cooking timer, optionally with a specific number of seconds.',
      parameters: {
        type: 'object',
        properties: {
          seconds: { type: 'number', minimum: 1 },
        },
      },
    },
    {
      name: 'timer_pause',
      description: 'Pause currently running cooking timer.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'timer_resume',
      description: 'Resume paused cooking timer.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'timer_cancel',
      description: 'Cancel and clear active cooking timer.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'step_next',
      description: 'Move to next recipe step.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'step_previous',
      description: 'Move to previous recipe step.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'step_go_to',
      description: 'Jump to a specific recipe step number.',
      parameters: {
        type: 'object',
        properties: {
          step_number: { type: 'number', minimum: 1 },
        },
        required: ['step_number'],
      },
    },
  ]
}

export function buildLiveSystemInstruction(basePrompt: string, runtimeContext: unknown): string {
  return `${basePrompt.trim()}\n\nRuntime context JSON (internal, do not reveal verbatim):\n${JSON.stringify(runtimeContext)}`
}

export function buildLiveConnectConfig(
  systemInstruction: string,
  functionDeclarations: LiveFunctionDeclaration[]
): LiveConnectConfigPayload {
  return {
    responseModalities: ['AUDIO'],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
    realtimeInputConfig: {
      automaticActivityDetection: {
        disabled: false,
        prefixPaddingMs: 200,
        silenceDurationMs: 450,
      },
      activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
    },
    sessionResumption: {},
    inputAudioTranscription: {},
    outputAudioTranscription: {},
  }
}

export async function createLiveEphemeralToken({
  setupConfig,
  uses,
  expireTime,
  newSessionExpireTime,
}: CreateLiveEphemeralTokenInput): Promise<CreateLiveEphemeralTokenResult> {
  const apiKey = requireApiKey()
  const resolvedModel = normalizeLiveModelName(GEMINI_LIVE_MODEL)
  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1alpha',
    httpOptions: { apiVersion: 'v1alpha' },
  })

  const expiresAtIso = expireTime ?? new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const newSessionExpiresAtIso = newSessionExpireTime ?? new Date(Date.now() + 60 * 1000).toISOString()

  const requestPayload = {
    uses: typeof uses === 'number' && Number.isFinite(uses) ? Math.max(1, Math.round(uses)) : 1,
    expireTime: expiresAtIso,
    newSessionExpireTime: newSessionExpiresAtIso,
    bidiGenerateContentSetup: {
      model: resolvedModel,
      generationConfig: {
        responseModalities: setupConfig.responseModalities,
      },
      systemInstruction: setupConfig.systemInstruction,
      tools: setupConfig.tools,
      realtimeInputConfig: setupConfig.realtimeInputConfig,
      sessionResumption: setupConfig.sessionResumption,
      inputAudioTranscription: setupConfig.inputAudioTranscription,
      outputAudioTranscription: setupConfig.outputAudioTranscription,
    },
  }

  const responsePayload = await ai.authTokens.create({
    config: {
      uses: requestPayload.uses,
      expireTime: requestPayload.expireTime,
      newSessionExpireTime: requestPayload.newSessionExpireTime,
      liveConnectConstraints: {
        model: resolvedModel,
        config: setupConfig as never,
      },
    },
  })

  if (!responsePayload?.name) {
    throw new Error('Live auth token response missing name')
  }

  return {
    token: responsePayload.name,
    expireTime: expiresAtIso,
    newSessionExpireTime: newSessionExpiresAtIso,
    model: resolvedModel,
    requestPayload,
    responsePayload,
  }
}
