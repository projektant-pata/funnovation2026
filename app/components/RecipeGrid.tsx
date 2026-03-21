'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LevelSummary from '@/app/components/game/level/LevelSummary'

const PAGE_SIZE = 9

function getRecipeImage(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('guláš') || t.includes('gulas') || t.includes('gulash')) return '/food/gulas.png'
  if (t.includes('pad thai') || t.includes('pad-thai')) return '/food/pad-thai.png'
  if (t.includes('bourguignon')) return '/food/Boeuf-Bourguignon.jpg'
  return '/food/404.jpg'
}

const DIET_LABELS: Record<string, string> = {
  vegan:       'Vegan',
  vegetarian:  'Vegetariánské',
  pescatarian: 'Pescatarián',
  gluten_free: 'Bezlepkové',
  low_carb:    'Low-carb',
}

const DIET_COLORS: Record<string, string> = {
  vegan:       'bg-green-100 text-green-700',
  vegetarian:  'bg-emerald-100 text-emerald-700',
  pescatarian: 'bg-teal-100 text-teal-700',
  gluten_free: 'bg-orange-100 text-orange-700',
  low_carb:    'bg-blue-100 text-blue-700',
}

const ALLERGEN_LABELS: Record<string, string> = {
  gluten:   '🌾 Lepek',
  lactose:  '🥛 Laktóza',
  nuts:     '🥜 Ořechy',
  eggs:     '🥚 Vejce',
  soy:      '🫘 Sója',
  seafood:  '🦐 Mořské plody',
}

const DIFF_LABEL = ['', 'Velmi snadné', 'Snadné', 'Střední', 'Těžké', 'Expert']
const DIFF_COLOR = ['', 'bg-green-100 text-green-700', 'bg-lime-100 text-lime-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700']

type Recipe = {
  id: string
  title: string
  description: string
  iso2: string | null
  country_cs: string | null
  group_name: string | null
  group_code: string | null
  group_emoji: string | null
  difficulty: number
  prep_time_minutes: number
  cook_time_minutes: number
  diets: string[]
  allergens: string[]
  tags: string[]
}

type RecipeDetail = {
  id: string
  title: string
  description: string
  difficulty: number
  prep_time_minutes: number
  cook_time_minutes: number
  ingredients: { id: string; label: string }[]
  steps: { id: string }[]
}

function RecipeCard({ recipe, onOpen }: { recipe: Recipe; onOpen: () => void }) {
  const img = getRecipeImage(recipe.title)

  return (
    <button
      onClick={onOpen}
      className="bg-white rounded-3xl overflow-hidden border border-[#4E342E]/8 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer text-left w-full"
    >
      <div className="relative h-44 bg-[#FFF3E0] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={recipe.title} className="w-full h-full object-cover" loading="lazy" />
        <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${DIFF_COLOR[recipe.difficulty]}`}>
          {DIFF_LABEL[recipe.difficulty]}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-black text-[#4E342E] leading-tight">{recipe.title}</h3>

        <div className="flex flex-wrap gap-1.5">
          {recipe.country_cs && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#4E342E]/6 text-[#4E342E] px-2.5 py-1 rounded-full">
              {recipe.group_emoji} {recipe.country_cs}
            </span>
          )}
          {recipe.diets.filter(Boolean).map((d) => (
            <span key={d} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIET_COLORS[d] ?? 'bg-gray-100 text-gray-600'}`}>
              {DIET_LABELS[d] ?? d}
            </span>
          ))}
          {recipe.allergens.filter(Boolean).map((a) => (
            <span key={a} className="text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
              {ALLERGEN_LABELS[a] ?? a}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6D4C41]/60 font-medium">
          <span>⏱ příprava {recipe.prep_time_minutes} min</span>
          <span>🍳 vaření {recipe.cook_time_minutes} min</span>
        </div>

        <p className="text-sm text-[#6D4C41]/70 leading-relaxed line-clamp-3 flex-1">
          {recipe.description}
        </p>
      </div>
    </button>
  )
}

function RecipeSummaryModal({
  recipeId,
  lang,
  onClose,
}: {
  recipeId: string
  lang: string
  onClose: () => void
}) {
  const router = useRouter()
  const [detail, setDetail] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/recipes/${recipeId}?locale=${lang}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDetail(json.data)
      })
      .finally(() => setLoading(false))
  }, [recipeId, lang])

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* LevelSummary directly — no extra wrapper */}
      <div className="relative z-10">
        {loading || !detail ? (
          <div className="min-h-[100dvh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FEDC56] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <LevelSummary
            recipeName={detail.title}
            onClose={onClose}
            objectiveLabel={lang === 'cs' ? 'Popis' : 'Description'}
            objective={detail.description}
            estimatedTimeLabel={lang === 'cs' ? 'Čas' : 'Time'}
            estimatedTime={`${detail.prep_time_minutes + detail.cook_time_minutes} min`}
            difficultyLabel={lang === 'cs' ? 'Obtížnost' : 'Difficulty'}
            difficulty={detail.difficulty}
            ingredientsLabel={lang === 'cs' ? 'Ingredience' : 'Ingredients'}
            ingredients={detail.ingredients}
            startCookingLabel={lang === 'cs' ? 'Začít vařit' : 'Start cooking'}
            onStartCooking={() => router.push(`/${lang}/game/freeplay/${recipeId}`)}
          />
        )}
      </div>
    </div>
  )
}

