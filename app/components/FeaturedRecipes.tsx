'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LevelSummary from '@/app/components/game/level/LevelSummary'

type FeaturedRecipe = {
  id: string
  dbId: string
  flag: string
  country: string
  title: string
  description: string
  image: string
  difficultyLabel: string
  difficultyColor: string
  prep: number
  cook: number
}

type RecipeDetail = {
  id: string
  title: string
  description: string
  difficulty: number
  prep_time_minutes: number
  cook_time_minutes: number
  ingredients: { id: string; label: string }[]
}

export default function FeaturedRecipes({
  recipes,
  lang,
}: {
  recipes: FeaturedRecipe[]
  lang: string
}) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(false)

  function openModal(dbId: string) {
    setOpenId(dbId)
    setDetail(null)
    setLoading(true)
    fetch(`/api/recipes/${dbId}?locale=${lang}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setDetail(json.data) })
      .finally(() => setLoading(false))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => openModal(recipe.dbId)}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#4E342E]/8 hover:shadow-md transition-shadow flex flex-col cursor-pointer text-left w-full"
          >
            <div className="relative h-44 bg-[#FFF3E0] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${recipe.difficultyColor}`}>
                {recipe.difficultyLabel}
              </span>
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="text-lg font-black text-[#4E342E] leading-tight">{recipe.title}</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#4E342E]/6 text-[#4E342E] px-2.5 py-1 rounded-full">
                  {recipe.flag} {recipe.country}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6D4C41]/60 font-medium">
                <span>⏱ příprava {recipe.prep} min</span>
                <span>🍳 vaření {recipe.cook} min</span>
              </div>
              <p className="text-sm text-[#6D4C41]/70 leading-relaxed line-clamp-3 flex-1">{recipe.description}</p>
            </div>
          </button>
        ))}
      </div>

      {openId && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <div className="relative z-10">
            {loading || !detail ? (
              <div className="min-h-[100dvh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#FEDC56] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <LevelSummary
                recipeName={detail.title}
                onClose={() => setOpenId(null)}
                objectiveLabel={lang === 'cs' ? 'Popis' : 'Description'}
                objective={detail.description}
                estimatedTimeLabel={lang === 'cs' ? 'Čas' : 'Time'}
                estimatedTime={`${detail.prep_time_minutes + detail.cook_time_minutes} min`}
                difficultyLabel={lang === 'cs' ? 'Obtížnost' : 'Difficulty'}
                difficulty={detail.difficulty}
                ingredientsLabel={lang === 'cs' ? 'Ingredience' : 'Ingredients'}
                ingredients={detail.ingredients}
                startCookingLabel={lang === 'cs' ? 'Začít vařit' : 'Start cooking'}
                onStartCooking={() => router.push(`/${lang}/game/freeplay/${openId}`)}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
