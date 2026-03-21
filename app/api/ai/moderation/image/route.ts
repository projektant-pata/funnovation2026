import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type ImageSourceType = 'profile_avatar' | 'cooking_session' | 'challenge_submission' | 'reel' | 'recipe_media'

type ModerateImageBody = {
  locale?: 'cs' | 'en'
  source_type?: ImageSourceType
  source_id?: string | null
  image_url?: string
  image_base64?: string
  mime_type?: string
  context_text?: string
}

const VALID_SOURCE_TYPES: ImageSourceType[] = [
  'profile_avatar',
  'cooking_session',
  'challenge_submission',
  'reel',
  'recipe_media',
]

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.userId ?? null
  const body = (await request.json()) as ModerateImageBody

  const locale = body.locale === 'en' ? 'en' : 'cs'
  const sourceType = VALID_SOURCE_TYPES.includes(String(body.source_type) as ImageSourceType)
    ? (body.source_type as ImageSourceType)
    : 'recipe_media'

  if (!body.image_url && !body.image_base64) {
    return NextResponse.json({ success: false, message: 'Missing image_url or image_base64' }, { status: 400 })
  }

  const metadata = {
    source_type: sourceType,
    locale,
    optional_context_text: body.context_text ?? null,
    image_reference: body.image_url ?? 'inline_base64_image',
  }

  const imagePart = body.image_base64
    ? {
        inlineData: {
          mimeType: body.mime_type ?? 'image/jpeg',
          data: body.image_base64,
        },
      }
    : {
        fileData: {
          fileUri: body.image_url!,
          mimeType: body.mime_type,
        },
      }

  try {
    const result = await runStructuredTask({
      userId,
      interactionKind: 'image_moderation',
      contextScreen: 'moderation',
      userMessage: JSON.stringify({ source_type: sourceType, source_id: body.source_id ?? null }),
      promptFile: '09-image-moderation-v1.md',
      schemaFile: 'image_moderation_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: metadata,
      contents: [
        {
          role: 'user',
          parts: [{ text: JSON.stringify(metadata) }, imagePart],
        },
      ],
      temperature: 0.1,
      maxOutputTokens: 500,
    })

    const parsed = result.parsed as Record<string, unknown>
    const actionTaken =
      parsed.action_taken === 'allow' || parsed.action_taken === 'block' || parsed.action_taken === 'review'
        ? parsed.action_taken
        : 'review'

    const nsfwScore = typeof parsed.nsfw_score === 'number' ? Math.max(0, Math.min(1, parsed.nsfw_score)) : 0
    const relevanceScore =
      typeof parsed.relevance_score === 'number' ? Math.max(0, Math.min(1, parsed.relevance_score)) : 0

    const logInsert = await pool.query<{ id: string }>(
      `
      INSERT INTO public.image_moderation_logs (
        user_id,
        source_type,
        source_id,
        image_url,
        model_name,
        nsfw_score,
        relevance_score,
        action_taken,
        raw_response
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      RETURNING id
      `,
      [
        userId,
        sourceType,
        body.source_id ?? null,
        body.image_url ?? 'inline://base64',
        result.modelName,
        nsfwScore,
        relevanceScore,
        actionTaken,
        JSON.stringify(parsed),
      ]
    )

    if (result.aiInteractionId) {
      await logAiGeneratedAsset({
        aiInteractionId: result.aiInteractionId,
        assetType: 'moderation_result',
        targetTable: 'image_moderation_logs',
        targetId: logInsert.rows[0].id,
        content: parsed,
      })
    }

    return NextResponse.json({ success: true, data: parsed, moderation_log_id: logInsert.rows[0].id })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Image moderation failed' },
      { status: 500 }
    )
  }
}
