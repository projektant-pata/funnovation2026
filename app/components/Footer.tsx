import Link from 'next/link'
import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'

export default async function Footer({ lang }: { lang: string }) {
  const d = hasLocale(lang) ? await getDictionary(lang as Locale) : null

  const pages = d ? [
    { label: 'Objevuj',           href: `/${lang}/game` },
    { label: d.footer.dictionary, href: `/${lang}/dictionary` },
  ] : []

  const info = d ? [
    { label: d.footer.about,   href: `/${lang}/about` },
    { label: d.footer.contact, href: `/${lang}/contact` },
    { label: d.footer.gdpr,    href: `/${lang}/gdpr` },
  ] : []

  return (
    <footer className="bg-[#4E342E] text-white pt-16 pb-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">

          {/* Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="žemLOVEka" className="h-20 w-auto mb-4 brightness-0 invert" />
            <p className="text-white/50 text-base leading-relaxed">{d?.footer.tagline ?? 'Duolingo pro vaření.'}</p>
          </div>

          {/* Pages */}
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5">
              {d?.footer.pages ?? 'Stránky'}
            </div>
            <ul className="flex flex-col gap-3">
              {pages.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-base text-white/60 hover:text-[#FEDC56] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5">
              {d?.footer.info ?? 'Informace'}
            </div>
            <ul className="flex flex-col gap-3">
              {info.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-base text-white/60 hover:text-[#FEDC56] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/30">
          {d?.footer.copyright ?? '© 2026 žemLOVEka. Všechna práva vyhrazena.'}
        </div>
      </div>
    </footer>
  )
}
