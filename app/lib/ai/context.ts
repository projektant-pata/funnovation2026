import pool from '@/app/lib/db'

export type AiUserContext = {
  preferredLanguage: 'cs' | 'en'
  skillLevel: number
  isAiPersonalizationEnabled: boolean
  healthDataConsentGranted: boolean
  diets: string[]
  allergies: string[]
}

type UserContextRow = {
  preferred_language: 'cs' | 'en'
  current_level: number
  is_ai_personalization_enabled: boolean
  health_data_consent_granted: boolean
  diets: string[]
  allergies: string[]
}

export async function getAiUserContext(userId: string): Promise<AiUserContext | null> {
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

  const row = rows[0]
  if (!row) return null

  return {
    preferredLanguage: row.preferred_language,
    skillLevel: row.current_level,
    isAiPersonalizationEnabled: row.is_ai_personalization_enabled,
    healthDataConsentGranted: row.health_data_consent_granted,
    diets: row.diets ?? [],
    allergies: row.allergies ?? [],
  }
}
