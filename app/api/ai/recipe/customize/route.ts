import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { getAiUserContext } from '@/app/lib/ai/context'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { getRecipeForAi, saveGeneratedRecipe, type AiRecipePayload } from '@/app/lib/ai/recipes'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type CustomizeBody = {
  locale?: 'cs' | 'en'
  recipe_id?: string
  base_recipe?: AiRecipePayload
  user_requests?: string[]
  persist?: boolean
}

function normalizeRecipePayload(value: unknown): AiRecipePayload | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (!raw.title || !raw.description || !Array.isArray(raw.ingredients) || !Array.isArray(raw.steps)) return null

  return {
    title: String(raw.title),
    description: String(raw.description),
    difficulty: Math.max(1, Math.min(5, Number(raw.difficulty ?? 1))),
    prep_time_minutes: Math.max(0, Number(raw.prep_time_minutes ?? 0)),
    cook_time_minutes: Math.max(0, Number(raw.cook_time_minutes ?? 0)),
    servings: Math.max(1, Number(raw.servings ?? 1)),
    ingredients: (raw.ingredients as Array<Record<string, unknown>>).map((item) => ({
      name: String(item.name ?? ''),
      amount: Math.max(0, Number(item.amount ?? 0)),
      unit: String(item.unit ?? ''),
      prep_note: String(item.prep_note ?? ''),
      is_optional: item.is_optional === true,
    })),
    steps: (raw.steps as Array<Record<string, unknown>>).map((step, index) => ({
      step_number: Math.max(1, Number(step.step_number ?? index + 1)),
      instruction: String(step.instruction ?? ''),
      tip: String(step.tip ?? ''),
      default_timer_seconds: Math.max(0, Number(step.default_timer_seconds ?? 0)),
    })),
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as CustomizeBody

  const locale = body.locale === 'en' ? 'en' : 'cs'
  const userContext = userId ? await getAiUserContext(userId) : null

  let baseRecipe = body.base_recipe ?? null
  if (!baseRecipe && body.recipe_id) {
    baseRecipe = await getRecipeForAi(body.recipe_id, locale)
  }

  if (!baseRecipe) {
    return NextResponse.json({ success: false, message: 'Missing base recipe or recipe_id' }, { status: 400 })
  }

  const requests = Array.isArray(body.user_requests) ? body.user_requests.filter(Boolean).slice(0, 8) : []
  if (requests.length === 0) {
    return NextResponse.json({ success: false, message: 'Missing user_requests' }, { status: 400 })
  }

  const aiInput = {
    locale,
    base_recipe: baseRecipe,
    user_requests: requests,
    user_profile: {
      skill_level: userContext?.skillLevel ?? 1,
      diets: userContext?.diets ?? [],
      allergies: userContext?.healthDataConsentGranted ? userContext?.allergies ?? [] : [],
      health_data_consent_granted: userContext?.healthDataConsentGranted ?? false,
    },
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'recipe_adaptation',
      contextScreen: 'recipe_customize',
      userMessage: requests.join(' | '),
      promptFile: '05-recipe-customization-v1.md',
      schemaFile: 'recipe_customization_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.4,
      maxOutputTokens: 1600,
    })

    const parsed = result.parsed as Record<string, unknown>
    const customizedRecipe = normalizeRecipePayload(parsed.customized_recipe)

    let savedRecipeId: string | null = null
    if (customizedRecipe && body.persist !== false) {
      savedRecipeId = await saveGeneratedRecipe({
        ownerUserId: userId,
        locale,
        recipe: customizedRecipe,
        sourceRecipeId: body.recipe_id ?? null,
        type: 'community',
        visibility: userId ? 'private' : 'public',
      })
    }

    if (result.aiInteractionId) {
      await logAiGeneratedAsset({
        aiInteractionId: result.aiInteractionId,
        assetType: 'recipe',
        targetTable: savedRecipeId ? 'recipes' : null,
        targetId: savedRecipeId,
        content: result.parsed,
      })
    }

    return NextResponse.json({ success: true, data: result.parsed, saved_recipe_id: savedRecipeId })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'AI customization failed',
      },
      { status: 500 }
    )
  }
}
