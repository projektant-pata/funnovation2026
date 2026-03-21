import { generateStructuredJson } from '@/app/lib/ai/gemini'
import { loadPromptAsset, loadSchemaAsset } from '@/app/lib/ai/assets'

type OnboardingInput = {
  locale: 'cs' | 'en'
  cookingFrequency: 'never' | 'few_per_month' | 'few_per_week' | 'daily' | null
  dietCodes: string[]
  allergenCodes: string[]
  healthDataConsentGranted: boolean
}

export type OnboardingEvaluation = {
  skillLevel: number
  confidence: number
  rationale: string
  campaignStartNodeKey: string
  modelName: string
  systemPrompt: string
  usedAi: boolean
  requestPayload: unknown
  responsePayload: unknown
  responseText: string
  promptTokens: number | null
  completionTokens: number | null
  totalTokens: number | null
}

function clampSkillLevel(value: number): number {
  if (!Number.isFinite(value)) return 1
  if (value < 1) return 1
  if (value > 7) return 7
  return Math.round(value)
}

function fallbackSkillLevel(cookingFrequency: OnboardingInput['cookingFrequency']) {
  switch (cookingFrequency) {
    case 'daily':
      return 6
    case 'few_per_week':
      return 4
    case 'few_per_month':
      return 2
    case 'never':
    default:
      return 1
  }
}

function normalizeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

export async function evaluateOnboarding(input: OnboardingInput): Promise<OnboardingEvaluation> {
  const fallbackLevel = fallbackSkillLevel(input.cookingFrequency)
  const fallback: OnboardingEvaluation = {
    skillLevel: fallbackLevel,
    confidence: 0.4,
    rationale: 'Fallback heuristic based on cooking frequency.',
    campaignStartNodeKey: 'first_dinner',
    modelName: 'fallback-local-heuristic',
    systemPrompt: 'fallback-local-heuristic',
    usedAi: false,
    requestPayload: {
      locale: input.locale,
      answers: {
        cooking_frequency: input.cookingFrequency,
        techniques: [],
        allergies: input.healthDataConsentGranted ? input.allergenCodes : [],
        diets: input.dietCodes,
        motivations: [],
        time_budget: null,
      },
      consent: {
        health_data_consent_granted: input.healthDataConsentGranted,
        ai_personalization_granted: true,
      },
    },
    responsePayload: {
      schema_version: 'v1',
      skill_level: fallbackLevel,
      confidence: 0.4,
      normalized_profile: {
        cooking_frequency: input.cookingFrequency ?? 'never',
        time_budget: 'under_30',
        motivations: [],
        diets: input.dietCodes,
        allergies_used_for_personalization: input.healthDataConsentGranted,
      },
      campaign_start_node_key: 'first_dinner',
      rationale: 'Fallback heuristic based on cooking frequency.',
      warnings: ['Gemini unavailable, fallback used'],
    },
    responseText: JSON.stringify({ skill_level: fallbackLevel }),
    promptTokens: null,
    completionTokens: null,
    totalTokens: null,
  }

  try {
    const systemPrompt = await loadPromptAsset('03-onboarding-evaluator-v1.md')
    const responseJsonSchema = await loadSchemaAsset('onboarding_evaluation_v1.json')

    const result = await generateStructuredJson({
      model: process.env.GEMINI_ONBOARDING_MODEL ?? process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      systemPrompt,
      input: fallback.requestPayload,
      responseJsonSchema,
      temperature: 0,
      maxOutputTokens: 600,
    })

    const parsed = normalizeObject(result.parsed)
    const skillLevel = clampSkillLevel(Number(parsed.skill_level))
    const confidence = Number(parsed.confidence)
    const rationale = typeof parsed.rationale === 'string' ? parsed.rationale : fallback.rationale
    const campaignStartNodeKey =
      typeof parsed.campaign_start_node_key === 'string' && parsed.campaign_start_node_key.length > 0
        ? parsed.campaign_start_node_key
        : fallback.campaignStartNodeKey

    return {
      skillLevel,
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : fallback.confidence,
      rationale,
      campaignStartNodeKey,
      modelName: result.modelName,
      systemPrompt,
      usedAi: true,
      requestPayload: result.requestPayload,
      responsePayload: result.responsePayload,
      responseText: result.responseText,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    }
  } catch (error) {
    console.error('Onboarding evaluation fallback:', error)
    return fallback
  }
}
