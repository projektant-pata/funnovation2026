import { getDictionary, hasLocale, type Locale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import NodeTree from '@/app/components/game/NodeTree'
import { campaignData } from '@/app/lib/mockCampaign'

type Props = { params: Promise<{ lang: string }> }

export default async function CampaignPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  return (
    <NodeTree
      lang={lang}
      playLevelLabel={d.game.level.playLevel}
      data={campaignData}
    />
  )
}
