import WorldMapClient from '@/app/components/WorldMap/WorldMapClient'

type Props = { params: Promise<{ lang: string }> }

export default async function MapPage({ params }: Props) {
  const { lang } = await params
  return <WorldMapClient lang={lang} />
}
