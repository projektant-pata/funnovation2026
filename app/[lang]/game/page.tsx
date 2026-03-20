import Link from 'next/link'
import { getDictionary, hasLocale, type Locale } from '../dictionaries'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ lang: string }> }

const modes = [
  { key: 'campaign' as const, path: '/campaign', icon: CampaignIcon, color: '#E57373' },
  { key: 'world' as const, path: '/world', icon: WorldIcon, color: '#4FC3F7' },
  { key: 'freeplay' as const, path: '/freeplay', icon: FreeplayIcon, color: '#FEDC56' },
]

export default async function GameHomePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  const descriptions: Record<string, string> = {
    campaign: d.game.campaignDescription,
    world: d.game.worldDescription,
    freeplay: d.game.freeplayDescription,
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12">
      <h1 className="text-3xl font-black text-[#4E342E] mb-2">{d.game.play}</h1>
      <p className="text-[#6D4C41]/60 text-sm mb-10">{d.hero.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl">
        {modes.map(({ key, path, icon: Icon, color }) => (
          <Link
            key={key}
            href={`/${lang}/game${path}`}
            className="group flex flex-col items-center gap-4 p-8 rounded-2xl bg-white border border-[#4E342E]/8 hover:shadow-md transition-shadow"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: color + '20' }}
            >
              <Icon className="w-8 h-8" style={{ color }} />
            </div>
            <span className="text-[#4E342E] font-bold text-lg">{d.game[key]}</span>
            <span className="text-[#6D4C41]/60 text-sm text-center leading-relaxed">
              {descriptions[key]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function CampaignIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  )
}

function WorldIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

function FreeplayIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L12 2" />
      <path d="M12 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L21 2" />
      <path d="M3 2h18" />
      <path d="M7.5 22h9" />
      <path d="M12 18v4" />
    </svg>
  )
}
