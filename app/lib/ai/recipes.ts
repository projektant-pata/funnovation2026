import pool from '@/app/lib/db'

export type AiRecipeIngredient = {
  name: string
  amount: number
  unit: string
  prep_note: string
  is_optional: boolean
}

export type AiRecipeStep = {
  step_number: number
  instruction: string
  tip: string
  default_timer_seconds: number
}

export type AiRecipePayload = {
  title: string
  description: string
  difficulty: number
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  ingredients: AiRecipeIngredient[]
  steps: AiRecipeStep[]
}

export async function getRecipeForAi(recipeId: string, locale: 'cs' | 'en'): Promise<AiRecipePayload | null> {
  const recipeResult = await pool.query<{
    difficulty: number
    prep_time_minutes: number
    cook_time_minutes: number
    servings: number
    title: string
    description: string
  }>(
    `
    SELECT
      r.difficulty,
      r.prep_time_minutes,
      r.cook_time_minutes,
      r.servings,
      rt.title,
      rt.description
    FROM public.recipes r
    JOIN public.recipe_translations rt
      ON rt.recipe_id = r.id AND rt.locale = $2
    WHERE r.id = $1 AND r.deleted_at IS NULL
    `,
    [recipeId, locale]
  )

  const recipeRow = recipeResult.rows[0]
  if (!recipeRow) return null

  const ingredientsResult = await pool.query<{
    name: string
    amount: string | number | null
    unit: string | null
    prep_note: string | null
    is_optional: boolean
    sort_order: number
  }>(
    `
    SELECT
      COALESCE(ri.custom_name, i.canonical_name) AS name,
      ri.amount,
      ri.unit,
      ri.prep_note,
      ri.is_optional,
      ri.sort_order
    FROM public.recipe_ingredients ri
    LEFT JOIN public.ingredients i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id = $1
    ORDER BY ri.sort_order
    `,
    [recipeId]
  )

  const stepsResult = await pool.query<{
    step_number: number
    instruction: string
    tip: string | null
    default_timer_seconds: number | null
  }>(
    `
    SELECT
      rs.step_number,
      rst.instruction,
      rst.tip,
      rs.default_timer_seconds
    FROM public.recipe_steps rs
    JOIN public.recipe_step_translations rst
      ON rst.step_id = rs.id AND rst.locale = $2
    WHERE rs.recipe_id = $1
    ORDER BY rs.step_number
    `,
    [recipeId, locale]
  )

  return {
    title: recipeRow.title,
    description: recipeRow.description,
    difficulty: Number(recipeRow.difficulty),
    prep_time_minutes: Number(recipeRow.prep_time_minutes),
    cook_time_minutes: Number(recipeRow.cook_time_minutes),
    servings: Number(recipeRow.servings),
    ingredients: ingredientsResult.rows.map((item) => ({
      name: item.name,
      amount: item.amount == null ? 0 : Number(item.amount),
      unit: item.unit ?? '',
      prep_note: item.prep_note ?? '',
      is_optional: item.is_optional,
    })),
    steps: stepsResult.rows.map((step) => ({
      step_number: Number(step.step_number),
      instruction: step.instruction,
      tip: step.tip ?? '',
      default_timer_seconds: step.default_timer_seconds ?? 0,
    })),
  }
}

type SaveGeneratedRecipeInput = {
  ownerUserId: string | null
  locale: 'cs' | 'en'
  recipe: AiRecipePayload
  sourceRecipeId?: string | null
  type?: 'community' | 'verified' | 'curated'
  visibility?: 'private' | 'public' | 'group'
}

export async function saveGeneratedRecipe(input: SaveGeneratedRecipeInput): Promise<string> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const recipeInsert = await client.query<{ id: string }>(
      `
      INSERT INTO public.recipes (
        owner_user_id,
        type,
        visibility,
        difficulty,
        prep_time_minutes,
        cook_time_minutes,
        servings,
        is_published,
        ai_generated,
        source_recipe_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, $8)
      RETURNING id
      `,
      [
        input.ownerUserId,
        input.type ?? 'community',
        input.visibility ?? (input.ownerUserId ? 'private' : 'public'),
        Math.max(1, Math.min(5, Math.round(input.recipe.difficulty))),
        Math.max(0, Math.round(input.recipe.prep_time_minutes)),
        Math.max(0, Math.round(input.recipe.cook_time_minutes)),
        Math.max(1, Math.round(input.recipe.servings)),
        input.sourceRecipeId ?? null,
      ]
    )

    const recipeId = recipeInsert.rows[0].id

    await client.query(
      `
      INSERT INTO public.recipe_translations (recipe_id, locale, title, description)
      VALUES ($1, $2, $3, $4)
      `,
      [recipeId, input.locale, input.recipe.title, input.recipe.description]
    )

    for (let i = 0; i < input.recipe.ingredients.length; i += 1) {
      const ingredient = input.recipe.ingredients[i]
      await client.query(
        `
        INSERT INTO public.recipe_ingredients (
          recipe_id,
          custom_name,
          amount,
          unit,
          prep_note,
          is_optional,
          sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          recipeId,
          ingredient.name,
          Number.isFinite(ingredient.amount) ? ingredient.amount : 0,
          ingredient.unit || null,
          ingredient.prep_note || null,
          ingredient.is_optional,
          i + 1,
        ]
      )
    }

    for (const step of input.recipe.steps) {
      const stepInsert = await client.query<{ id: string }>(
        `
        INSERT INTO public.recipe_steps (recipe_id, step_number, default_timer_seconds)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [
          recipeId,
          Math.max(1, Math.round(step.step_number)),
          step.default_timer_seconds > 0 ? Math.round(step.default_timer_seconds) : null,
        ]
      )

      await client.query(
        `
        INSERT INTO public.recipe_step_translations (step_id, locale, instruction, tip)
        VALUES ($1, $2, $3, $4)
        `,
        [stepInsert.rows[0].id, input.locale, step.instruction, step.tip || null]
      )
    }

    await client.query('COMMIT')
    return recipeId
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

type TranslationStep = {
  step_number: number
  instruction: string
  tip: string
}

export async function upsertRecipeTranslation(
  recipeId: string,
  targetLocale: 'cs' | 'en',
  title: string,
  description: string,
  steps: TranslationStep[]
): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      `
      INSERT INTO public.recipe_translations (recipe_id, locale, title, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (recipe_id, locale) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description
      `,
      [recipeId, targetLocale, title, description]
    )

    for (const step of steps) {
      const stepResult = await client.query<{ id: string }>(
        `
        SELECT id
        FROM public.recipe_steps
        WHERE recipe_id = $1 AND step_number = $2
        `,
        [recipeId, Math.max(1, Math.round(step.step_number))]
      )

      const stepId = stepResult.rows[0]?.id
      if (!stepId) continue

      await client.query(
        `
        INSERT INTO public.recipe_step_translations (step_id, locale, instruction, tip)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (step_id, locale) DO UPDATE SET
          instruction = EXCLUDED.instruction,
          tip = EXCLUDED.tip
        `,
        [stepId, targetLocale, step.instruction, step.tip || null]
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
