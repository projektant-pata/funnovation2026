import { loadPromptAsset, loadSchemaAsset } from '@/app/lib/ai/assets'
import { generateStructuredJson, type GeminiContent } from '@/app/lib/ai/gemini'
import { logAiInteraction, type AiInteractionKind } from '@/app/lib/ai/logging'

type RunStructuredTaskInput = {
  userId: string | null
  interactionKind: AiInteractionKind
  contextScreen?: string | null
  userMessage?: string | null
  promptFile: string
  schemaFile: string
  model: string
  input: unknown
  contents?: GeminiContent[]
  temperature?: number
  maxOutputTokens?: number
}

export type RunStructuredTaskResult = {
  parsed: unknown
  responseText: string
  modelName: string
  requestPayload: unknown
  responsePayload: unknown
  promptTokens: number | null
  completionTokens: number | null
  totalTokens: number | null
  aiInteractionId: string | null
  systemPrompt: string
}

export async function runStructuredTask(input: RunStructuredTaskInput): Promise<RunStructuredTaskResult> {
  const startedAt = Date.now()
  const systemPrompt = await loadPromptAsset(input.promptFile)
  const responseJsonSchema = await loadSchemaAsset(input.schemaFile)

  try {
    const generated = await generateStructuredJson({
      model: input.model,
      systemPrompt,
      input: input.input,
      contents: input.contents,
      responseJsonSchema,
      temperature: input.temperature,
      maxOutputTokens: input.maxOutputTokens,
    })

    const aiInteractionId = await logAiInteraction({
      userId: input.userId,
      contextScreen: input.contextScreen ?? null,
      interactionKind: input.interactionKind,
      modelName: generated.modelName,
      systemPrompt,
      userMessage: input.userMessage ?? null,
      responseText: generated.responseText,
      requestPayload: generated.requestPayload,
      responsePayload: generated.responsePayload,
      promptTokens: generated.usage.promptTokens,
      completionTokens: generated.usage.completionTokens,
      totalTokens: generated.usage.totalTokens,
      latencyMs: Date.now() - startedAt,
      success: true,
    })

    return {
      parsed: generated.parsed,
      responseText: generated.responseText,
      modelName: generated.modelName,
      requestPayload: generated.requestPayload,
      responsePayload: generated.responsePayload,
      promptTokens: generated.usage.promptTokens,
      completionTokens: generated.usage.completionTokens,
      totalTokens: generated.usage.totalTokens,
      aiInteractionId,
      systemPrompt,
    }
  } catch (error) {
    await logAiInteraction({
      userId: input.userId,
      contextScreen: input.contextScreen ?? null,
      interactionKind: input.interactionKind,
      modelName: input.model,
      systemPrompt,
      userMessage: input.userMessage ?? null,
      requestPayload: input.input,
      responsePayload: {},
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown AI error',
    })
    throw error
  }
}
