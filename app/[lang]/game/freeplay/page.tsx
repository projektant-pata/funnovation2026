import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '../../dictionaries'
import pool from '@/app/lib/db'
import RecipeGrid from '@/app/components/RecipeGrid'

type Props = { params: Promise<{ lang: string }> }

async function getRecipes(locale: string) {
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
  return rows
}

export default async function FreeplayPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const recipes = await getRecipes(lang as Locale)
  const d = await getDictionary(lang as Locale)

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="text-xs font-bold uppercase tracking-widest text-[#6D4C41]/40 mb-2">
          {d.game.freeplay}
        </div>
        <h1 className="text-4xl font-black text-[#4E342E] mb-2">{d.game.freeplaySection.title}</h1>
        <p className="text-[#6D4C41]/60">{d.game.freeplaySection.subtitle}</p>
      </div>

      <RecipeGrid recipes={recipes} lang={lang} />
    </div>
  )
}
