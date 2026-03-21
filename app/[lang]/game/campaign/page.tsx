import { getDictionary, hasLocale, type Locale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import NodeTree from '@/app/components/game/NodeTree'
import LoginGate from '@/app/components/game/LoginGate'
import { campaignData } from '@/app/lib/mockCampaign'
import { getSession } from '@/app/lib/auth'

type Props = { params: Promise<{ lang: string }> }

export default async function CampaignPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)
  const session = await getSession()

  return (
    <LoginGate isLoggedIn={!!session}>
      <NodeTree
        lang={lang}
        basePath={`/${lang}/game/campaign`}
        playLevelLabel={d.game.level.playLevel}
        data={campaignData}
        popoverLabels={{
          completed: d.game.nodePopover.completed,
          inProgress: d.game.nodePopover.inProgress,
          available: d.game.nodePopover.available,
          locked: d.game.nodePopover.locked,
          mainTask: d.game.nodePopover.mainTask,
          bonusTasks: d.game.nodePopover.bonusTasks,
          close: d.game.nodePopover.close,
        }}
      />
    </LoginGate>
  )
}
