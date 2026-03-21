import { getDictionary, hasLocale, type Locale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import WorldMapView from '@/app/components/game/WorldMapView'
import { getWorldRegions } from '@/app/lib/mockWorldRegions'

type Props = { params: Promise<{ lang: string }> }

export default async function WorldPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)
  const regions = getWorldRegions()

  return (
    <WorldMapView
      regions={regions}
      lang={lang as 'cs' | 'en'}
      labels={{
        enterRegion: d.game.worldSection.enterRegion,
        recipesCompleted: d.game.worldSection.recipesCompleted,
        comingSoon: d.game.worldSection.comingSoon,
        regionLocked: d.game.worldSection.regionLocked,
        title: d.game.worldSection.title,
        subtitle: d.game.worldSection.subtitle,
      }}
    />
  )
}
