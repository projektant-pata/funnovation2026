'use client'

import { useEffect, useState } from 'react'
import LevelCookingMode from '@/app/components/game/level/LevelCookingMode'
import LevelCompletion from '@/app/components/game/level/LevelCompletion'

export type FreeplayStep = {
  id: string
  title: string
  instruction: string
  tip?: string
  suggestedSeconds?: number
}

export type FreeplayIngredient = {
  id: string
  label: string
}

export type FreeplayRecipeDetail = {
  id: string
  title: string
  description: string
  difficulty: number
  prep_time_minutes: number
  cook_time_minutes: number
  country_cs: string | null
  group_emoji: string | null
  ingredients: FreeplayIngredient[]
  steps: FreeplayStep[]
}

type Labels = {
  ingredientsLabel: string
  timerLabel: string
  add30s: string
  add1m: string
  reset: string
  pause: string
  resume: string
  stepLabel: string
  prevStep: string
  nextStep: string
  finishLabel: string
  doneLabel: string
  noteLabel: string
  notePlaceholder: string
  photoLabel: string
  aiReflectionTitle: string
  chef: string
  chefDescription: string
  comingSoon: string
  completionTitle: string
  completionSubtitle: string
}

type Props = {
  recipe: FreeplayRecipeDetail
  labels: Labels
  backHref: string
}

type Phase = 'cooking' | 'completion'

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function FreeplayRecipeExperience({ recipe, labels, backHref }: Props) {
  const [phase, setPhase] = useState<Phase>('cooking')
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) {
      if (isTimerRunning && timerSeconds <= 0) {
        setIsTimerRunning(false)
        setTimerFinished(true)
      }
      return
    }
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          setTimerFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isTimerRunning, timerSeconds])

  if (phase === 'cooking') {
    return (
      <LevelCookingMode
        recipeName={recipe.title}
        ingredientsLabel={labels.ingredientsLabel}
        ingredients={recipe.ingredients}
        checkedIngredientIds={checkedIngredients}
        onToggleIngredient={(id) => {
          setCheckedIngredients((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
        }}
        timerLabel={labels.timerLabel}
        timerValue={formatTimer(timerSeconds)}
        isTimerRunning={isTimerRunning}
        timerFinished={timerFinished}
        timerAdd30Label={labels.add30s}
        timerAdd60Label={labels.add1m}
        timerResetLabel={labels.reset}
        timerPauseLabel={labels.pause}
        timerResumeLabel={labels.resume}
        onAdd30={() => { setTimerSeconds((p) => p + 30); setTimerFinished(false) }}
        onAdd60={() => { setTimerSeconds((p) => p + 60); setTimerFinished(false) }}
        onReset={() => { setTimerSeconds(0); setIsTimerRunning(false); setTimerFinished(false) }}
        onToggleTimer={() => { if (timerSeconds > 0) setIsTimerRunning((p) => !p) }}
        onSetTimer={(s) => { setTimerSeconds(s); setIsTimerRunning(true); setTimerFinished(false) }}
        onDismissTimerFinished={() => setTimerFinished(false)}
        stepLabel={labels.stepLabel}
        currentStepIndex={currentStepIndex}
        steps={recipe.steps}
        prevStepLabel={labels.prevStep}
        nextStepLabel={labels.nextStep}
        finishLabel={labels.finishLabel}
        onPrevStep={() => setCurrentStepIndex((p) => Math.max(p - 1, 0))}
        onNextStep={() => setCurrentStepIndex((p) => Math.min(p + 1, recipe.steps.length - 1))}
        onFinish={() => { setIsTimerRunning(false); setPhase('completion') }}
        chefLabel={labels.chef}
        chefDescription={labels.chefDescription}
        chefComingSoon={labels.comingSoon}
      />
    )
  }

  return (
    <LevelCompletion
      title={labels.completionTitle}
      subtitle={labels.completionSubtitle}
      noteLabel={labels.noteLabel}
      notePlaceholder={labels.notePlaceholder}
      noteValue={note}
      onNoteChange={setNote}
      photoLabel={labels.photoLabel}
      aiReflectionTitle={labels.aiReflectionTitle}
      reflectionPrompts={[labels.notePlaceholder]}
      doneLabel={labels.doneLabel}
      backToTreeHref={backHref}
    />
  )
}
