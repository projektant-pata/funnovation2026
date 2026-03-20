import { getDictionary, hasLocale, type Locale } from '../../../dictionaries'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ lang: string }> }

export default async function ReelsPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#BA68C8]/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#BA68C8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <path d="M7 2v20" />
          <path d="M17 2v20" />
          <path d="M2 12h20" />
          <path d="M2 7h5" />
          <path d="M2 17h5" />
          <path d="M17 7h5" />
          <path d="M17 17h5" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-white mb-3">{d.game.reels}</h1>
      <p className="text-white/40 text-sm text-center max-w-sm">{d.game.comingSoon}</p>
    </div>
  )
}
