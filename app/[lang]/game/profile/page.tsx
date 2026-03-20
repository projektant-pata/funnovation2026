import { getDictionary, hasLocale, type Locale } from '../../dictionaries'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ lang: string }> }

export default async function ProfilePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#FEDC56]/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#FEDC56]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-[#4E342E] mb-3">{d.game.profile}</h1>
      <p className="text-[#6D4C41]/60 text-sm text-center max-w-sm">{d.game.comingSoon}</p>
    </div>
  )
}