const ALL_DIFFICULTIES = [
  { value: 0, label: 'Vše' },
  { value: 1, label: 'Velmi snadné' },
  { value: 2, label: 'Snadné' },
  { value: 3, label: 'Střední' },
  { value: 4, label: 'Těžké' },
  { value: 5, label: 'Expert' },
]

export default function RecipeGrid({ recipes, lang }: { recipes: Recipe[]; lang: string }) {
  const [search,     setSearch]     = useState('')
  const [groupCode,  setGroupCode]  = useState('')
  const [diet,       setDiet]       = useState('')
  const [difficulty, setDifficulty] = useState(0)
  const [shown,      setShown]      = useState(PAGE_SIZE)
  const [openId,     setOpenId]     = useState<string | null>(null)

  const loaderRef = useRef<HTMLDivElement>(null)

  const groups = Array.from(
    new Map(
      recipes
        .filter((r) => r.group_code)
        .map((r) => [r.group_code, { code: r.group_code!, name: r.group_name!, emoji: r.group_emoji! }])
    ).values()
  )

  const filtered = recipes.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.description.toLowerCase().includes(search.toLowerCase())) return false
    if (groupCode && r.group_code !== groupCode) return false
    if (diet && !r.diets.includes(diet)) return false
    if (difficulty && r.difficulty !== difficulty) return false
    return true
  })

  useEffect(() => { setShown(PAGE_SIZE) }, [search, groupCode, diet, difficulty])

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setShown((s) => Math.min(s + PAGE_SIZE, filtered.length))
    }
  }, [filtered.length])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  const visible = filtered.slice(0, shown)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D4C41]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Hledat recept…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#4E342E]/15 bg-white text-sm text-[#4E342E] placeholder-[#6D4C41]/40 focus:outline-none focus:border-[#FEDC56] focus:ring-2 focus:ring-[#FEDC56]/30 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setGroupCode('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${!groupCode ? 'bg-[#4E342E] text-white' : 'bg-white border border-[#4E342E]/15 text-[#6D4C41] hover:border-[#4E342E]/30'}`}
            >
              Všechny regiony
            </button>
            {groups.map((g) => (
              <button
                key={g.code}
                onClick={() => setGroupCode(g.code === groupCode ? '' : g.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${groupCode === g.code ? 'bg-[#4E342E] text-white' : 'bg-white border border-[#4E342E]/15 text-[#6D4C41] hover:border-[#4E342E]/30'}`}
              >
                {g.emoji} {g.name}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-[#4E342E]/6" />

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setDiet('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${!diet ? 'bg-[#FEDC56] text-[#4E342E]' : 'bg-white border border-[#4E342E]/15 text-[#6D4C41] hover:border-[#4E342E]/30'}`}
            >
              Vše
            </button>
            {Object.entries(DIET_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setDiet(diet === code ? '' : code)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${diet === code ? 'bg-[#FEDC56] text-[#4E342E]' : 'bg-white border border-[#4E342E]/15 text-[#6D4C41] hover:border-[#4E342E]/30'}`}
              >
                {label}
              </button>
            ))}
            {ALL_DIFFICULTIES.slice(1).map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(difficulty === d.value ? 0 : d.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${difficulty === d.value ? 'bg-[#4E342E] text-white' : 'bg-white border border-[#4E342E]/15 text-[#6D4C41] hover:border-[#4E342E]/30'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold text-[#6D4C41]/60 mb-6">
        {filtered.length === recipes.length
          ? `${recipes.length} receptů celkem`
          : `${filtered.length} ${filtered.length === 1 ? 'shoda' : filtered.length < 5 ? 'shody' : 'shod'} nalezeno`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-[#6D4C41]/40">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold">Žádné recepty neodpovídají filtrům</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onOpen={() => setOpenId(recipe.id)} />
            ))}
          </div>

          {shown < filtered.length && (
            <div ref={loaderRef} className="flex justify-center py-10">
              <div className="w-8 h-8 border-3 border-[#FEDC56] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}

      {openId && (
        <RecipeSummaryModal
          recipeId={openId}
          lang={lang}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  )
}
