'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  CampaignCutsceneSegment,
  CampaignLevelDefinition,
  CampaignLocale,
  LocalizedText,
} from '@/app/lib/mockCampaignLevels'
import LevelCutscene from './LevelCutscene'
import LevelSummary from './LevelSummary'
import LevelCookingMode from './LevelCookingMode'
import LevelCompletion from './LevelCompletion'
import { useLiveChefSession, type LiveToolAction } from '@/app/components/game/ai/useLiveChefSession'

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
  chefDescription: string
  comingSoon: string
  chefVoiceStart: string
  chefVoiceStop: string
  chefVoiceConnecting: string
  chefVoiceUnsupported: string
  chefUseTranscript: string
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

type ChatAction = {
  action_type:
    | 'none'
    | 'timer_start'
    | 'timer_set'
    | 'timer_pause'
    | 'timer_resume'
    | 'timer_cancel'
    | 'step_next'
    | 'step_previous'
    | 'step_go_to'
  timer_seconds: number
  target_step_number: number
}

function toLiveToolAction(action: ChatAction): ReturnType<typeof mapToolActionType> {
  return mapToolActionType(action.action_type, action.timer_seconds, action.target_step_number)
}

function mapToolActionType(
  type:
    | 'none'
    | 'timer_start'
    | 'timer_set'
    | 'timer_pause'
    | 'timer_resume'
    | 'timer_cancel'
    | 'step_next'
    | 'step_previous'
    | 'step_go_to',
  timerSeconds: number,
  stepNumber: number
) {
  switch (type) {
    case 'timer_set':
      return timerSeconds > 0 ? ({ type: 'timer_set', seconds: Math.round(timerSeconds) } as const) : null
    case 'timer_start':
      return timerSeconds > 0
        ? ({ type: 'timer_start', seconds: Math.round(timerSeconds) } as const)
        : ({ type: 'timer_start' } as const)
    case 'timer_pause':
      return { type: 'timer_pause' } as const
    case 'timer_resume':
      return { type: 'timer_resume' } as const
    case 'timer_cancel':
      return { type: 'timer_cancel' } as const
    case 'step_next':
      return { type: 'step_next' } as const
    case 'step_previous':
      return { type: 'step_previous' } as const
    case 'step_go_to':
      return stepNumber > 0 ? ({ type: 'step_go_to', stepNumber: Math.round(stepNumber) } as const) : null
    default:
      return null
  }
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
  const [chefChatMessages, setChefChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([])
  const [isChefThinking, setIsChefThinking] = useState(false)

  const ingredientLines = useMemo(
    () =>
      level.ingredients.map((ingredient) => ({
        id: ingredient.id,
        label: `${pick(ingredient.amount, lang)} - ${pick(ingredient.name, lang)}`,
      })),
    [level.ingredients, lang]
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
    [level.steps, lang]
  )

  const currentStep = steps[currentStepIndex] ?? null

  const cookingContext = useMemo(
    () => ({
      source_context: 'campaign_level',
      session_status: phase,
      recipe: {
        id: level.nodeId,
        title: pick(level.recipeName, lang),
        ingredients: ingredientLines.map((ingredient) => ingredient.label),
      },
      current_step: currentStep
        ? {
            step_number: currentStepIndex + 1,
            title: currentStep.title,
            instruction: currentStep.instruction,
            suggested_seconds: currentStep.suggestedSeconds ?? null,
          }
        : null,
      timer_state: {
        total_seconds: timerSeconds,
        remaining_seconds: timerSeconds,
        is_running: isTimerRunning,
        is_finished: timerFinished,
      },
    }),
    [phase, level.nodeId, level.recipeName, lang, ingredientLines, currentStep, currentStepIndex, timerSeconds, isTimerRunning, timerFinished]
  )

  const runToolAction = useCallback(
    async (action: LiveToolAction) => {
      switch (action.type) {
        case 'timer_set': {
          setTimerSeconds(Math.max(1, action.seconds))
          setTimerFinished(false)
          return { ok: true, message: 'Timer set' }
        }
        case 'timer_start': {
          if (typeof action.seconds === 'number' && action.seconds > 0) {
            setTimerSeconds(Math.max(1, action.seconds))
          }
          setTimerFinished(false)
          setIsTimerRunning(true)
          return { ok: true, message: 'Timer started' }
        }
        case 'timer_pause': {
          setIsTimerRunning(false)
          return { ok: true, message: 'Timer paused' }
        }
        case 'timer_resume': {
          setIsTimerRunning((prev) => (timerSeconds > 0 ? true : prev))
          return { ok: timerSeconds > 0, message: timerSeconds > 0 ? 'Timer resumed' : 'No timer to resume' }
        }
        case 'timer_cancel': {
          setTimerSeconds(0)
          setIsTimerRunning(false)
          setTimerFinished(false)
          return { ok: true, message: 'Timer cancelled' }
        }
        case 'step_next': {
          setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
          return { ok: true, message: 'Moved to next step' }
        }
        case 'step_previous': {
          setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
          return { ok: true, message: 'Moved to previous step' }
        }
        case 'step_go_to': {
          const target = Math.max(1, Math.min(action.stepNumber, steps.length)) - 1
          setCurrentStepIndex(target)
          return { ok: true, message: `Moved to step ${target + 1}` }
        }
        default:
          return { ok: false, message: 'Unsupported action' }
      }
    },
    [steps.length, timerSeconds]
  )

  const liveChef = useLiveChefSession({
    locale: lang === 'en' ? 'en' : 'cs',
    screenContext: `level:${phase}`,
    cookingContext,
    onToolAction: runToolAction,
  })

  const {
    isListening: chefVoiceActive,
    isConnecting: chefVoiceConnecting,
    isSupported: chefVoiceSupported,
    lastError: chefLiveError,
    transcriptEvents: chefTranscriptEvents,
    lastUserTranscript,
    toggleListening: toggleChefVoice,
    stopListening: stopChefListening,
  } = liveChef

  useEffect(() => {
    if (phase !== 'cooking') {
      void stopChefListening()
    }
  }, [phase, stopChefListening])

  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return

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

  const chefEvents = useMemo(
    () => [
      ...chefTranscriptEvents.map((event) => ({
        id: event.id,
        role: event.role,
        text: event.text,
      })),
      ...chefChatMessages,
    ],
    [chefTranscriptEvents, chefChatMessages]
  )

  const sendChefTextMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!text || isChefThinking) return

      const messageId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `chef_${Date.now()}_${Math.floor(Math.random() * 100000)}`

      const userMessage = { id: messageId, role: 'user' as const, text }
      const history = [...chefEvents, userMessage].slice(-8).map((item) => ({
        role: item.role,
        content: item.text,
      }))

      setChefChatMessages((prev) => [...prev, userMessage])
      setIsChefThinking(true)

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale: lang === 'en' ? 'en' : 'cs',
            message: text,
            screen: `level:${phase}`,
            context: cookingContext,
            history,
          }),
        })

        const payload = (await response.json()) as {
          success?: boolean
          data?: {
            reply?: string
            actions?: ChatAction[]
          }
        }

        const actions = Array.isArray(payload.data?.actions) ? payload.data.actions : []
        for (const action of actions) {
          const mapped = toLiveToolAction(action)
          if (!mapped) continue
          await runToolAction(mapped)
        }

        const assistantReply =
          typeof payload.data?.reply === 'string' && payload.data.reply.length > 0
            ? payload.data.reply
            : labels.chefError

        setChefChatMessages((prev) => [
          ...prev,
          {
            id:
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `chef_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            role: 'assistant',
            text: assistantReply,
          },
        ])
      } catch {
        setChefChatMessages((prev) => [
          ...prev,
          {
            id:
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `chef_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            role: 'assistant',
            text: labels.chefError,
          },
        ])
      } finally {
        setIsChefThinking(false)
      }
    },
    [chefEvents, cookingContext, isChefThinking, labels.chefError, lang, phase, runToolAction]
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
        chefLabel={labels.chef}
        chefDescription={labels.chefDescription}
        chefComingSoon={labels.comingSoon}
        chefVoiceStartLabel={labels.chefVoiceStart}
        chefVoiceStopLabel={labels.chefVoiceStop}
        chefVoiceConnectingLabel={labels.chefVoiceConnecting}
        chefVoiceUnsupportedLabel={labels.chefVoiceUnsupported}
        chefUseTranscriptLabel={labels.chefUseTranscript}
        chefInputPlaceholderLabel={labels.chefInputPlaceholder}
        chefSendLabel={labels.chefSend}
        chefThinkingLabel={labels.chefThinking}
        chefVoiceActive={chefVoiceActive}
        chefVoiceConnecting={chefVoiceConnecting}
        chefVoiceSupported={chefVoiceSupported}
        chefLiveError={chefLiveError}
        chefTranscriptEvents={chefEvents}
        canChefUseTranscript={lastUserTranscript.trim().length > 0}
        chefTextLoading={isChefThinking}
        onChefSendText={(text: string) => {
          void sendChefTextMessage(text)
        }}
        onChefToggleVoice={() => {
          void toggleChefVoice()
        }}
        onChefUseTranscript={() => {
          void sendChefTextMessage(lastUserTranscript)
        }}
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
