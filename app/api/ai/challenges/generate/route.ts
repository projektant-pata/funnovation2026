import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { getAiUserContext } from '@/app/lib/ai/context'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type GenerateChallengeBody = {
  locale?: 'cs' | 'en'
  challenge_type?: 'personal' | 'community'
  difficulty?: 'easy' | 'medium' | 'hard'
  optional_theme?: string
  persist?: boolean
}

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as GenerateChallengeBody

  const locale = body.locale === 'en' ? 'en' : 'cs'
  const challengeType = body.challenge_type === 'community' ? 'community' : 'personal'
  const difficulty = body.difficulty ?? 'easy'
  const userContext = userId ? await getAiUserContext(userId) : null

  const aiInput = {
    locale,
    challenge_type: challengeType,
    difficulty,
    user_profile:
      challengeType === 'personal'
        ? {
            skill_level: userContext?.skillLevel ?? 1,
            diets: userContext?.diets ?? [],
            allergies: userContext?.healthDataConsentGranted ? userContext?.allergies ?? [] : [],
          }
        : null,
    optional_theme: body.optional_theme ?? null,
  }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'challenge_generation',
      contextScreen: 'challenges',
      userMessage: JSON.stringify({ challenge_type: challengeType, difficulty }),
      promptFile: '08-challenge-generator-v1.md',
      schemaFile: 'challenge_generation_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: aiInput,
      temperature: 0.6,
      maxOutputTokens: 900,
    })

    const parsed = result.parsed as Record<string, unknown>
    let challengeId: string | null = null

    if (body.persist !== false) {
      const challengeInsert = await pool.query<{ id: string }>(
        `
        INSERT INTO public.challenges (
          challenge_type,
          difficulty,
          status,
          title_cs,
          title_en,
          description_cs,
          description_en,
          generated_by_ai,
          ai_model,
          created_by_user_id
        )
        VALUES ($1, $2, 'draft', $3, $4, $5, $6, true, $7, $8)
        RETURNING id
        `,
        [
          challengeType,
          typeof parsed.difficulty === 'string' ? parsed.difficulty : difficulty,
          typeof parsed.title_cs === 'string' ? parsed.title_cs : 'AI challenge',
          typeof parsed.title_en === 'string' ? parsed.title_en : 'AI challenge',
          typeof parsed.description_cs === 'string' ? parsed.description_cs : null,
          typeof parsed.description_en === 'string' ? parsed.description_en : null,
          result.modelName,
          userId,
        ]
      )
      challengeId = challengeInsert.rows[0].id

      if (challengeType === 'personal' && userId) {
        const xpReward =
          typeof parsed.recommended_xp === 'number' && Number.isFinite(parsed.recommended_xp)
            ? Math.max(0, Math.round(parsed.recommended_xp))
            : 0
        await pool.query(
          `
          INSERT INTO public.personal_challenges (challenge_id, user_id, xp_reward, crown_reward)
          VALUES ($1, $2, $3, 1)
          ON CONFLICT (user_id, challenge_id) DO NOTHING
          `,
          [challengeId, userId, xpReward]
        )
      }
    }

    if (result.aiInteractionId) {
      await logAiGeneratedAsset({
        aiInteractionId: result.aiInteractionId,
        assetType: 'challenge',
        targetTable: challengeId ? 'challenges' : null,
        targetId: challengeId,
        content: result.parsed,
      })
    }

    return NextResponse.json({ success: true, data: result.parsed, challenge_id: challengeId })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Challenge generation failed',
      },
      { status: 500 }
    )
  }
}
