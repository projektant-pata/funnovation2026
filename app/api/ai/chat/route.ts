import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { generateStructuredJson } from '@/app/lib/ai/gemini'
import { logAiInteraction } from '@/app/lib/ai/logging'
import { loadPromptAsset, loadSchemaAsset } from '@/app/lib/ai/assets'
import { sanitizeCookingContext } from '@/app/lib/ai/cookingContext'

type ChatHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

type ChatRequestBody = {
  locale?: 'cs' | 'en'
  message?: string
  history?: ChatHistoryItem[]
  screen?: string
  context?: unknown
}

type UserContextRow = {
  preferred_language: 'cs' | 'en'
  current_level: number
  is_ai_personalization_enabled: boolean
  health_data_consent_granted: boolean
  diets: string[]
  allergies: string[]
}

type ChatResponseShape = {
  schema_version: 'v1'
  reply: string
  tone: 'coach' | 'neutral' | 'celebratory' | 'warning'
  actions: Array<{
    action_type:
      | 'none'
      | 'timer_start'
      | 'timer_set'
      | 'timer_pause'
      | 'timer_resume'
      | 'timer_cancel'
      | 'step_next'
      | 'step_previous'
      | 'step_go_to'
    timer_seconds: number
    target_step_number: number
    reason: string
  }>
  safety: {
    should_refuse: boolean
    risk_flags: Array<'none' | 'allergy' | 'burn' | 'knife' | 'cross_contamination' | 'food_spoilage' | 'other'>
    refusal_reason: string
  }
  requires_clarification: boolean
  clarification_question: string
}

function isChatHistoryItem(value: unknown): value is ChatHistoryItem {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { role?: unknown; content?: unknown }
  return (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.content === 'string'
}

function normalizeChatResponse(value: unknown, locale: 'cs' | 'en'): ChatResponseShape {
  const fallbackReply =
    locale === 'cs'
      ? 'Promin, ted nejsem schopny odpovedet. Zkus to prosim znovu za chvili.'
      : 'Sorry, I cannot answer right now. Please try again in a moment.'

  const obj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  const actionsRaw = Array.isArray(obj.actions) ? obj.actions : []
  const actions = actionsRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const raw = item as Record<string, unknown>
      const actionType = typeof raw.action_type === 'string' ? raw.action_type : 'none'
      const allowedActions = [
        'none',
        'timer_start',
        'timer_set',
        'timer_pause',
        'timer_resume',
        'timer_cancel',
        'step_next',
        'step_previous',
        'step_go_to',
      ]
      if (!allowedActions.includes(actionType)) return null

      return {
        action_type: actionType as ChatResponseShape['actions'][number]['action_type'],
        timer_seconds: Number.isFinite(Number(raw.timer_seconds)) ? Math.max(0, Number(raw.timer_seconds)) : 0,
        target_step_number: Number.isFinite(Number(raw.target_step_number))
          ? Math.max(0, Number(raw.target_step_number))
          : 0,
        reason: typeof raw.reason === 'string' ? raw.reason : '',
      }
    })
    .filter((item): item is ChatResponseShape['actions'][number] => item !== null)

  const safetyRaw =
    obj.safety && typeof obj.safety === 'object' ? (obj.safety as Record<string, unknown>) : ({} as Record<string, unknown>)
  const riskFlags = Array.isArray(safetyRaw.risk_flags)
    ? safetyRaw.risk_flags.filter((flag): flag is ChatResponseShape['safety']['risk_flags'][number] =>
        ['none', 'allergy', 'burn', 'knife', 'cross_contamination', 'food_spoilage', 'other'].includes(
          String(flag)
        )
      )
    : (['none'] as ChatResponseShape['safety']['risk_flags'])

  return {
    schema_version: 'v1',
    reply: typeof obj.reply === 'string' && obj.reply.length > 0 ? obj.reply : fallbackReply,
    tone:
      obj.tone === 'coach' || obj.tone === 'neutral' || obj.tone === 'celebratory' || obj.tone === 'warning'
        ? obj.tone
        : 'coach',
    actions,
    safety: {
      should_refuse: safetyRaw.should_refuse === true,
      risk_flags: riskFlags.length > 0 ? riskFlags : ['none'],
      refusal_reason: typeof safetyRaw.refusal_reason === 'string' ? safetyRaw.refusal_reason : '',
    },
    requires_clarification: obj.requires_clarification === true,
    clarification_question: typeof obj.clarification_question === 'string' ? obj.clarification_question : '',
  }
}

