import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { getRecipeForAi, upsertRecipeTranslation, type AiRecipePayload } from '@/app/lib/ai/recipes'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type TranslateBody = {
  recipe_id?: string
  recipe?: AiRecipePayload
  source_locale?: 'cs' | 'en'
  target_locale?: 'cs' | 'en'
  persist?: boolean
}

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as TranslateBody

  const sourceLocale = body.source_locale === 'en' ? 'en' : 'cs'
  const targetLocale = body.target_locale === 'cs' ? 'cs' : 'en'

  if (sourceLocale === targetLocale) {
    return NextResponse.json({ success: false, message: 'source_locale and target_locale must differ' }, { status: 400 })
  }

  let sourceRecipe = body.recipe ?? null
  if (!sourceRecipe && body.recipe_id) {
    sourceRecipe = await getRecipeForAi(body.recipe_id, sourceLocale)
  }

  if (!sourceRecipe) {
    return NextResponse.json({ success: false, message: 'Missing recipe or recipe_id' }, { status: 400 })
  }

  const aiInput = {
    source_locale: sourceLocale,
    target_locale: targetLocale,
    recipe: sourceRecipe,
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'translation',
      contextScreen: 'recipe_translate',
      userMessage: JSON.stringify({ recipe_id: body.recipe_id ?? null, source_locale: sourceLocale, target_locale: targetLocale }),
      promptFile: '11-recipe-translation-v1.md',
      schemaFile: 'recipe_translation_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.2,
      maxOutputTokens: 1600,
    })

    const parsed = result.parsed as Record<string, unknown>
    if (body.persist === true && body.recipe_id) {
      const translatedSteps = Array.isArray(parsed.steps)
        ? parsed.steps
            .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
            .map((item, index) => ({
              step_number:
                typeof item.step_number === 'number' && Number.isFinite(item.step_number)
                  ? Math.max(1, Math.round(item.step_number))
                  : index + 1,
              instruction: typeof item.instruction === 'string' ? item.instruction : '',
              tip: typeof item.tip === 'string' ? item.tip : '',
            }))
        : []

      await upsertRecipeTranslation(
        body.recipe_id,
        targetLocale,
        typeof parsed.title === 'string' ? parsed.title : sourceRecipe.title,
        typeof parsed.description === 'string' ? parsed.description : sourceRecipe.description,
        translatedSteps
      )
    }

    if (result.aiInteractionId) {
      await logAiGeneratedAsset({
        aiInteractionId: result.aiInteractionId,
        assetType: 'translation',
        targetTable: body.recipe_id ? 'recipe_translations' : null,
        targetId: body.recipe_id ?? null,
        content: result.parsed,
      })
    }

    return NextResponse.json({ success: true, data: result.parsed, persisted: body.persist === true && !!body.recipe_id })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Translation failed',
      },
      { status: 500 }
    )
  }
}
