import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, hasLocale, type Locale } from './dictionaries'
import TeamSlider from '@/app/components/TeamSlider'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'

type Props = { params: Promise<{ lang: string }> }

type Difficulty = 'Easy' | 'Medium' | 'Hard'

const sandboxRecipes: Array<{
  id: number
  flag: string
  name: string
  difficulty: Difficulty
  time: string
}> = [
  { id: 1, flag: '🇯🇵', name: 'Tamagoyaki', difficulty: 'Easy', time: '15 min' },
  { id: 2, flag: '🇮🇹', name: 'Pizza Margherita', difficulty: 'Medium', time: '40 min' },
  { id: 3, flag: '🇫🇷', name: 'Boeuf Bourguignon', difficulty: 'Hard', time: '3.5h' },
]

const difficultyColor: Record<Difficulty, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  return (
    <div className="bg-[#FFF3E0] min-h-screen font-[family-name:var(--font-geist-sans)]">

      <Navbar lang={lang} />

      {/* Hero */}
      <section className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block bg-[#FEDC56] text-[#4E342E] text-sm font-bold uppercase tracking-widest px-5 py-2 rounded-full mb-10">
          Funnovation Hack 2026
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="žemLOVEka" className="h-24 md:h-36 w-auto mb-8" />
        <p className="text-2xl md:text-3xl text-[#6D4C41] mb-4 font-semibold">{d.hero.subtitle}</p>
        <p className="text-lg text-[#6D4C41]/60 mb-12 max-w-sm">{d.hero.tagline}</p>
        <Link
          href={`/${lang}/sandbox`}
          className="bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] font-bold text-xl px-10 py-5 rounded-2xl transition-colors shadow-md"
        >
          {d.hero.cta} →
        </Link>
      </section>

      {/* Stats */}
      <section className="bg-[#4E342E] py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {(
            [
              { value: '5',   label: d.stats.regions },
              { value: '20+', label: d.stats.recipes },
              { value: '3',   label: d.stats.chapters },
              { value: '1',   label: d.stats.ai },
            ] as { value: string; label: string }[]
          ).map(({ value, label }) => (
            <div key={label}>
              <div className="text-6xl font-black text-[#FEDC56]">{value}</div>
              <div className="text-base text-white/60 mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Campaign */}
      <section className="py-28 px-6 bg-[#E57373]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-14">
          <div className="flex-1">
            <div className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
              {d.campaign.label}
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              {d.campaign.title}
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-md leading-relaxed">
              {d.campaign.description}
            </p>
            <Link
              href={`/${lang}/campaign`}
              className="inline-block bg-white text-[#E57373] font-bold text-xl px-10 py-5 rounded-2xl hover:bg-white/90 transition-colors"
            >
              {d.campaign.cta}
            </Link>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <div className="text-9xl select-none leading-none">🍳📖✨</div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-28 px-6 bg-[#4FC3F7]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-14">
          <div className="flex-1">
            <div className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
              {d.map.label}
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              {d.map.title}
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-md leading-relaxed">
              {d.map.description}
            </p>
            <Link
              href={`/${lang}/map`}
              className="inline-block bg-[#4E342E] text-white font-bold text-xl px-10 py-5 rounded-2xl hover:bg-[#3e2723] transition-colors"
            >
              {d.map.cta}
            </Link>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/map.png"
              alt="World Map Preview"
              className="rounded-2xl border-4 border-[#FEDC56] shadow-2xl w-full max-w-md object-cover"
              style={{ height: '300px' }}
            />
          </div>
        </div>
      </section>

      {/* Sandbox */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-sm font-bold uppercase tracking-widest text-[#6D4C41]/50 mb-4 text-center">
            {d.sandbox.label}
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#4E342E] mb-5 text-center leading-tight">
            {d.sandbox.title}
          </h2>
          <p className="text-xl text-[#6D4C41]/60 mb-14 text-center max-w-md mx-auto">
            {d.sandbox.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {sandboxRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl p-8 shadow-sm border border-[#4E342E]/8 hover:shadow-md transition-shadow"
              >
                <div className="text-6xl mb-6">{recipe.flag}</div>
                <h3 className="text-2xl font-bold text-[#4E342E] mb-4">{recipe.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${difficultyColor[recipe.difficulty]}`}>
                    {d.difficulty[recipe.difficulty]}
                  </span>
                  <span className="text-base text-[#6D4C41]/50">⏱ {recipe.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href={`/${lang}/sandbox`}
              className="inline-block bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] font-bold text-xl px-10 py-5 rounded-2xl transition-colors shadow-md"
            >
              {d.sandbox.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="px-6 mb-14 text-center">
          <div className="text-sm font-bold uppercase tracking-widest text-[#6D4C41]/50 mb-4">
            {d.team.label}
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#4E342E] leading-tight">
            {d.team.title}
          </h2>
        </div>
        <TeamSlider />
      </section>

      <Footer lang={lang} />

    </div>
  )
}
