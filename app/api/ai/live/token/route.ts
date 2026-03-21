import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { loadPromptAsset } from '@/app/lib/ai/assets'
import { getAiUserContext } from '@/app/lib/ai/context'
import {
  buildLiveConnectConfig,
  buildLiveSystemInstruction,
  GEMINI_LIVE_MODEL,
  createLiveEphemeralToken,
  getLiveFunctionDeclarations,
} from '@/app/lib/ai/live'
import { buildLiveRuntimeContext, getCookingSessionContext } from '@/app/lib/ai/liveContext'
import { logAiInteraction } from '@/app/lib/ai/logging'

type LiveTokenBody = {
  locale?: 'cs' | 'en'
  screen_context?: string
  cooking_session_id?: string
  cooking_context?: unknown
  uses?: number
  expire_time?: string
  new_session_expire_time?: string
}

function redactToken(token: string): string {
  if (token.length <= 18) return '***'
  return `${token.slice(0, 12)}...${token.slice(-6)}`
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as LiveTokenBody
  const locale = body.locale === 'en' ? 'en' : 'cs'

  try {
    const [basePrompt, userContext, cookingSessionContext] = await Promise.all([
      loadPromptAsset('12-live-chef-native-audio-v1.md'),
      getAiUserContext(session.userId),
      body.cooking_session_id ? getCookingSessionContext(body.cooking_session_id, locale) : Promise.resolve(null),
    ])

    const runtimeContext = buildLiveRuntimeContext({
      locale,
      screenContext: body.screen_context ?? null,
      userContext,
      cookingContext: cookingSessionContext,
      clientCookingContext: body.cooking_context,
    })

    const systemInstruction = buildLiveSystemInstruction(basePrompt, runtimeContext)
    const setupConfig = buildLiveConnectConfig(systemInstruction, getLiveFunctionDeclarations())

    const tokenResult = await createLiveEphemeralToken({
      setupConfig,
      uses: body.uses,
      expireTime: body.expire_time,
      newSessionExpireTime: body.new_session_expire_time,
    })

    const rawResponsePayload =
      tokenResult.responsePayload && typeof tokenResult.responsePayload === 'object'
        ? (tokenResult.responsePayload as Record<string, unknown>)
        : {}

    await logAiInteraction({
      userId: session.userId,
      contextScreen: body.screen_context ?? 'live',
      interactionKind: 'voice',
      modelName: GEMINI_LIVE_MODEL,
      systemPrompt: '12-live-chef-native-audio-v1',
      userMessage: 'live_token_request',
      responseText: 'live_token_issued',
      requestPayload: tokenResult.requestPayload,
      responsePayload: {
        ...rawResponsePayload,
        name: redactToken(tokenResult.token),
      },
      latencyMs: Date.now() - startedAt,
      success: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        token: tokenResult.token,
        expireTime: tokenResult.expireTime,
        newSessionExpireTime: tokenResult.newSessionExpireTime,
        model: tokenResult.model,
        config: setupConfig,
        apiVersion: 'v1alpha',
      },
    })
  } catch (error) {
    await logAiInteraction({
      userId: session.userId,
      contextScreen: body.screen_context ?? 'live',
      interactionKind: 'voice',
      modelName: GEMINI_LIVE_MODEL,
      systemPrompt: '12-live-chef-native-audio-v1',
      userMessage: 'live_token_request',
      requestPayload: {
        locale,
        screen_context: body.screen_context ?? null,
        cooking_session_id: body.cooking_session_id ?? null,
        cooking_context: body.cooking_context ?? null,
      },
      responsePayload: {},
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to mint live token',
    })

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mint live token',
      },
      { status: 500 }
    )
  }
}
