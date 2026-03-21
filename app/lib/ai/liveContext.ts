import pool from '@/app/lib/db'
import type { AiUserContext } from '@/app/lib/ai/context'
import {
  mergeCookingContexts,
  sanitizeCookingContext,
  type CookingAssistantContext,
} from '@/app/lib/ai/cookingContext'

export type CookingSessionContext = CookingAssistantContext

export async function getCookingSessionContext(
  cookingSessionId: string,
  locale: 'cs' | 'en'
): Promise<CookingSessionContext | null> {
  const sessionResult = await pool.query<{
    id: string
    status: string
    source_context: string
    recipe_id: string | null
    recipe_title: string | null
  }>(
    `
    SELECT
      cs.id,
      cs.status,
      cs.source_context,
      cs.recipe_id,
      rt.title AS recipe_title
    FROM public.cooking_sessions cs
    LEFT JOIN public.recipe_translations rt
      ON rt.recipe_id = cs.recipe_id AND rt.locale = $2
    WHERE cs.id = $1
    LIMIT 1
    `,
    [cookingSessionId, locale]
  )

  const session = sessionResult.rows[0]
  if (!session) return null

  let currentStepNumber: number | null = null
  let currentStepInstruction: string | null = null

  if (session.recipe_id) {
    const stepResult = await pool.query<{
      step_number: number
      instruction: string
    }>(
      `
      SELECT
        rs.step_number,
        rst.instruction
      FROM public.recipe_steps rs
      JOIN public.recipe_step_translations rst
        ON rst.step_id = rs.id AND rst.locale = $2
      LEFT JOIN public.cooking_session_step_progress csp
        ON csp.step_id = rs.id AND csp.session_id = $1
      WHERE rs.recipe_id = $3
        AND COALESCE(csp.is_completed, false) = false
      ORDER BY rs.step_number ASC
      LIMIT 1
      `,
      [cookingSessionId, locale, session.recipe_id]
    )

    const step = stepResult.rows[0]
    if (step) {
      currentStepNumber = step.step_number
      currentStepInstruction = step.instruction
    }
  }

  return {
    cooking_session_id: session.id,
    session_status: session.status,
    source_context: session.source_context,
    recipe:
      session.recipe_id || session.recipe_title
        ? {
            id: session.recipe_id,
            title: session.recipe_title,
            ingredients: [],
          }
        : null,
    current_step:
      currentStepNumber || currentStepInstruction
        ? {
            step_number: currentStepNumber,
            title: null,
            instruction: currentStepInstruction,
            suggested_seconds: null,
          }
        : null,
    timer_state: null,
  }
}

type BuildLiveRuntimeContextInput = {
  locale: 'cs' | 'en'
  screenContext?: string | null
  userContext: AiUserContext | null
  cookingContext?: CookingSessionContext | null
  clientCookingContext?: unknown
}

export function buildLiveRuntimeContext({
  locale,
  screenContext,
  userContext,
  cookingContext,
  clientCookingContext,
}: BuildLiveRuntimeContextInput) {
  const mergedCookingContext = mergeCookingContexts(
    cookingContext ?? null,
    sanitizeCookingContext(clientCookingContext)
  )

  return {
    locale,
    screen_context: screenContext ?? null,
    user_profile: {
      skill_level: userContext?.skillLevel ?? 1,
      is_ai_personalization_enabled: userContext?.isAiPersonalizationEnabled ?? true,
      health_data_consent_granted: userContext?.healthDataConsentGranted ?? false,
      diets: userContext?.diets ?? [],
      allergies: userContext?.healthDataConsentGranted ? userContext?.allergies ?? [] : [],
    },
    cooking_context: mergedCookingContext,
  }
}
