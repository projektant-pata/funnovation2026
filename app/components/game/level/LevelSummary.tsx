'use client'

type IngredientLine = {
  id: string
  label: string
}

type Props = {
  titleLabel: string
  recipeName: string
  objectiveLabel: string
  objective: string
  estimatedTimeLabel: string
  estimatedTime: string
  difficultyLabel: string
  difficulty: number
  xpLabel: string
  xpReward: number
  requirementsLabel: string
  requirements: string[]
  ingredientsLabel: string
  ingredients: IngredientLine[]
  startCookingLabel: string
  onStartCooking: () => void
}

export default function LevelSummary({
  titleLabel,
  recipeName,
  objectiveLabel,
  objective,
  estimatedTimeLabel,
  estimatedTime,
  difficultyLabel,
  difficulty,
  xpLabel,
  xpReward,
  requirementsLabel,
  requirements,
  ingredientsLabel,
  ingredients,
  startCookingLabel,
  onStartCooking,
}: Props) {
  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl rounded-3xl border border-[#4E342E]/10 bg-white shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[#4E342E]/10 bg-[#FFF8E1]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6D4C41]/70">{titleLabel}</p>
          <h1 className="text-2xl font-black text-[#4E342E] mt-1">{recipeName}</h1>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#4E342E] mb-1">{objectiveLabel}</h2>
              <p className="text-sm text-[#6D4C41] leading-relaxed">{objective}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <SummaryMetric label={estimatedTimeLabel} value={estimatedTime} />
              <SummaryMetric label={difficultyLabel} value={`${difficulty}/5`} />
              <SummaryMetric label={xpLabel} value={`${xpReward} XP`} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#4E342E] mb-2">{requirementsLabel}</h2>
              <ul className="space-y-1.5">
                {requirements.map((item) => (
                  <li key={item} className="text-sm text-[#6D4C41] flex items-start gap-2">
                    <span className="text-[#F5A623]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-[#4E342E]/10 p-4 bg-[#FFF8E1]">
            <h2 className="text-sm font-bold text-[#4E342E] mb-3">{ingredientsLabel}</h2>
            <ul className="space-y-2.5">
              {ingredients.map((ingredient) => (
                <li key={ingredient.id} className="text-sm text-[#5D4037]">
                  {ingredient.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={onStartCooking}
            className="w-full sm:w-auto rounded-xl bg-[#4E342E] hover:bg-[#5D4037] text-[#FFF8E1] font-semibold px-6 py-3 transition-colors"
          >
            {startCookingLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#4E342E]/10 bg-[#FFF8E1] p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#6D4C41]/70">{label}</p>
      <p className="text-sm font-bold text-[#4E342E] mt-1">{value}</p>
    </div>
  )
}
