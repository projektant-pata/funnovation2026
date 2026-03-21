import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') ?? 'cs'

  const { rows: recipeRows } = await pool.query(
    `SELECT
       r.id, rt.title, rt.description,
       r.difficulty, r.prep_time_minutes, r.cook_time_minutes,
       c.name_cs AS country_cs, mg.emoji AS group_emoji
     FROM public.recipes r
     JOIN public.recipe_translations rt ON rt.recipe_id = r.id AND rt.locale = $2
     LEFT JOIN public.countries c ON c.id = r.country_id
     LEFT JOIN public.country_map_group cmg ON cmg.country_id = c.id
     LEFT JOIN public.map_groups mg ON mg.id = cmg.map_group_id
     WHERE r.id = $1 AND r.deleted_at IS NULL`,
    [id, locale]
  )

  if (recipeRows.length === 0) {
    return NextResponse.json({ success: false }, { status: 404 })
  }

  const { rows: ingredientRows } = await pool.query(
    `SELECT ri.id, ri.amount, ri.unit, ri.prep_note,
            COALESCE(ri.custom_name, i.canonical_name) AS name
     FROM public.recipe_ingredients ri
     LEFT JOIN public.ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1 ORDER BY ri.sort_order`,
    [id]
  )

  const { rows: stepRows } = await pool.query(
    `SELECT rs.id, rs.step_number, rs.default_timer_seconds,
            rst.instruction, rst.tip
     FROM public.recipe_steps rs
     JOIN public.recipe_step_translations rst ON rst.step_id = rs.id AND rst.locale = $2
     WHERE rs.recipe_id = $1 ORDER BY rs.step_number`,
    [id, locale]
  )

  const ingredients = ingredientRows.map((row) => {
    const amt = row.amount != null
      ? (Number(row.amount) % 1 === 0 ? Number(row.amount).toString() : Number(row.amount).toFixed(1))
      : null
    const parts = [amt, row.unit || null, row.name, row.prep_note ? `(${row.prep_note})` : null].filter(Boolean)
    return { id: row.id, label: parts.join(' ') }
  })

  const steps = stepRows.map((row) => ({
    id: row.id,
    title: `${locale === 'cs' ? 'Krok' : 'Step'} ${row.step_number}`,
    instruction: row.instruction,
    tip: row.tip ?? undefined,
    suggestedSeconds: row.default_timer_seconds ?? undefined,
  }))

  return NextResponse.json({
    success: true,
    data: { ...recipeRows[0], ingredients, steps },
  })
}
