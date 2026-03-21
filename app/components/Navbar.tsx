import Link from 'next/link'
import { getSession } from '@/app/lib/auth'
import LangSwitcher from './LangSwitcher'
import NavbarUserMenu from './NavbarUserMenu'
import NavbarMobileMenu from './NavbarMobileMenu'
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

  const initial = session ? session.username[0].toUpperCase() : ''
  const color   = session ? avatarColor(session.username) : ''

  return (
    <nav className="sticky top-0 z-50 bg-[#FFF3E0]/90 backdrop-blur border-b border-[#4E342E]/10 px-6 py-3 flex items-center gap-6 relative">

      {/* Logo */}
      <Link href={`/${lang}`} className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-ctverec.jpg" alt="žemLOVEka" className="h-10 w-auto" />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        <Link
          href={`/${lang}/game`}
          className="px-3 py-2 rounded-lg text-base font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8 transition-colors"
        >
          {d?.nav.explore ?? 'Explore'}
        </Link>
        <Link
          href={`/${lang}/dictionary`}
          className="px-3 py-2 rounded-lg text-base font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8 transition-colors"
        >
          {d?.nav.dictionary ?? 'Slovník'}
        </Link>
      </div>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-3 ml-auto">
        <LangSwitcher lang={lang} />
        <div className="w-px h-5 bg-[#4E342E]/15" />
        {session ? (
          <div className="flex items-center gap-2">
            <button
              aria-label={d?.game.notifications ?? 'Notifications'}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#4E342E]/8 transition-colors text-[#6D4C41]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <NavbarUserMenu
              lang={lang}
              initial={initial}
              color={color}
              labels={{
                profile: d?.game.userMenu.profile ?? 'Profile',
                mealPlan: d?.game.userMenu.mealPlan ?? 'Meal plan',
                shoppingList: d?.game.userMenu.shoppingList ?? 'Shopping list',
                pantry: d?.game.userMenu.pantry ?? 'Pantry',
                settings: d?.game.userMenu.settings ?? 'Settings',
                logout: d?.game.userMenu.logout ?? 'Log out',
                logoutConfirm: d?.game.userMenu.logoutConfirm ?? 'Log out?',
                logoutDescription: d?.game.userMenu.logoutDescription ?? 'Are you sure you want to log out?',
                cancel: d?.game.userMenu.cancel ?? 'Cancel',
                logoutButton: d?.game.userMenu.logoutButton ?? 'Log out',
              }}
            />
          </div>
        ) : (
          <Link
            href={`/${lang}/login`}
            className="bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] font-bold text-sm px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            {d?.nav.login ?? 'Přihlásit se'}
          </Link>
        )}
      </div>

      {/* Mobile: lang + hamburger */}
      <div className="flex md:hidden items-center gap-3 ml-auto">
        <LangSwitcher lang={lang} />
        <NavbarMobileMenu
          lang={lang}
          exploreLabel={d?.nav.explore ?? 'Explore'}
          dictionaryLabel={d?.nav.dictionary ?? 'Slovník'}
          loginLabel={d?.nav.login ?? 'Přihlásit se'}
          isLoggedIn={!!session}
        />
      </div>

    </nav>
  )
}
