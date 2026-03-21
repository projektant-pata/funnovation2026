import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { evaluateOnboarding } from '@/app/lib/ai/onboarding'
import { logAiInteraction } from '@/app/lib/ai/logging'

type EvaluateBody = {
  locale?: 'cs' | 'en'
  cooking_frequency?: 'never' | 'few_per_month' | 'few_per_week' | 'daily' | null
  diet_codes?: string[]
  allergen_codes?: string[]
  health_data_consent_granted?: boolean
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as EvaluateBody

  const locale = body.locale === 'en' ? 'en' : 'cs'

  const evaluation = await evaluateOnboarding({
    locale,
    cookingFrequency: body.cooking_frequency ?? null,
    dietCodes: Array.isArray(body.diet_codes) ? body.diet_codes : [],
    allergenCodes: Array.isArray(body.allergen_codes) ? body.allergen_codes : [],
    healthDataConsentGranted: body.health_data_consent_granted === true,
  })

  await logAiInteraction({
    userId,
    contextScreen: 'onboarding',
    interactionKind: 'onboarding_eval',
    modelName: evaluation.modelName,
    systemPrompt: evaluation.systemPrompt,
    userMessage: JSON.stringify(body),
    responseText: evaluation.responseText,
    requestPayload: evaluation.requestPayload,
    responsePayload: evaluation.responsePayload,
    promptTokens: evaluation.promptTokens,
    completionTokens: evaluation.completionTokens,
    totalTokens: evaluation.totalTokens,
    latencyMs: Date.now() - startedAt,
    success: evaluation.usedAi,
    errorMessage: evaluation.usedAi ? null : 'Fallback onboarding heuristic used',
  })

  return NextResponse.json({
    success: true,
    data: {
      skill_level: evaluation.skillLevel,
      confidence: evaluation.confidence,
      rationale: evaluation.rationale,
      campaign_start_node_key: evaluation.campaignStartNodeKey,
      model_name: evaluation.modelName,
      used_ai: evaluation.usedAi,
    },
  })
}
