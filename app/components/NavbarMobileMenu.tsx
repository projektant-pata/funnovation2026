'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  lang: string
  exploreLabel: string
  dictionaryLabel: string
  loginLabel: string
  isLoggedIn: boolean
}

export default function NavbarMobileMenu({ lang, exploreLabel, dictionaryLabel, loginLabel, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[#4E342E]/8 transition-colors"
        onClick={() => setOpen((p) => !p)}
        aria-label="Menu"
      >
        <span className={`block w-5 h-0.5 bg-[#4E342E] transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[#4E342E] transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[#4E342E] transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#FFF3E0] border-b border-[#4E342E]/10 shadow-lg md:hidden px-6 py-4 flex flex-col gap-2">
          <Link
            href={`/${lang}/game`}
            onClick={() => setOpen(false)}
            className="py-2.5 text-base font-semibold text-[#6D4C41] border-b border-[#4E342E]/8"
          >
            {exploreLabel}
          </Link>
          <Link
            href={`/${lang}/dictionary`}
            onClick={() => setOpen(false)}
            className="py-2.5 text-base font-semibold text-[#6D4C41] border-b border-[#4E342E]/8"
          >
            {dictionaryLabel}
          </Link>
          {!isLoggedIn && (
            <Link
              href={`/${lang}/login`}
              onClick={() => setOpen(false)}
              className="mt-2 text-center bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] font-bold text-sm px-4 py-2.5 rounded-full transition-colors"
            >
              {loginLabel}
            </Link>
          )}
        </div>
      )}
    </>
  )
}
