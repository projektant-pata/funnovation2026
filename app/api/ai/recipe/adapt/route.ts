import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { getAiUserContext } from '@/app/lib/ai/context'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { getRecipeForAi, saveGeneratedRecipe, type AiRecipePayload } from '@/app/lib/ai/recipes'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type AdaptBody = {
  locale?: 'cs' | 'en'
  recipe_id?: string
  base_recipe?: AiRecipePayload
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
  const body = (await request.json()) as AdaptBody

  const locale = body.locale === 'en' ? 'en' : 'cs'
  const userContext = userId ? await getAiUserContext(userId) : null

  let baseRecipe = body.base_recipe ?? null
  if (!baseRecipe && body.recipe_id) {
    baseRecipe = await getRecipeForAi(body.recipe_id, locale)
  }

  if (!baseRecipe) {
    return NextResponse.json({ success: false, message: 'Missing base recipe or recipe_id' }, { status: 400 })
  }

  const aiInput = {
    locale,
    base_recipe: baseRecipe,
    user_profile: {
      diets: userContext?.diets ?? [],
      allergies: userContext?.healthDataConsentGranted ? userContext?.allergies ?? [] : [],
      health_data_consent_granted: userContext?.healthDataConsentGranted ?? false,
      skill_level: userContext?.skillLevel ?? 1,
    },
    adaptation_goal: 'allergy_safety',
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'recipe_adaptation',
      contextScreen: 'recipe_adapt',
      userMessage: body.recipe_id ?? 'ad-hoc-recipe',
      promptFile: '04-recipe-allergy-adaptation-v1.md',
      schemaFile: 'recipe_adaptation_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.3,
      maxOutputTokens: 1400,
    })

    const parsed = result.parsed as Record<string, unknown>
    const adaptedRecipe = normalizeRecipePayload(parsed.adapted_recipe)

    let savedRecipeId: string | null = null
    if (adaptedRecipe && body.persist !== false) {
      savedRecipeId = await saveGeneratedRecipe({
        ownerUserId: userId,
        locale,
        recipe: adaptedRecipe,
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
        message: error instanceof Error ? error.message : 'AI adaptation failed',
      },
      { status: 500 }
    )
  }
}
