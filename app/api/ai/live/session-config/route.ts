import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { loadPromptAsset } from '@/app/lib/ai/assets'
import { getAiUserContext } from '@/app/lib/ai/context'
import {
  GEMINI_LIVE_MODEL,
  buildLiveConnectConfig,
  buildLiveSystemInstruction,
  getLiveFunctionDeclarations,
  normalizeLiveModelName,
} from '@/app/lib/ai/live'
import { buildLiveRuntimeContext, getCookingSessionContext } from '@/app/lib/ai/liveContext'

type SessionConfigBody = {
  locale?: 'cs' | 'en'
  screen_context?: string
  cooking_session_id?: string
  cooking_context?: unknown
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as SessionConfigBody
  const locale = body.locale === 'en' ? 'en' : 'cs'

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
  const config = buildLiveConnectConfig(systemInstruction, getLiveFunctionDeclarations())

  return NextResponse.json({
    success: true,
    data: {
      mode: 'gemini-live-native-audio',
      model: normalizeLiveModelName(GEMINI_LIVE_MODEL),
      api_version: 'v1alpha',
      config,
      audio_formats: {
        input: 'audio/pcm;rate=16000',
        output: 'audio/pcm;rate=24000',
      },
      notes: [
        'Use sendRealtimeInput for all new user inputs (audio, video, text).',
        'Use sendClientContent only for appending conversation history.',
      ],
    },
  })
}
