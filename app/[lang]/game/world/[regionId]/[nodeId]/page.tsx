import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '../../../../dictionaries'
import CampaignLevelExperience from '@/app/components/game/level/CampaignLevelExperience'
import { getWorldLevelByNodeId } from '@/app/lib/mockWorldRegions'
import type { CampaignLocale } from '@/app/lib/mockCampaignLevels'

type Props = { params: Promise<{ lang: string; regionId: string; nodeId: string }> }

export default async function WorldLevelPage({ params }: Props) {
  const { lang, regionId, nodeId } = await params
  if (!hasLocale(lang)) notFound()

  const level = getWorldLevelByNodeId(regionId, nodeId)
  if (!level) notFound()

  const d = await getDictionary(lang as Locale)

  return (
    <CampaignLevelExperience
      lang={lang as CampaignLocale}
      level={level}
      labels={{
        cutsceneModeLabel: d.game.level.cutsceneModeLabel,
        cutsceneTapHint: d.game.level.cutsceneTapHint,
        cutsceneSkip: d.game.level.cutsceneSkip,
        narrator: d.game.level.narrator,
        cutsceneContinue: d.game.level.cutsceneContinue,
        summaryTitle: d.game.level.summaryTitle,
        objective: d.game.level.objective,
        estimatedTime: d.game.level.estimatedTime,
        difficulty: d.game.level.difficulty,
        xpReward: d.game.level.xpReward,
        requirements: d.game.level.requirements,
        ingredients: d.game.level.ingredients,
        startCooking: d.game.level.startCooking,
        timer: d.game.level.timer,
        add30s: d.game.level.add30s,
        add1m: d.game.level.add1m,
        reset: d.game.level.reset,
        pause: d.game.level.pause,
        resume: d.game.level.resume,
        step: d.game.level.step,
        prevStep: d.game.level.prevStep,
        nextStep: d.game.level.nextStep,
        finishLevel: d.game.level.finishLevel,
        done: d.game.level.done,
        noteLabel: d.game.level.noteLabel,
        notePlaceholder: d.game.level.notePlaceholder,
        photoLabel: d.game.level.photoLabel,
        aiReflectionTitle: d.game.level.aiReflectionTitle,
        chef: d.game.chef,
        chefGreeting: d.game.chefGreeting,
        chefInputPlaceholder: d.game.chefInputPlaceholder,
        chefSend: d.game.chefSend,
        chefThinking: d.game.chefThinking,
        chefError: d.game.chefError,
      }}
      backToTreeHref={`/${lang}/game/world/${regionId}`}
    />
  )
}
