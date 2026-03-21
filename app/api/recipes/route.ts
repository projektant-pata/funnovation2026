import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') ?? 'cs'

  const { rows } = await pool.query(`
    SELECT
      r.id,
      rt.title,
      rt.description,
      c.iso2,
      c.name_cs AS country_cs,
      c.name_en AS country_en,
      mg.name_cs AS group_name,
      mg.code    AS group_code,
      mg.emoji   AS group_emoji,
      r.difficulty,
      r.prep_time_minutes,
      r.cook_time_minutes,
      COALESCE(
        array_agg(DISTINCT dt.code) FILTER (WHERE rdc.compatibility = 'compatible'),
        '{}'
      ) AS diets,
      COALESCE(
        array_agg(DISTINCT al.code) FILTER (WHERE ra.allergen_id IS NOT NULL),
        '{}'
      ) AS allergens,
      COALESCE(
        array_agg(DISTINCT tg.code) FILTER (WHERE tg.code IS NOT NULL),
        '{}'
      ) AS tags
    FROM public.recipes r
    JOIN public.recipe_translations rt
      ON rt.recipe_id = r.id AND rt.locale = $1
    LEFT JOIN public.countries c ON c.id = r.country_id
    LEFT JOIN public.country_map_group cmg ON cmg.country_id = c.id
    LEFT JOIN public.map_groups mg ON mg.id = cmg.map_group_id
    LEFT JOIN public.recipe_diet_compatibility rdc ON rdc.recipe_id = r.id
    LEFT JOIN public.diet_types dt ON dt.id = rdc.diet_type_id
    LEFT JOIN public.recipe_allergens ra ON ra.recipe_id = r.id
    LEFT JOIN public.allergens al ON al.id = ra.allergen_id
    LEFT JOIN public.recipe_tag_links rtl ON rtl.recipe_id = r.id
    LEFT JOIN public.recipe_tags tg ON tg.id = rtl.tag_id
    WHERE r.deleted_at IS NULL
    GROUP BY
      r.id, rt.title, rt.description,
      c.iso2, c.name_cs, c.name_en,
      mg.name_cs, mg.code, mg.emoji,
      r.difficulty, r.prep_time_minutes, r.cook_time_minutes
    ORDER BY r.difficulty, rt.title
  `, [locale])

  return NextResponse.json({ success: true, data: rows })
}
