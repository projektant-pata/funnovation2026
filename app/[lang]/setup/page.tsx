import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import SetupWizard from '@/app/components/SetupWizard'

type Props = { params: Promise<{ lang: string }> }

export default async function SetupPage({ params }: Props) {
  const { lang } = await params
  const session  = await getSession()
  if (!session) redirect(`/${lang}/login`)

  // Already completed onboarding → go home
  const { rows } = await pool.query(
    `SELECT onboarding_completed_at FROM public.user_preferences WHERE user_id = $1`,
    [session.userId]
  )
  if (rows[0]?.onboarding_completed_at != null) redirect(`/${lang}`)

  // Fetch reference data
  const [dietsRes, allergensRes] = await Promise.all([
    pool.query(`SELECT id, code, name_cs FROM public.diet_types ORDER BY name_cs`),
    pool.query(`SELECT id, code, name_cs FROM public.allergens ORDER BY name_cs`),
  ])

  return (
    <SetupWizard
      lang={lang}
      diets={dietsRes.rows}
      allergens={allergensRes.rows}
    />
  )
}
