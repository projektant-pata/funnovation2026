'use client'

import { useState } from 'react'

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
  image?: string
  videoUrl?: string
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
  timerFinished: boolean
  timerAdd30Label: string
  timerAdd60Label: string
  timerResetLabel: string
  timerPauseLabel: string
  timerResumeLabel: string
  onAdd30: () => void
  onAdd60: () => void
  onReset: () => void
  onToggleTimer: () => void
  onSetTimer: (seconds: number) => void
  onDismissTimerFinished: () => void
  stepLabel: string
  currentStepIndex: number
  steps: Step[]
  prevStepLabel: string
  nextStepLabel: string
  finishLabel: string
  onPrevStep: () => void
  onNextStep: () => void
  onFinish: () => void
  chefLabel: string
  chefDescription: string
  chefComingSoon: string
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
  timerFinished,
  timerAdd30Label,
  timerAdd60Label,
  timerResetLabel,
  timerPauseLabel,
  timerResumeLabel,
  onAdd30,
  onAdd60,
  onReset,
  onToggleTimer,
  onSetTimer,
  onDismissTimerFinished,
  stepLabel,
  currentStepIndex,
  steps,
  prevStepLabel,
  nextStepLabel,
  finishLabel,
  onPrevStep,
  onNextStep,
  onFinish,
  chefLabel,
  chefDescription,
  chefComingSoon,
}: Props) {
  const step = steps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === steps.length - 1
  const [chefCollapsed, setChefCollapsed] = useState(false)

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/food/404.jpg)' }}
      />
      <div className="absolute inset-0 bg-[#1f130f]/45 backdrop-blur-md" />

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-3 py-5 sm:px-5 sm:py-8">
        <div className="h-[80dvh] w-full max-w-7xl flex items-stretch">
        <div className="w-full max-w-7xl mx-auto rounded-3xl border border-[#FFF8E1]/35 bg-[#FFF8E1]/88 backdrop-blur-sm shadow-2xl p-4 sm:p-6 flex flex-col">
          {/* Timer bar */}
          <div className={`rounded-2xl border bg-white/90 shadow-sm p-4 mb-4 transition-colors duration-300 ${
            timerFinished
              ? 'border-[#E57373]/60 bg-[#E57373]/10 animate-pulse'
              : 'border-[#4E342E]/12'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#6D4C41]/70">{timerLabel}</p>
                <p className={`text-3xl font-black leading-none mt-1 transition-colors ${
                  timerFinished ? 'text-[#E57373]' : 'text-[#4E342E]'
                }`}>
                  {timerValue}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {timerFinished ? (
                  <TimerButton label="OK" onClick={onDismissTimerFinished} active />
                ) : (
                  <>
                    <TimerButton label={timerAdd30Label} onClick={onAdd30} />
                    <TimerButton label={timerAdd60Label} onClick={onAdd60} />
                    <TimerButton label={timerResetLabel} onClick={onReset} />
                    <TimerButton
                      label={isTimerRunning ? timerPauseLabel : timerResumeLabel}
                      onClick={onToggleTimer}
                      active
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main 3-column grid: ingredients | steps | chef */}
          <div className={`flex-1 min-h-0 grid grid-cols-1 gap-4 ${
            chefCollapsed
              ? 'lg:grid-cols-[280px_1fr_auto]'
              : 'lg:grid-cols-[280px_1fr_320px]'
          }`}>
            {/* Ingredients sidebar */}
            <aside className="rounded-2xl border border-[#4E342E]/10 bg-[#FFF8E1]/95 p-4 lg:overflow-y-auto lg:min-h-0">
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

            {/* Step content */}
            <article className="rounded-2xl border border-[#4E342E]/10 bg-white/95 p-4 sm:p-6 lg:overflow-y-auto lg:min-h-0">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6D4C41]/70">{recipeName}</p>
              <h2 className="text-xl sm:text-2xl font-black text-[#4E342E] mt-1">
                {stepLabel} {currentStepIndex + 1}/{steps.length}
              </h2>
              <p className="text-lg font-semibold text-[#5D4037] mt-4">{step.title}</p>

              <div className={`mt-3 ${step.image || step.videoUrl ? 'flex flex-col sm:flex-row gap-4' : ''}`}>
                <p className="text-base text-[#4E342E] leading-relaxed flex-1">{step.instruction}</p>

                {step.videoUrl && (
                  <div className="sm:w-56 shrink-0 rounded-xl overflow-hidden border border-[#4E342E]/10 bg-black aspect-video">
                    <iframe
                      src={step.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {!step.videoUrl && step.image && (
                  <div className="sm:w-56 shrink-0 rounded-xl overflow-hidden border border-[#4E342E]/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>

              {step.tip && (
                <div className="mt-4 rounded-xl border border-[#F5A623]/30 bg-[#FEDC56]/20 p-3">
                  <p className="text-sm text-[#5D4037]">{step.tip}</p>
                </div>
              )}

              {step.suggestedSeconds != null && step.suggestedSeconds > 0 && (
                <button
                  type="button"
                  onClick={() => onSetTimer(step.suggestedSeconds!)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#4E342E]/20 bg-[#FFF8E1] px-3 py-1.5 text-xs font-semibold text-[#4E342E] hover:bg-[#FEDC56]/30 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatSuggestedTime(step.suggestedSeconds)}
                </button>
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

            {/* Chef AI panel — integrated column */}
            {chefCollapsed ? (
              <div className="flex flex-col items-center pt-2">
                <button
                  type="button"
                  onClick={() => setChefCollapsed(false)}
                  className="w-12 h-12 rounded-full bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] shadow-md flex items-center justify-center transition-all hover:scale-105"
                  aria-label={chefLabel}
                >
                  <ChefHatIcon className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <aside className="rounded-2xl border border-[#4E342E]/10 bg-white/95 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#4E342E]/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FEDC56] flex items-center justify-center">
                      <ChefHatIcon className="w-4 h-4 text-[#4E342E]" />
                    </div>
                    <span className="text-xs font-bold text-[#4E342E]">{chefLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChefCollapsed(true)}
                    className="p-1.5 rounded-lg text-[#6D4C41]/50 hover:text-[#4E342E] hover:bg-[#4E342E]/8 transition-colors"
                    aria-label="Collapse"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                {/* Chat messages area */}
                <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col items-center justify-center text-center">
                  <ChefHatIcon className="w-10 h-10 text-[#E57373]/20 mb-2" />
                  <p className="text-xs text-[#6D4C41]/50 leading-relaxed">{chefDescription}</p>
                  <p className="text-[10px] text-[#6D4C41]/30 mt-1">{chefComingSoon}</p>
                </div>

                {/* Chat input + voice */}
                <div className="border-t border-[#4E342E]/10 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      placeholder={chefComingSoon}
                      className="flex-1 rounded-xl border border-[#4E342E]/15 bg-[#FFF8E1]/60 px-3 py-2.5 text-sm text-[#4E342E] placeholder:text-[#6D4C41]/35 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                    />
                    {/* Voice button */}
                    <button
                      type="button"
                      disabled
                      className="w-10 h-10 rounded-full bg-[#4E342E] text-[#FFF8E1] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#5D4037] transition-colors"
                      aria-label="Voice"
                    >
                      <MicIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}

function formatSuggestedTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0 && s > 0) return `${m} min ${s}s`
  if (m > 0) return `${m} min`
  return `${s}s`
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

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.24 2 7 4.24 7 7c-2.21 0-4 1.79-4 4 0 1.95 1.4 3.57 3.25 3.92L7 19h10l.75-4.08C19.6 14.57 21 12.95 21 11c0-2.21-1.79-4-4-4 0-2.76-2.24-5-5-5zM7 21h10v1H7v-1z" />
    </svg>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}
