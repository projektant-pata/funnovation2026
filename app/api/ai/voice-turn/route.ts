import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { getAiUserContext } from '@/app/lib/ai/context'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type VoiceTurnBody = {
  locale?: 'cs' | 'en'
  transcript?: string
  transcript_confidence?: number
  context?: {
    recipe?: unknown
    step?: unknown
    timer_state?: unknown
    ambient_noise_hint?: unknown
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as VoiceTurnBody

  const locale = body.locale === 'en' ? 'en' : 'cs'
  const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : ''
  const transcriptConfidence =
    typeof body.transcript_confidence === 'number' && Number.isFinite(body.transcript_confidence)
      ? Math.max(0, Math.min(1, body.transcript_confidence))
      : 0

  if (!transcript) {
    return NextResponse.json({ success: false, message: 'Missing transcript' }, { status: 400 })
  }

  const userContext = userId ? await getAiUserContext(userId) : null

  const aiInput = {
    locale,
    user_profile: {
      skill_level: userContext?.skillLevel ?? 1,
      diets: userContext?.diets ?? [],
      allergies: userContext?.healthDataConsentGranted ? userContext?.allergies ?? [] : [],
      ai_personalization_enabled: userContext?.isAiPersonalizationEnabled ?? true,
      health_data_consent_granted: userContext?.healthDataConsentGranted ?? false,
    },
    context: {
      recipe: body.context?.recipe ?? null,
      step: body.context?.step ?? null,
      timer_state: body.context?.timer_state ?? null,
      ambient_noise_hint: body.context?.ambient_noise_hint ?? null,
    },
    transcript,
    transcript_confidence: transcriptConfidence,
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'voice',
      contextScreen: 'voice',
      userMessage: transcript,
      promptFile: '02-chef-assistant-voice-v1.md',
      schemaFile: 'voice_assistant_response_v1.json',
      model: process.env.GEMINI_CHAT_MODEL ?? process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.4,
      maxOutputTokens: 500,
    })

    return NextResponse.json({ success: true, data: result.parsed })
  } catch (error) {
    const fallback =
      locale === 'cs'
        ? {
            schema_version: 'v1',
            spoken_reply: 'Promin, nerozumel jsem. Zopakuj to prosim.',
            display_reply: 'Promin, nerozumel jsem. Zopakuj to prosim.',
            should_repeat: true,
            repeat_prompt: 'Muzes to prosim rict jeste jednou?',
            actions: [],
          }
        : {
            schema_version: 'v1',
            spoken_reply: 'Sorry, I did not catch that. Please repeat.',
            display_reply: 'Sorry, I did not catch that. Please repeat.',
            should_repeat: true,
            repeat_prompt: 'Could you say that again?',
            actions: [],
          }

    return NextResponse.json(
      {
        success: true,
        degraded: true,
        data: fallback,
        message: error instanceof Error ? error.message : 'AI unavailable',
      },
      { status: 200 }
    )
  }
}
