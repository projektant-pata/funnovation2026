'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  CampaignCutsceneData,
  CampaignCutsceneSegment,
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
  chef: string
  chefGreeting: string
  chefInputPlaceholder: string
  chefSend: string
  chefThinking: string
  chefError: string
}

type Props = {
  lang: CampaignLocale
  level: CampaignLevelDefinition
  labels: LevelLabels
  backToTreeHref: string
}

type Phase = 'cutscene' | 'summary' | 'cooking' | 'postcutscene' | 'completion'

function pick(text: LocalizedText, locale: CampaignLocale): string {
  return text[locale]
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function localizeSegments(
  segments: CampaignCutsceneSegment[],
  locale: CampaignLocale
) {
  return segments.map((seg) => {
    if (seg.type === 'transition') return { type: 'transition' as const, caption: seg.caption[locale] }
    return {
      type: 'scene' as const,
      background: seg.background,
      lines: seg.lines.map((line) => ({
        speakerId: line.speakerId,
        text: line.text[locale],
        thought: line.thought,
      })),
    }
  })
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
        image: step.image,
        videoUrl: step.videoUrl,
      })),
    [lang, level.steps]
  )

  const cutsceneSegments = useMemo(
    () => localizeSegments(level.cutscene.segments, lang),
    [lang, level.cutscene.segments]
  )

  const cutsceneCharacters = useMemo(
    () =>
      level.cutscene.characters.map((c) => ({
        id: c.id,
        name: pick(c.name, lang),
        side: c.side,
        avatar: c.avatar,
      })),
    [lang, level.cutscene.characters]
  )

  const postSegments = useMemo(
    () => level.postRecipeCutscene ? localizeSegments(level.postRecipeCutscene.segments, lang) : [],
    [lang, level.postRecipeCutscene]
  )

  const postCharacters = useMemo(
    () =>
      level.postRecipeCutscene
        ? level.postRecipeCutscene.characters.map((c) => ({
            id: c.id,
            name: pick(c.name, lang),
            side: c.side,
            avatar: c.avatar,
          }))
        : [],
    [lang, level.postRecipeCutscene]
  )

  if (phase === 'cutscene') {
    return (
      <LevelCutscene
        title={pick(level.cutscene.title, lang)}
        characters={cutsceneCharacters}
        segments={cutsceneSegments}
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
        timerFinished={timerFinished}
        timerAdd30Label={labels.add30s}
        timerAdd60Label={labels.add1m}
        timerResetLabel={labels.reset}
        timerPauseLabel={labels.pause}
        timerResumeLabel={labels.resume}
        onAdd30={() => { setTimerSeconds((prev) => prev + 30); setTimerFinished(false) }}
        onAdd60={() => { setTimerSeconds((prev) => prev + 60); setTimerFinished(false) }}
        onReset={() => {
          setTimerSeconds(0)
          setIsTimerRunning(false)
          setTimerFinished(false)
        }}
        onToggleTimer={() => {
          if (timerSeconds > 0) setIsTimerRunning((prev) => !prev)
        }}
        onSetTimer={(seconds) => {
          setTimerSeconds(seconds)
          setIsTimerRunning(true)
          setTimerFinished(false)
        }}
        onDismissTimerFinished={() => setTimerFinished(false)}
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
          setPhase(level.postRecipeCutscene ? 'postcutscene' : 'completion')
        }}
        lang={lang}
        chefLabel={labels.chef}
        chefGreeting={labels.chefGreeting}
        chefInputPlaceholder={labels.chefInputPlaceholder}
        chefSend={labels.chefSend}
        chefThinking={labels.chefThinking}
        chefError={labels.chefError}
      />
    )
  }

  if (phase === 'postcutscene') {
    return (
      <LevelCutscene
        title={pick(level.postRecipeCutscene!.title, lang)}
        characters={postCharacters}
        segments={postSegments}
        modeLabel={labels.cutsceneModeLabel}
        tapHintLabel={labels.cutsceneTapHint}
        skipLabel={labels.cutsceneSkip}
        narratorLabel={labels.narrator}
        continueLabel={labels.cutsceneContinue}
        onContinue={() => setPhase('completion')}
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
