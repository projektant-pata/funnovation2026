import { getDictionary, hasLocale, type Locale } from '../../dictionaries'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ lang: string }> }

export default async function FreeplayPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#FEDC56]/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#FEDC56]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L12 2" />
          <path d="M12 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L21 2" />
          <path d="M3 2h18" />
          <path d="M7.5 22h9" />
          <path d="M12 18v4" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-white mb-3">{d.game.freeplay}</h1>
      <p className="text-white/40 text-sm text-center max-w-sm">{d.game.freeplayDescription}</p>
    </div>
  )
}
