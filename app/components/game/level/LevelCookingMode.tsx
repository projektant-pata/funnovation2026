'use client'

type Ingredient = {
  id: string
  label: string
}

type Step = {
  id: string
  title: string
  instruction: string
  tip?: string
  suggestedSeconds?: number
}

type Props = {
  recipeName: string
  ingredientsLabel: string
  ingredients: Ingredient[]
  checkedIngredientIds: Set<string>
  onToggleIngredient: (id: string) => void
  timerLabel: string
  timerValue: string
  isTimerRunning: boolean
  timerAdd30Label: string
  timerAdd60Label: string
  timerResetLabel: string
  timerPauseLabel: string
  timerResumeLabel: string
  onAdd30: () => void
  onAdd60: () => void
  onReset: () => void
  onToggleTimer: () => void
  stepLabel: string
  currentStepIndex: number
  steps: Step[]
  prevStepLabel: string
  nextStepLabel: string
  finishLabel: string
  onPrevStep: () => void
  onNextStep: () => void
  onFinish: () => void
}

export default function LevelCookingMode({
  recipeName,
  ingredientsLabel,
  ingredients,
  checkedIngredientIds,
  onToggleIngredient,
  timerLabel,
  timerValue,
  isTimerRunning,
  timerAdd30Label,
  timerAdd60Label,
  timerResetLabel,
  timerPauseLabel,
  timerResumeLabel,
  onAdd30,
  onAdd60,
  onReset,
  onToggleTimer,
  stepLabel,
  currentStepIndex,
  steps,
  prevStepLabel,
  nextStepLabel,
  finishLabel,
  onPrevStep,
  onNextStep,
  onFinish,
}: Props) {
  const step = steps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === steps.length - 1

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/food/404.jpg)' }}
      />
      <div className="absolute inset-0 bg-[#1f130f]/45 backdrop-blur-md" />

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-3 py-5 sm:px-5 sm:py-8">
        <div className="w-full max-w-6xl rounded-3xl border border-[#FFF8E1]/35 bg-[#FFF8E1]/88 backdrop-blur-sm shadow-2xl p-4 sm:p-6">
          <div className="rounded-2xl border border-[#4E342E]/12 bg-white/90 shadow-sm p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#6D4C41]/70">{timerLabel}</p>
                <p className="text-3xl font-black text-[#4E342E] leading-none mt-1">{timerValue}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <TimerButton label={timerAdd30Label} onClick={onAdd30} />
                <TimerButton label={timerAdd60Label} onClick={onAdd60} />
                <TimerButton label={timerResetLabel} onClick={onReset} />
                <TimerButton
                  label={isTimerRunning ? timerPauseLabel : timerResumeLabel}
                  onClick={onToggleTimer}
                  active
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
            <aside className="rounded-2xl border border-[#4E342E]/10 bg-[#FFF8E1]/95 p-4 h-fit">
              <h2 className="text-sm font-bold text-[#4E342E] mb-3">{ingredientsLabel}</h2>
              <ul className="space-y-2">
                {ingredients.map((ingredient) => {
                  const checked = checkedIngredientIds.has(ingredient.id)
                  return (
                    <li key={ingredient.id}>
                      <button
                        type="button"
                        onClick={() => onToggleIngredient(ingredient.id)}
                        className={`w-full flex items-start gap-2 text-left rounded-lg px-2 py-1.5 transition-colors ${
                          checked ? 'bg-[#FEDC56]/35 text-[#4E342E]' : 'hover:bg-[#4E342E]/5 text-[#5D4037]'
                        }`}
                      >
                        <span
                          className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                            checked
                              ? 'border-[#4E342E] bg-[#4E342E] text-[#FFF8E1]'
                              : 'border-[#4E342E]/40 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span className="text-sm leading-snug">{ingredient.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </aside>

            <article className="rounded-2xl border border-[#4E342E]/10 bg-white/95 p-4 sm:p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6D4C41]/70">{recipeName}</p>
              <h2 className="text-xl sm:text-2xl font-black text-[#4E342E] mt-1">
                {stepLabel} {currentStepIndex + 1}/{steps.length}
              </h2>
              <p className="text-lg font-semibold text-[#5D4037] mt-4">{step.title}</p>
              <p className="text-base text-[#4E342E] leading-relaxed mt-3">{step.instruction}</p>

              {step.tip && (
                <div className="mt-4 rounded-xl border border-[#F5A623]/30 bg-[#FEDC56]/20 p-3">
                  <p className="text-sm text-[#5D4037]">{step.tip}</p>
                </div>
              )}

              {step.suggestedSeconds && (
                <p className="text-xs text-[#6D4C41]/70 mt-3">~ {step.suggestedSeconds}s</p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onPrevStep}
                  disabled={isFirst}
                  className="rounded-xl border border-[#4E342E]/20 px-4 py-2 text-sm font-semibold text-[#4E342E] disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  {prevStepLabel}
                </button>

                {!isLast && (
                  <button
                    type="button"
                    onClick={onNextStep}
                    className="rounded-xl bg-[#4E342E] hover:bg-[#5D4037] px-4 py-2 text-sm font-semibold text-[#FFF8E1] transition-colors"
                  >
                    {nextStepLabel}
                  </button>
                )}

                {isLast && (
                  <button
                    type="button"
                    onClick={onFinish}
                    className="rounded-xl bg-[#F5A623] hover:bg-[#f09a00] px-4 py-2 text-sm font-bold text-[#4E342E] transition-colors"
                  >
                    {finishLabel}
                  </button>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

function TimerButton({
  label,
  onClick,
  active,
}: {
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? 'bg-[#4E342E] text-[#FFF8E1] hover:bg-[#5D4037]'
          : 'bg-[#FFF8E1] border border-[#4E342E]/20 text-[#4E342E] hover:bg-[#4E342E]/5'
      }`}
    >
      {label}
    </button>
  )
}
