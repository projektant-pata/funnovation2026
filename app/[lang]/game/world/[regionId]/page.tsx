import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '../../../dictionaries'
import NodeTree from '@/app/components/game/NodeTree'
import { getRegionById, getRegionNodeTree } from '@/app/lib/mockWorldRegions'
import Link from 'next/link'

type Props = { params: Promise<{ lang: string; regionId: string }> }

export default async function RegionNodeTreePage({ params }: Props) {
  const { lang, regionId } = await params
  if (!hasLocale(lang)) notFound()

  const region = getRegionById(regionId)
  if (!region || region.status === 'locked') notFound()

  const nodeTree = getRegionNodeTree(regionId)
  if (!nodeTree) notFound()

  const d = await getDictionary(lang as Locale)

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 z-30">
        <Link
          href={`/${lang}/game/world`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF3E0] border border-[#4E342E]/10 shadow-md px-3 py-1.5 text-[#4E342E] text-xs font-semibold hover:bg-[#FEDC56]/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {d.game.worldSection.backToMap}
        </Link>
      </div>
      <NodeTree
        lang={lang}
        playLevelLabel={d.game.level.playLevel}
        data={nodeTree}
        basePath={`/${lang}/game/world/${regionId}`}
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
    </div>
  )
}
