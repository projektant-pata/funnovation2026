import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { logAiGeneratedAsset } from '@/app/lib/ai/logging'
import { runStructuredTask } from '@/app/lib/ai/task-runner'

type OcrReceiptBody = {
  locale?: 'cs' | 'en'
  image_url?: string
  image_base64?: string
  mime_type?: string
  optional_store_country?: string
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const userId = session.userId
  const body = (await request.json()) as OcrReceiptBody
  const locale = body.locale === 'en' ? 'en' : 'cs'

  if (!body.image_url && !body.image_base64) {
    return NextResponse.json({ success: false, message: 'Missing image_url or image_base64' }, { status: 400 })
  }

  const sourceImageUrl = body.image_url ?? 'inline://base64'

  const jobInsert = await pool.query<{ id: string }>(
    `
    INSERT INTO public.receipt_ocr_jobs (user_id, source_image_url, status)
    VALUES ($1, $2, 'processing')
    RETURNING id
    `,
    [userId, sourceImageUrl]
  )

  const jobId = jobInsert.rows[0].id

  const metadata = {
    locale,
    optional_store_country: body.optional_store_country ?? null,
    image_reference: sourceImageUrl,
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
      interactionKind: 'ocr',
      contextScreen: 'ocr_receipt',
      userMessage: sourceImageUrl,
      promptFile: '10-receipt-ocr-extraction-v1.md',
      schemaFile: 'receipt_ocr_v1.json',
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-3-flash-preview',
      input: metadata,
      contents: [
        {
          role: 'user',
          parts: [{ text: JSON.stringify(metadata) }, imagePart],
        },
      ],
      temperature: 0.1,
      maxOutputTokens: 1600,
    })

    const parsed = result.parsed as Record<string, unknown>
    const items = Array.isArray(parsed.items) ? parsed.items : []

    await pool.query(
      `
      UPDATE public.receipt_ocr_jobs
      SET status = 'completed',
          raw_response = $2::jsonb,
          processed_at = timezone('utc', now()),
          error_message = NULL
      WHERE id = $1
      `,
      [jobId, JSON.stringify(parsed)]
    )

    for (const item of items) {
      if (!item || typeof item !== 'object') continue
      const row = item as Record<string, unknown>
      const detectedName = typeof row.detected_name === 'string' ? row.detected_name : ''
      if (!detectedName) continue

      const normalizedName = typeof row.normalized_name === 'string' ? row.normalized_name : ''
      const ingredientLookupName = normalizedName || detectedName

      const ingredientResult = await pool.query<{ id: string }>(
        `
        SELECT id
        FROM public.ingredients
        WHERE lower(canonical_name) = lower($1)
        LIMIT 1
        `,
        [ingredientLookupName]
      )

      const ingredientId = ingredientResult.rows[0]?.id ?? null

      await pool.query(
        `
        INSERT INTO public.receipt_ocr_items (
          ocr_job_id,
          detected_name,
          ingredient_id,
          quantity,
          unit,
          confidence,
          accepted
        )
        VALUES ($1, $2, $3, $4, $5, $6, true)
        `,
        [
          jobId,
          detectedName,
          ingredientId,
          typeof row.quantity === 'number' ? Math.max(0, row.quantity) : null,
          typeof row.unit === 'string' && row.unit.length > 0 ? row.unit : null,
          typeof row.confidence === 'number' ? Math.max(0, Math.min(1, row.confidence)) : null,
        ]
      )
    }

    if (result.aiInteractionId) {
      await logAiGeneratedAsset({
        aiInteractionId: result.aiInteractionId,
        assetType: 'ocr_result',
        targetTable: 'receipt_ocr_jobs',
        targetId: jobId,
        content: parsed,
      })
    }

    return NextResponse.json({ success: true, data: parsed, ocr_job_id: jobId })
  } catch (error) {
    await pool.query(
      `
      UPDATE public.receipt_ocr_jobs
      SET status = 'failed',
          error_message = $2,
          processed_at = timezone('utc', now())
      WHERE id = $1
      `,
      [jobId, error instanceof Error ? error.message : 'OCR failed']
    )

    return NextResponse.json(
      {
        success: false,
        ocr_job_id: jobId,
        message: error instanceof Error ? error.message : 'OCR failed',
      },
      { status: 500 }
    )
  }
}
