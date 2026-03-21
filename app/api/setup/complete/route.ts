import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import { evaluateOnboarding } from '@/app/lib/ai/onboarding'
import { logAiInteraction } from '@/app/lib/ai/logging'

type SetupPayload = {
  lang?: 'cs' | 'en'
  gender?: string | null
  age_range?: string | null
  cooking_frequency?: 'never' | 'few_per_month' | 'few_per_week' | 'daily' | null
  diet_codes?: string[]
  allergen_codes?: string[]
  health_data_consent?: boolean
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false }, { status: 401 })

  const {
    lang,
    gender,
    age_range,
    cooking_frequency,
    diet_codes,
    allergen_codes,
    health_data_consent,
  } = (await request.json()) as SetupPayload
  const userId = session.userId

  const locale = lang === 'en' ? 'en' : 'cs'
  const evaluationStartedAt = Date.now()
  const evaluation = await evaluateOnboarding({
    locale,
    cookingFrequency: cooking_frequency ?? null,
    dietCodes: Array.isArray(diet_codes) ? diet_codes : [],
    allergenCodes: Array.isArray(allergen_codes) ? allergen_codes : [],
    healthDataConsentGranted: health_data_consent === true,
  })

  const assessmentPayload = {
    input: {
      gender: gender ?? null,
      age_range: age_range ?? null,
      cooking_frequency: cooking_frequency ?? null,
      diet_codes: Array.isArray(diet_codes) ? diet_codes : [],
      allergen_codes: Array.isArray(allergen_codes) ? allergen_codes : [],
      health_data_consent: health_data_consent === true,
    },
    output: {
      skill_level: evaluation.skillLevel,
      confidence: evaluation.confidence,
      campaign_start_node_key: evaluation.campaignStartNodeKey,
      rationale: evaluation.rationale,
      used_ai: evaluation.usedAi,
    },
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Upsert user_preferences
    await client.query(`
      INSERT INTO public.user_preferences (user_id, gender, age_range, cooking_frequency, onboarding_completed_at)
      VALUES ($1, $2, $3, $4, now())
      ON CONFLICT (user_id) DO UPDATE SET
        gender                  = EXCLUDED.gender,
        age_range               = EXCLUDED.age_range,
        cooking_frequency       = EXCLUDED.cooking_frequency,
        onboarding_completed_at = now()
    `, [userId, gender ?? null, age_range ?? null, cooking_frequency ?? null])

    await client.query(
      `
      UPDATE public.profiles
      SET current_level = $2
      WHERE user_id = $1
      `,
      [userId, evaluation.skillLevel]
    )

    await client.query(
      `
      INSERT INTO public.user_skill_assessments (user_id, source, skill_level, model_name, rationale, raw_payload)
      VALUES ($1, 'onboarding', $2, $3, $4, $5::jsonb)
      `,
      [
        userId,
        evaluation.skillLevel,
        evaluation.modelName,
        evaluation.rationale,
        JSON.stringify(assessmentPayload),
      ]
    )

    // Diets — clear + re-insert
    await client.query(`DELETE FROM public.user_diets WHERE user_id = $1`, [userId])
    if (Array.isArray(diet_codes) && diet_codes.length > 0) {
      await client.query(`
        INSERT INTO public.user_diets (user_id, diet_type_id)
        SELECT $1, id FROM public.diet_types WHERE code = ANY($2)
        ON CONFLICT DO NOTHING
      `, [userId, diet_codes])
    }

    // Allergies — require explicit health_data consent
    await client.query(`DELETE FROM public.user_allergies WHERE user_id = $1`, [userId])

    const consentInsert = await client.query<{ id: string }>(`
      INSERT INTO public.consents (user_id, consent_type, granted, policy_version, source, metadata)
      VALUES ($1, 'health_data', $2, '1.0', 'onboarding', $3::jsonb)
      RETURNING id
    `, [
      userId,
      health_data_consent === true,
      JSON.stringify({
        gender: gender ?? null,
        age_range: age_range ?? null,
      }),
    ])

    const healthConsentId = consentInsert.rows[0]?.id ?? null

    if (health_data_consent === true && Array.isArray(allergen_codes) && allergen_codes.length > 0 && healthConsentId) {
      await client.query(`
        INSERT INTO public.user_allergies (user_id, allergen_id, consent_id)
        SELECT $1, a.id, $3
        FROM public.allergens a
        WHERE a.code = ANY($2)
        ON CONFLICT DO NOTHING
      `, [userId, allergen_codes, healthConsentId])
    }

    await client.query('COMMIT')

    await logAiInteraction({
      userId,
      contextScreen: 'setup',
      interactionKind: 'onboarding_eval',
      modelName: evaluation.modelName,
      systemPrompt: evaluation.systemPrompt,
      userMessage: JSON.stringify(assessmentPayload.input),
      responseText: evaluation.responseText,
      requestPayload: evaluation.requestPayload,
      responsePayload: evaluation.responsePayload,
      promptTokens: evaluation.promptTokens,
      completionTokens: evaluation.completionTokens,
      totalTokens: evaluation.totalTokens,
      latencyMs: Date.now() - evaluationStartedAt,
      success: evaluation.usedAi,
      errorMessage: evaluation.usedAi ? null : 'Fallback onboarding heuristic used',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Setup complete error:', err)
    return NextResponse.json({ success: false, message: String(err) }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ completed: false })

  const { rows } = await pool.query(`
    SELECT onboarding_completed_at FROM public.user_preferences WHERE user_id = $1
  `, [session.userId])

  return NextResponse.json({ completed: rows[0]?.onboarding_completed_at != null })
}
