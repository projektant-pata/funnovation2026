'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const flags: Record<string, string> = {
  cs: '🇨🇿',
  en: '🇬🇧',
}

export default function LangSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname()
  const otherLang = lang === 'cs' ? 'en' : 'cs'
  const otherPath = '/' + otherLang + pathname.slice(`/${lang}`.length)

  return (
    <Link
      href={otherPath}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-base font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8 transition-colors"
    >
      <span suppressHydrationWarning>{flags[otherLang]}</span>
      <span>{otherLang.toUpperCase()}</span>
    </Link>
  )
}
