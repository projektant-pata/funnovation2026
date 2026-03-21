import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { getAiUserContext } from '@/app/lib/ai/context'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { saveGeneratedRecipe, type AiRecipePayload } from '@/app/lib/ai/recipes'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type FridgeGenerateBody = {
  locale?: 'cs' | 'en'
  pantry_items?: string[]
  optional_constraints?: {
    time_budget?: string
    skill_level?: number
  }
  persist_recipe?: boolean
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
      prep_note: '',
      is_optional: false,
    })),
    steps: (raw.steps as Array<Record<string, unknown>>).map((step, index) => ({
      step_number: Math.max(1, Number(step.step_number ?? index + 1)),
      instruction: String(step.instruction ?? ''),
      tip: String(step.tip ?? ''),
      default_timer_seconds: Math.max(0, Number(step.default_timer_seconds ?? 0)),
    })),
  }
}

async function getPantryItems(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ name: string }>(
    `
    SELECT COALESCE(pi.custom_name, i.canonical_name) AS name
    FROM public.pantry_items pi
    LEFT JOIN public.ingredients i ON i.id = pi.ingredient_id
    WHERE pi.user_id = $1 AND pi.is_consumed = false
    ORDER BY pi.created_at DESC
    LIMIT 120
    `,
    [userId]
  )
  return rows.map((row) => row.name).filter(Boolean)
}

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as FridgeGenerateBody

  const locale = body.locale === 'en' ? 'en' : 'cs'
  const userContext = userId ? await getAiUserContext(userId) : null

  const pantryItems =
    Array.isArray(body.pantry_items) && body.pantry_items.length > 0
      ? body.pantry_items.slice(0, 200)
      : userId
        ? await getPantryItems(userId)
        : []

  if (pantryItems.length === 0) {
    return NextResponse.json({ success: false, message: 'No pantry items available' }, { status: 400 })
  }

  const aiInput = {
    locale,
    pantry_items: pantryItems,
    optional_constraints: {
      time_budget: body.optional_constraints?.time_budget ?? null,
      skill_level: body.optional_constraints?.skill_level ?? userContext?.skillLevel ?? 1,
    },
    user_profile: {
      diets: userContext?.diets ?? [],
      allergies: userContext?.healthDataConsentGranted ? userContext.allergies : [],
      consent: userContext?.healthDataConsentGranted ?? false,
    },
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'fridge_recipe',
      contextScreen: 'fridge',
      userMessage: JSON.stringify({ pantry_items_count: pantryItems.length }),
      promptFile: '07-fridge-recipe-generator-v1.md',
      schemaFile: 'fridge_recipe_generation_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.5,
      maxOutputTokens: 1800,
    })

    const parsed = result.parsed as Record<string, unknown>
    const recipe = normalizeRecipePayload(parsed.recipe)

    let savedRecipeId: string | null = null
    if (recipe && body.persist_recipe === true) {
      savedRecipeId = await saveGeneratedRecipe({
        ownerUserId: userId,
        locale,
        recipe,
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
        message: error instanceof Error ? error.message : 'Fridge recipe generation failed',
      },
      { status: 500 }
    )
  }
}
