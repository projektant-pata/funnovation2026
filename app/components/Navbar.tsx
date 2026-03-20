import Link from 'next/link'
import { getSession } from '@/app/lib/auth'
import LangSwitcher from './LangSwitcher'
import NavbarUserMenu from './NavbarUserMenu'
import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'

const AVATAR_COLORS = ['#E57373','#66BB6A','#5C6BC0','#FFA726','#AB47BC','#26C6DA']
function avatarColor(username: string) {
  let h = 0
  for (const c of username) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default async function Navbar({ lang }: { lang: string }) {
  const session = await getSession()
  const d = hasLocale(lang) ? await getDictionary(lang as Locale) : null

  const navLinks = d ? [
    { label: 'Objevuj',        href: `/${lang}/game` },
    { label: d.nav.dictionary, href: `/${lang}/dictionary` },
  ] : []

  const initial = session ? session.username[0].toUpperCase() : ''
  const color   = session ? avatarColor(session.username) : ''

  return (
    <nav className="sticky top-0 z-50 bg-[#FFF3E0]/90 backdrop-blur border-b border-[#4E342E]/10 px-6 py-3 flex items-center gap-8">
      <Link href={`/${lang}`} className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="žemLOVEka" className="h-10 w-auto" />
      </Link>

      <div className="flex items-center gap-1 flex-1">
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-2 rounded-lg text-base font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <LangSwitcher lang={lang} />

        {session ? (
          <NavbarUserMenu lang={lang} initial={initial} color={color} />
        ) : (
          <Link
            href={`/${lang}/login`}
            className="bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] font-bold text-sm px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            {d?.nav.login ?? 'Přihlásit se'}
          </Link>
        )}
      </div>
    </nav>
  )
}
