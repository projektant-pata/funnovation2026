'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  CampaignLevelDefinition,
  CampaignLocale,
  LocalizedText,
} from '@/app/lib/mockCampaignLevels'
import LevelCutscene from './LevelCutscene'
import LevelSummary from './LevelSummary'
import LevelCookingMode from './LevelCookingMode'
import LevelCompletion from './LevelCompletion'

type LevelLabels = {
  cutsceneModeLabel: string
  cutsceneTapHint: string
  cutsceneSkip: string
  narrator: string
  cutsceneContinue: string
  summaryTitle: string
  objective: string
  estimatedTime: string
  difficulty: string
  xpReward: string
  requirements: string
  ingredients: string
  startCooking: string
  timer: string
  add30s: string
  add1m: string
  reset: string
  pause: string
  resume: string
  step: string
  prevStep: string
  nextStep: string
  finishLevel: string
  done: string
  noteLabel: string
  notePlaceholder: string
  photoLabel: string
  aiReflectionTitle: string
}

type Props = {
  lang: CampaignLocale
  level: CampaignLevelDefinition
  labels: LevelLabels
  backToTreeHref: string
}

type Phase = 'cutscene' | 'summary' | 'cooking' | 'completion'

function pick(text: LocalizedText, locale: CampaignLocale): string {
  return text[locale]
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function CampaignLevelExperience({
  lang,
  level,
  labels,
  backToTreeHref,
}: Props) {
  const [phase, setPhase] = useState<Phase>('cutscene')
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!isTimerRunning) return
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(id)
  }, [isTimerRunning])

  const ingredientLines = useMemo(
    () =>
      level.ingredients.map((ingredient) => ({
        id: ingredient.id,
        label: `${pick(ingredient.amount, lang)} - ${pick(ingredient.name, lang)}`,
      })),
    [lang, level.ingredients]
  )

  const steps = useMemo(
    () =>
      level.steps.map((step) => ({
        id: step.id,
        title: pick(step.title, lang),
        instruction: pick(step.instruction, lang),
        tip: step.tip ? pick(step.tip, lang) : undefined,
        suggestedSeconds: step.suggestedSeconds,
      })),
    [lang, level.steps]
  )

  const cutsceneLines = useMemo(
    () =>
      level.cutscene.lines.map((line) => ({
        speakerId: line.speakerId,
        text: pick(line.text, lang),
      })),
    [lang, level.cutscene.lines]
  )

  const cutsceneCharacters = useMemo(
    () =>
      level.cutscene.characters.map((character) => ({
        id: character.id,
        name: pick(character.name, lang),
        side: character.side,
        avatar: character.avatar,
      })),
    [lang, level.cutscene.characters]
  )

  if (phase === 'cutscene') {
    return (
      <LevelCutscene
        title={pick(level.cutscene.title, lang)}
        setting={pick(level.cutscene.setting, lang)}
        backgroundOptions={level.cutscene.backgroundOptions}
        characters={cutsceneCharacters}
        lines={cutsceneLines}
        modeLabel={labels.cutsceneModeLabel}
        tapHintLabel={labels.cutsceneTapHint}
        skipLabel={labels.cutsceneSkip}
        narratorLabel={labels.narrator}
        continueLabel={labels.cutsceneContinue}
        onContinue={() => setPhase('summary')}
      />
    )
  }

  if (phase === 'summary') {
    return (
      <LevelSummary
        titleLabel={labels.summaryTitle}
        recipeName={pick(level.recipeName, lang)}
        objectiveLabel={labels.objective}
        objective={pick(level.objective, lang)}
        estimatedTimeLabel={labels.estimatedTime}
        estimatedTime={pick(level.estimatedTime, lang)}
        difficultyLabel={labels.difficulty}
        difficulty={level.difficulty}
        xpLabel={labels.xpReward}
        xpReward={level.xpReward}
        requirementsLabel={labels.requirements}
        requirements={level.requirements.map((req) => pick(req, lang))}
        ingredientsLabel={labels.ingredients}
        ingredients={ingredientLines}
        startCookingLabel={labels.startCooking}
        onStartCooking={() => setPhase('cooking')}
      />
    )
  }

  if (phase === 'cooking') {
    return (
      <LevelCookingMode
        recipeName={pick(level.recipeName, lang)}
        ingredientsLabel={labels.ingredients}
        ingredients={ingredientLines}
        checkedIngredientIds={checkedIngredients}
        onToggleIngredient={(id) => {
          setCheckedIngredients((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
            return next
          })
        }}
        timerLabel={labels.timer}
        timerValue={formatTimer(timerSeconds)}
        isTimerRunning={isTimerRunning}
        timerAdd30Label={labels.add30s}
        timerAdd60Label={labels.add1m}
        timerResetLabel={labels.reset}
        timerPauseLabel={labels.pause}
        timerResumeLabel={labels.resume}
        onAdd30={() => setTimerSeconds((prev) => prev + 30)}
        onAdd60={() => setTimerSeconds((prev) => prev + 60)}
        onReset={() => {
          setTimerSeconds(0)
          setIsTimerRunning(false)
        }}
        onToggleTimer={() => setIsTimerRunning((prev) => !prev)}
        stepLabel={labels.step}
        currentStepIndex={currentStepIndex}
        steps={steps}
        prevStepLabel={labels.prevStep}
        nextStepLabel={labels.nextStep}
        finishLabel={labels.finishLevel}
        onPrevStep={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
        onNextStep={() => setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onFinish={() => {
          setIsTimerRunning(false)
          setPhase('completion')
        }}
      />
    )
  }

  return (
    <LevelCompletion
      title={pick(level.completion.title, lang)}
      subtitle={pick(level.completion.subtitle, lang)}
      noteLabel={labels.noteLabel}
      notePlaceholder={labels.notePlaceholder}
      noteValue={note}
      onNoteChange={setNote}
      photoLabel={labels.photoLabel}
      aiReflectionTitle={labels.aiReflectionTitle}
      reflectionPrompts={level.completion.reflectionPrompts.map((prompt) => pick(prompt, lang))}
      doneLabel={labels.done}
      backToTreeHref={backToTreeHref}
    />
  )
}
