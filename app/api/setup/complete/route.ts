import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false }, { status: 401 })

  const { gender, age_range, cooking_frequency, diet_codes, allergen_codes } = await request.json()
  const userId = session.userId

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
    `, [userId, gender || null, age_range || null, cooking_frequency || null])

    // Diets — clear + re-insert
    await client.query(`DELETE FROM public.user_diets WHERE user_id = $1`, [userId])
    if (Array.isArray(diet_codes) && diet_codes.length > 0) {
      await client.query(`
        INSERT INTO public.user_diets (user_id, diet_type_id)
        SELECT $1, id FROM public.diet_types WHERE code = ANY($2)
        ON CONFLICT DO NOTHING
      `, [userId, diet_codes])
    }

    // Allergies — need health_data consent first
    if (Array.isArray(allergen_codes) && allergen_codes.length > 0) {
      await client.query(`
        INSERT INTO public.consents (user_id, consent_type, granted, policy_version, source)
        VALUES ($1, 'health_data', true, '1.0', 'onboarding')
        ON CONFLICT DO NOTHING
      `, [userId])

      await client.query(`DELETE FROM public.user_allergies WHERE user_id = $1`, [userId])
      await client.query(`
        INSERT INTO public.user_allergies (user_id, allergen_id, consent_id)
        SELECT $1, a.id,
          (SELECT id FROM public.consents WHERE user_id = $1 AND consent_type = 'health_data' AND granted = true LIMIT 1)
        FROM public.allergens a
        WHERE a.code = ANY($2)
        ON CONFLICT DO NOTHING
      `, [userId, allergen_codes])
    }

    await client.query('COMMIT')
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
