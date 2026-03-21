import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { getAiUserContext } from '@/app/lib/ai/context'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

type GenerateMealPlanBody = {
  locale?: 'cs' | 'en'
  days_count?: number
  starts_on?: string
  selected_slots?: MealSlot[]
  strategy_tags?: string[]
  candidate_recipes?: Array<{
    id: string
    title?: string
    description?: string
    difficulty?: number
    prep_time_minutes?: number
    cook_time_minutes?: number
    diets?: string[]
    allergens?: string[]
    tags?: string[]
  }>
  persist?: boolean
}

const VALID_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

async function getCandidateRecipes(locale: 'cs' | 'en') {
  const { rows } = await pool.query<{
    id: string
    title: string
    description: string
    difficulty: number
    prep_time_minutes: number
    cook_time_minutes: number
    diets: string[]
    allergens: string[]
    tags: string[]
  }>(
    `
    SELECT
      r.id,
      rt.title,
      rt.description,
      r.difficulty,
      r.prep_time_minutes,
      r.cook_time_minutes,
      COALESCE(array_remove(array_agg(DISTINCT dt.code), NULL), '{}') AS diets,
      COALESCE(array_remove(array_agg(DISTINCT al.code), NULL), '{}') AS allergens,
      COALESCE(array_remove(array_agg(DISTINCT tg.code), NULL), '{}') AS tags
    FROM public.recipes r
    JOIN public.recipe_translations rt ON rt.recipe_id = r.id AND rt.locale = $1
    LEFT JOIN public.recipe_diet_compatibility rdc ON rdc.recipe_id = r.id AND rdc.compatibility = 'compatible'
    LEFT JOIN public.diet_types dt ON dt.id = rdc.diet_type_id
    LEFT JOIN public.recipe_allergens ra ON ra.recipe_id = r.id
    LEFT JOIN public.allergens al ON al.id = ra.allergen_id
    LEFT JOIN public.recipe_tag_links rtl ON rtl.recipe_id = r.id
    LEFT JOIN public.recipe_tags tg ON tg.id = rtl.tag_id
    WHERE r.deleted_at IS NULL AND r.is_published = true
    GROUP BY r.id, rt.title, rt.description, r.difficulty, r.prep_time_minutes, r.cook_time_minutes
    ORDER BY r.difficulty ASC, rt.title ASC
    LIMIT 120
    `,
    [locale]
  )
  return rows
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const userId = session.userId
  const body = (await request.json()) as GenerateMealPlanBody
  const locale = body.locale === 'en' ? 'en' : 'cs'
  const daysCount =
    typeof body.days_count === 'number' && Number.isFinite(body.days_count)
      ? Math.max(1, Math.min(14, Math.round(body.days_count)))
      : 7

  const selectedSlots = Array.isArray(body.selected_slots)
    ? body.selected_slots.filter((slot): slot is MealSlot => VALID_SLOTS.includes(slot))
    : ['breakfast', 'lunch', 'dinner']

  const userContext = (await getAiUserContext(userId)) ?? {
    preferredLanguage: locale,
    skillLevel: 1,
    isAiPersonalizationEnabled: true,
    healthDataConsentGranted: false,
    diets: [],
    allergies: [],
  }

  const candidateRecipes =
    Array.isArray(body.candidate_recipes) && body.candidate_recipes.length > 0
      ? body.candidate_recipes
      : await getCandidateRecipes(locale)

  const aiInput = {
    locale,
    days_count: daysCount,
    selected_slots: selectedSlots,
    strategy_tags: Array.isArray(body.strategy_tags) ? body.strategy_tags.slice(0, 12) : [],
    user_profile: {
      diets: userContext.diets,
      allergies: userContext.healthDataConsentGranted ? userContext.allergies : [],
      consent: userContext.healthDataConsentGranted,
      skill_level: userContext.skillLevel,
      time_budget: null,
    },
    candidate_recipes: candidateRecipes,
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'meal_plan_generation',
      contextScreen: 'meal_plan',
      userMessage: JSON.stringify({ days_count: daysCount, selected_slots: selectedSlots }),
      promptFile: '06-meal-plan-generator-v1.md',
      schemaFile: 'meal_plan_generation_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.4,
      maxOutputTokens: 2200,
    })

    const parsed = result.parsed as Record<string, unknown>
    const days = Array.isArray(parsed.days) ? parsed.days : []

    let mealPlanId: string | null = null
    if (body.persist !== false) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        const planInsert = await client.query<{ id: string }>(
          `
          INSERT INTO public.meal_plans (
            user_id,
            title,
            days_count,
            starts_on,
            preferences,
            generated_by_ai,
            ai_model
          )
          VALUES ($1, $2, $3, $4, $5::jsonb, true, $6)
          RETURNING id
          `,
          [
            userId,
            typeof parsed.title === 'string' && parsed.title.length > 0 ? parsed.title : 'AI Meal plan',
            daysCount,
            body.starts_on ?? null,
            JSON.stringify({ strategy_tags: aiInput.strategy_tags, selected_slots: selectedSlots }),
            result.modelName,
          ]
        )

        mealPlanId = planInsert.rows[0].id

        for (const day of days) {
          if (!day || typeof day !== 'object') continue
          const dayObj = day as Record<string, unknown>
          const dayOffset =
            typeof dayObj.day_offset === 'number' && Number.isFinite(dayObj.day_offset)
              ? Math.max(0, Math.round(dayObj.day_offset))
              : 0
          const meals = Array.isArray(dayObj.meals) ? dayObj.meals : []

          for (const meal of meals) {
            if (!meal || typeof meal !== 'object') continue
            const mealObj = meal as Record<string, unknown>
            const slot = mealObj.meal_slot
            if (!VALID_SLOTS.includes(String(slot) as MealSlot)) continue

            const recipeId = typeof mealObj.recipe_id === 'string' && mealObj.recipe_id.length > 0 ? mealObj.recipe_id : null
            const generatedRecipePayload =
              recipeId === null
                ? {
                    title: typeof mealObj.generated_title === 'string' ? mealObj.generated_title : '',
                    description:
                      typeof mealObj.generated_description === 'string' ? mealObj.generated_description : '',
                    reason: typeof mealObj.reason === 'string' ? mealObj.reason : '',
                  }
                : null

            await client.query(
              `
              INSERT INTO public.meal_plan_items (
                meal_plan_id,
                day_offset,
                meal_slot,
                recipe_id,
                generated_recipe_payload,
                note
              )
              VALUES ($1, $2, $3, $4, $5::jsonb, $6)
              ON CONFLICT (meal_plan_id, day_offset, meal_slot) DO UPDATE SET
                recipe_id = EXCLUDED.recipe_id,
                generated_recipe_payload = EXCLUDED.generated_recipe_payload,
                note = EXCLUDED.note
              `,
              [
                mealPlanId,
                dayOffset,
                slot,
                recipeId,
                generatedRecipePayload ? JSON.stringify(generatedRecipePayload) : null,
                typeof mealObj.reason === 'string' ? mealObj.reason : null,
              ]
            )
          }
        }

        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }

    if (result.aiInteractionId) {
      await logAiGeneratedAsset({
        aiInteractionId: result.aiInteractionId,
        assetType: 'meal_plan',
        targetTable: mealPlanId ? 'meal_plans' : null,
        targetId: mealPlanId,
        content: result.parsed,
      })
    }

    return NextResponse.json({ success: true, data: result.parsed, meal_plan_id: mealPlanId })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Meal plan generation failed' },
      { status: 500 }
    )
  }
}
