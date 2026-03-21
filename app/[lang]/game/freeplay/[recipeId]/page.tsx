import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '../../../dictionaries'
import pool from '@/app/lib/db'
import FreeplayRecipeExperience, {
  type FreeplayRecipeDetail,
} from '@/app/components/game/freeplay/FreeplayRecipeExperience'

type Props = { params: Promise<{ lang: string; recipeId: string }> }

async function getRecipeDetail(recipeId: string, locale: string): Promise<FreeplayRecipeDetail | null> {
  const { rows: recipeRows } = await pool.query(
    `SELECT
       r.id,
       rt.title,
       rt.description,
       r.difficulty,
       r.prep_time_minutes,
       r.cook_time_minutes,
       c.name_cs AS country_cs,
       mg.emoji  AS group_emoji
     FROM public.recipes r
     JOIN public.recipe_translations rt ON rt.recipe_id = r.id AND rt.locale = $2
     LEFT JOIN public.countries c ON c.id = r.country_id
     LEFT JOIN public.country_map_group cmg ON cmg.country_id = c.id
     LEFT JOIN public.map_groups mg ON mg.id = cmg.map_group_id
     WHERE r.id = $1 AND r.deleted_at IS NULL`,
    [recipeId, locale]
  )

  if (recipeRows.length === 0) return null
  const recipe = recipeRows[0]

  const { rows: ingredientRows } = await pool.query(
    `SELECT
       ri.id,
       ri.amount,
       ri.unit,
       ri.prep_note,
       COALESCE(ri.custom_name, i.canonical_name) AS name
     FROM public.recipe_ingredients ri
     LEFT JOIN public.ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1
     ORDER BY ri.sort_order`,
    [recipeId]
  )

  const { rows: stepRows } = await pool.query(
    `SELECT
       rs.id,
       rs.step_number,
       rs.default_timer_seconds,
       rst.instruction,
       rst.tip
     FROM public.recipe_steps rs
     JOIN public.recipe_step_translations rst ON rst.step_id = rs.id AND rst.locale = $2
     WHERE rs.recipe_id = $1
     ORDER BY rs.step_number`,
    [recipeId, locale]
  )

  const ingredients = ingredientRows.map((row) => {
    const parts = [
      row.amount != null ? Number(row.amount) % 1 === 0 ? Number(row.amount).toString() : Number(row.amount).toFixed(1) : null,
      row.unit || null,
      row.name,
      row.prep_note ? `(${row.prep_note})` : null,
    ].filter(Boolean)
    return { id: row.id, label: parts.join(' ') }
  })

  const steps = stepRows.map((row) => ({
    id: row.id,
    title: `${locale === 'cs' ? 'Krok' : 'Step'} ${row.step_number}`,
    instruction: row.instruction,
    tip: row.tip ?? undefined,
    suggestedSeconds: row.default_timer_seconds ?? undefined,
  }))

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    difficulty: recipe.difficulty,
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    country_cs: recipe.country_cs,
    group_emoji: recipe.group_emoji,
    ingredients,
    steps,
  }
}

export default async function FreeplayRecipePage({ params }: Props) {
  const { lang, recipeId } = await params
  if (!hasLocale(lang)) notFound()

  const recipe = await getRecipeDetail(recipeId, lang)
  if (!recipe) notFound()

  const d = await getDictionary(lang as Locale)
  const l = d.game.level

  return (
    <FreeplayRecipeExperience
      recipe={recipe}
      labels={{
        ingredientsLabel: l.ingredients,
        timerLabel: l.timer,
        add30s: l.add30s,
        add1m: l.add1m,
        reset: l.reset,
        pause: l.pause,
        resume: l.resume,
        stepLabel: l.step,
        prevStep: l.prevStep,
        nextStep: l.nextStep,
        finishLabel: l.finishLevel,
        doneLabel: lang === 'cs' ? 'Zpět na recepty' : 'Back to recipes',
        noteLabel: l.noteLabel,
        notePlaceholder: l.notePlaceholder,
        photoLabel: l.photoLabel,
        aiReflectionTitle: l.aiReflectionTitle,
        chef: d.game.chef,
        chefGreeting: d.game.chefGreeting,
        chefInputPlaceholder: d.game.chefInputPlaceholder,
        chefSend: d.game.chefSend,
        chefThinking: d.game.chefThinking,
        chefError: d.game.chefError,
        completionTitle: lang === 'cs' ? 'Recept dokončen!' : 'Recipe completed!',
        completionSubtitle: lang === 'cs' ? `Skvělá práce s receptem ${recipe.title}.` : `Great job cooking ${recipe.title}.`,
      }}
      lang={lang}
      backHref={`/${lang}/game/freeplay`}
    />
  )
}
