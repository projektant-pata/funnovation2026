const DEFAULT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview'
const DEFAULT_API_BASE = process.env.GEMINI_API_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta'
const STRUCTURED_OUTPUT_THINKING_BUDGET = 0

type Usage = {
  promptTokens: number | null
  completionTokens: number | null
  totalTokens: number | null
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { mimeType?: string; fileUri: string } }

export type GeminiContent = {
  role?: 'user' | 'model'
  parts: GeminiPart[]
}

export type GenerateStructuredJsonResult = {
  modelName: string
  requestPayload: unknown
  responsePayload: unknown
  responseText: string
  parsed: unknown
  usage: Usage
}

type GenerateStructuredJsonInput = {
  systemPrompt: string
  input: unknown
  responseJsonSchema: unknown
  contents?: GeminiContent[]
  model?: string
  temperature?: number
  maxOutputTokens?: number
}

function requireApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }
  return apiKey
}

function extractFirstJsonBlock(input: string): string | null {
  let start = -1
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === '{') {
      if (stack.length === 0) start = i
      stack.push('}')
      continue
    }

    if (ch === '[') {
      if (stack.length === 0) start = i
      stack.push(']')
      continue
    }

    if (ch === '}' || ch === ']') {
      if (stack.length === 0) continue
      const expected = stack[stack.length - 1]
      if (ch !== expected) continue
      stack.pop()
      if (stack.length === 0 && start >= 0) {
        return input.slice(start, i + 1)
      }
    }
  }

  return null
}

function safeJsonParse(value: string): unknown {
  const trimmed = value.trim()

  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed === 'string') {
      return JSON.parse(parsed)
    }
    return parsed
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenced?.[1]) {
      const fencedParsed = JSON.parse(fenced[1].trim())
      if (typeof fencedParsed === 'string') {
        return JSON.parse(fencedParsed)
      }
      return fencedParsed
    }

    const extracted = extractFirstJsonBlock(trimmed)
    if (extracted) {
      const extractedParsed = JSON.parse(extracted)
      if (typeof extractedParsed === 'string') {
        return JSON.parse(extractedParsed)
      }
      return extractedParsed
    }

    throw new Error('Model did not return valid JSON')
  }
}

function getTextFromResponse(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''

  const candidates = (payload as { candidates?: unknown[] }).candidates
  if (!Array.isArray(candidates) || candidates.length === 0) return ''

  const first = candidates[0]
  if (!first || typeof first !== 'object') return ''

  const content = (first as { content?: unknown }).content
  if (!content || typeof content !== 'object') return ''

  const parts = (content as { parts?: unknown[] }).parts
  if (!Array.isArray(parts)) return ''

  for (const part of parts) {
    if (part && typeof part === 'object') {
      const text = (part as { text?: unknown }).text
      if (typeof text === 'string' && text.trim().length > 0) {
        return text
      }
    }
  }

  return ''
}

function getUsageFromResponse(payload: unknown): Usage {
  if (!payload || typeof payload !== 'object') {
    return { promptTokens: null, completionTokens: null, totalTokens: null }
  }

  const usage = (payload as {
    usageMetadata?: {
      promptTokenCount?: number
      candidatesTokenCount?: number
      totalTokenCount?: number
    }
  }).usageMetadata

  return {
    promptTokens: typeof usage?.promptTokenCount === 'number' ? usage.promptTokenCount : null,
    completionTokens: typeof usage?.candidatesTokenCount === 'number' ? usage.candidatesTokenCount : null,
    totalTokens: typeof usage?.totalTokenCount === 'number' ? usage.totalTokenCount : null,
  }
}

export async function generateStructuredJson({
  systemPrompt,
  input,
  responseJsonSchema,
  contents,
  model,
  temperature,
  maxOutputTokens,
}: GenerateStructuredJsonInput): Promise<GenerateStructuredJsonResult> {
  const modelName = model ?? DEFAULT_MODEL
  const apiKey = requireApiKey()

  const requestPayload: {
    systemInstruction: { parts: Array<{ text: string }> }
    contents: GeminiContent[]
    generationConfig: {
      responseMimeType: 'application/json'
      responseJsonSchema: unknown
      temperature: number | undefined
      maxOutputTokens: number | undefined
      thinkingConfig: {
        includeThoughts: boolean
        thinkingBudget: number
      }
    }
  } = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: JSON.stringify(input) }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema,
      temperature,
      maxOutputTokens,
      thinkingConfig: {
        includeThoughts: false,
        thinkingBudget: STRUCTURED_OUTPUT_THINKING_BUDGET,
      },
    },
  }

  if (contents && contents.length > 0) {
    requestPayload.contents = contents
  }

  const url = `${DEFAULT_API_BASE}/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  })

  const responsePayload = (await response.json()) as unknown

  if (!response.ok) {
    const message =
      typeof (responsePayload as { error?: { message?: string } }).error?.message === 'string'
        ? (responsePayload as { error: { message: string } }).error.message
        : 'Gemini API request failed'
    throw new Error(message)
  }

  const responseText = getTextFromResponse(responsePayload)
  if (!responseText) {
    throw new Error('Gemini returned empty response text')
  }

  const parsed = safeJsonParse(responseText)
  const usage = getUsageFromResponse(responsePayload)

  return {
    modelName,
    requestPayload,
    responsePayload,
    responseText,
    parsed,
    usage,
  }
}
