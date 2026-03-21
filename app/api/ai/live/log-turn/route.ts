import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { logAiInteraction } from '@/app/lib/ai/logging'
import { GEMINI_LIVE_MODEL } from '@/app/lib/ai/live'

type LiveLogTurnBody = {
  context_screen?: string
  cooking_session_id?: string | null
  model_name?: string
  input_transcript?: string
  output_transcript?: string
  latency_ms?: number
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  request_payload?: unknown
  response_payload?: unknown
  success?: boolean
  error_message?: string | null
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as LiveLogTurnBody

  const interactionId = await logAiInteraction({
    userId: session.userId,
    cookingSessionId: body.cooking_session_id ?? null,
    contextScreen: body.context_screen ?? 'live',
    interactionKind: 'voice',
    modelName: body.model_name ?? GEMINI_LIVE_MODEL,
    systemPrompt: '12-live-chef-native-audio-v1',
    userMessage: body.input_transcript ?? null,
    responseText: body.output_transcript ?? null,
    requestPayload: body.request_payload ?? {},
    responsePayload: body.response_payload ?? {},
    promptTokens:
      typeof body.prompt_tokens === 'number' && Number.isFinite(body.prompt_tokens)
        ? Math.max(0, Math.round(body.prompt_tokens))
        : null,
    completionTokens:
      typeof body.completion_tokens === 'number' && Number.isFinite(body.completion_tokens)
        ? Math.max(0, Math.round(body.completion_tokens))
        : null,
    totalTokens:
      typeof body.total_tokens === 'number' && Number.isFinite(body.total_tokens)
        ? Math.max(0, Math.round(body.total_tokens))
        : null,
    latencyMs:
      typeof body.latency_ms === 'number' && Number.isFinite(body.latency_ms)
        ? Math.max(0, Math.round(body.latency_ms))
        : null,
    success: body.success !== false,
    errorMessage: body.error_message ?? null,
  })

  return NextResponse.json({ success: true, interaction_id: interactionId })
}
