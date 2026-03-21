import { hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import ReelsFeed from '@/app/components/game/ReelsFeed'

type Props = { params: Promise<{ lang: string }> }

export default async function ReelsPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <ReelsFeed />
}