async function getUserContext(userId: string): Promise<UserContextRow | null> {
  const { rows } = await pool.query<UserContextRow>(
    `
    SELECT
      p.preferred_language,
      p.current_level,
      p.is_ai_personalization_enabled,
      EXISTS (
        SELECT 1
        FROM public.consents c
        WHERE c.user_id = p.user_id
          AND c.consent_type = 'health_data'
          AND c.granted = true
          AND c.withdrawn_at IS NULL
      ) AS health_data_consent_granted,
      COALESCE(array_remove(array_agg(DISTINCT dt.code), NULL), '{}') AS diets,
      COALESCE(array_remove(array_agg(DISTINCT al.code), NULL), '{}') AS allergies
    FROM public.profiles p
    LEFT JOIN public.user_diets ud ON ud.user_id = p.user_id
    LEFT JOIN public.diet_types dt ON dt.id = ud.diet_type_id
    LEFT JOIN public.user_allergies ua ON ua.user_id = p.user_id
    LEFT JOIN public.allergens al ON al.id = ua.allergen_id
    WHERE p.user_id = $1
    GROUP BY p.user_id
    `,
    [userId]
  )

  return rows[0] ?? null
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  const session = await getSession()
  const userId = session?.userId ?? null

  const body = (await request.json()) as ChatRequestBody
  const locale = body.locale === 'en' ? 'en' : 'cs'
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const screen = typeof body.screen === 'string' ? body.screen : null

  if (!message) {
    return NextResponse.json({ success: false, message: 'Missing message' }, { status: 400 })
  }

  const history = Array.isArray(body.history) ? body.history.filter(isChatHistoryItem).slice(-8) : []
  const userContext = userId ? await getUserContext(userId) : null
  const cookingContext = sanitizeCookingContext(body.context)

  const aiInput = {
    locale,
    user_profile: {
      skill_level: userContext?.current_level ?? 1,
      diets: userContext?.diets ?? [],
      allergies: userContext?.health_data_consent_granted ? userContext?.allergies ?? [] : [],
      ai_personalization_enabled: userContext?.is_ai_personalization_enabled ?? true,
      health_data_consent_granted: userContext?.health_data_consent_granted ?? false,
    },
    context: {
      screen,
      cooking_session_id: cookingContext?.cooking_session_id ?? null,
      source_context: cookingContext?.source_context ?? null,
      recipe: cookingContext?.recipe ?? null,
      current_step: cookingContext?.current_step ?? null,
      timer_state: cookingContext?.timer_state ?? null,
      session_status: cookingContext?.session_status ?? null,
    },
    history,
    user_message: message,
  }

  try {
    const systemPrompt = await loadPromptAsset('01-chef-assistant-chat-v1.md')
    const responseJsonSchema = await loadSchemaAsset('chat_assistant_response_v1.json')

    const generated = await generateStructuredJson({
      model: process.env.GEMINI_CHAT_MODEL ?? process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      systemPrompt,
      input: aiInput,
      responseJsonSchema,
      temperature: 0.6,
      maxOutputTokens: 600,
    })

    const normalized = normalizeChatResponse(generated.parsed, locale)

    await logAiInteraction({
      userId,
      contextScreen: screen,
      interactionKind: 'chat',
      modelName: generated.modelName,
      systemPrompt,
      userMessage: message,
      responseText: generated.responseText,
      requestPayload: generated.requestPayload,
      responsePayload: generated.responsePayload,
      promptTokens: generated.usage.promptTokens,
      completionTokens: generated.usage.completionTokens,
      totalTokens: generated.usage.totalTokens,
      latencyMs: Date.now() - startedAt,
      success: true,
    })

    return NextResponse.json({ success: true, data: normalized })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown AI error'

    await logAiInteraction({
      userId,
      contextScreen: screen,
      interactionKind: 'chat',
      modelName: process.env.GEMINI_CHAT_MODEL ?? process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      systemPrompt: null,
      userMessage: message,
      requestPayload: aiInput,
      responsePayload: {},
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage,
    })

    const fallbackReply =
      locale === 'cs'
        ? 'Asistent je docasne nedostupny. Zkus to prosim znovu.'
        : 'Assistant is temporarily unavailable. Please try again.'

    return NextResponse.json({
      success: true,
      data: normalizeChatResponse({ reply: fallbackReply }, locale),
      degraded: true,
    })
  }
}
