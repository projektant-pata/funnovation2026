import pool from '@/app/lib/db'

export type AiInteractionKind =
  | 'chat'
  | 'voice'
  | 'onboarding_eval'
  | 'recipe_adaptation'
  | 'meal_plan_generation'
  | 'fridge_recipe'
  | 'challenge_generation'
  | 'image_moderation'
  | 'ocr'
  | 'translation'

type LogAiInteractionParams = {
  userId: string | null
  cookingSessionId?: string | null
  contextScreen?: string | null
  interactionKind: AiInteractionKind
  modelName: string
  systemPrompt?: string | null
  userMessage?: string | null
  responseText?: string | null
  requestPayload?: unknown
  responsePayload?: unknown
  promptTokens?: number | null
  completionTokens?: number | null
  totalTokens?: number | null
  latencyMs?: number | null
  success: boolean
  errorMessage?: string | null
}

type AiAssetType = 'recipe' | 'meal_plan' | 'challenge' | 'translation' | 'moderation_result' | 'ocr_result'

export async function logAiInteraction(params: LogAiInteractionParams): Promise<string | null> {
  try {
    const { rows } = await pool.query<{ id: string }>(
      `
      INSERT INTO public.ai_interactions (
        user_id,
        cooking_session_id,
        context_screen,
        interaction_kind,
        model_name,
        system_prompt,
        user_message,
        response_text,
        request_payload,
        response_payload,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        latency_ms,
        success,
        error_message
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        COALESCE($9::jsonb, '{}'::jsonb),
        COALESCE($10::jsonb, '{}'::jsonb),
        $11, $12, $13, $14, $15, $16
      )
      RETURNING id
      `,
      [
        params.userId,
        params.cookingSessionId ?? null,
        params.contextScreen ?? null,
        params.interactionKind,
        params.modelName,
        params.systemPrompt ?? null,
        params.userMessage ?? null,
        params.responseText ?? null,
        params.requestPayload ? JSON.stringify(params.requestPayload) : null,
        params.responsePayload ? JSON.stringify(params.responsePayload) : null,
        params.promptTokens ?? null,
        params.completionTokens ?? null,
        params.totalTokens ?? null,
        params.latencyMs ?? null,
        params.success,
        params.errorMessage ?? null,
      ]
    )

    return rows[0]?.id ?? null
  } catch (error) {
    console.error('Failed to log AI interaction:', error)
    return null
  }
}

type LogAiGeneratedAssetParams = {
  aiInteractionId: string
  assetType: AiAssetType
  targetTable?: string | null
  targetId?: string | null
  content: unknown
}

export async function logAiGeneratedAsset(params: LogAiGeneratedAssetParams): Promise<string | null> {
  try {
    const { rows } = await pool.query<{ id: string }>(
      `
      INSERT INTO public.ai_generated_assets (
        ai_interaction_id,
        asset_type,
        target_table,
        target_id,
        content
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING id
      `,
      [
        params.aiInteractionId,
        params.assetType,
        params.targetTable ?? null,
        params.targetId ?? null,
        JSON.stringify(params.content ?? {}),
      ]
    )

    return rows[0]?.id ?? null
  } catch (error) {
    console.error('Failed to log AI generated asset:', error)
    return null
  }
}
