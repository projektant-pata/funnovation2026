'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NavbarUserMenu({
  lang,
  initial,
  color,
}: {
  lang: string
  initial: string
  color: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setOpen(false)
    router.push(`/${lang}/login`)
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center group focus:outline-none"
        aria-label="User menu"
      >
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm ring-2 ring-[#FEDC56] group-hover:ring-[#f5d430] transition-all"
          style={{ background: color }}
        >
          {initial}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-[#4E342E]/10 overflow-hidden z-50">
          <Link
            href={`/${lang}/profile`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#4E342E] hover:bg-[#FFF3E0] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D4C41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Profil
          </Link>
          <div className="h-px bg-[#4E342E]/8 mx-3" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#E57373] hover:bg-[#E57373]/8 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Odhlásit se
          </button>
        </div>
      )}
    </div>
  )
}
