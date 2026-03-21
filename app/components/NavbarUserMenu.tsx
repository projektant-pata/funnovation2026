'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

type MenuLabels = {
  profile: string
  mealPlan: string
  shoppingList: string
  pantry: string
  settings: string
  logout: string
  logoutConfirm: string
  logoutDescription: string
  cancel: string
  logoutButton: string
}

export default function NavbarUserMenu({
  lang,
  initial,
  color,
  labels,
}: {
  lang: string
  initial: string
  color: string
  labels: MenuLabels
}) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
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

  async function handleLogoutConfirmed() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setConfirming(false)
    setOpen(false)
    router.push(`/${lang}/login`)
    router.refresh()
  }

  return (
    <>
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
              {labels.profile}
            </Link>
            <div className="h-px bg-[#4E342E]/8 mx-3" />
            <Link
              href={`/${lang}/game/meal-plan`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#4E342E] hover:bg-[#FFF3E0] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D4C41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
              </svg>
              {labels.mealPlan}
            </Link>
            <Link
              href={`/${lang}/game/shopping-list`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#4E342E] hover:bg-[#FFF3E0] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D4C41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {labels.shoppingList}
            </Link>
            <Link
              href={`/${lang}/game/pantry`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#4E342E] hover:bg-[#FFF3E0] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D4C41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M9 3v18" />
              </svg>
              {labels.pantry}
            </Link>
            <div className="h-px bg-[#4E342E]/8 mx-3" />
            <Link
              href={`/${lang}/game/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#4E342E] hover:bg-[#FFF3E0] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D4C41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              {labels.settings}
            </Link>
            <div className="h-px bg-[#4E342E]/8 mx-3" />
            <button
              onClick={() => { setOpen(false); setConfirming(true) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#E57373] hover:bg-[#E57373]/8 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {labels.logout}
            </button>
          </div>
        )}
      </div>

      {confirming && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4"
            onClick={() => setConfirming(false)}
          >
            <div
              className="animate-popup-in bg-white rounded-3xl shadow-2xl px-8 py-7 w-80 max-w-full flex flex-col items-center gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-[#E57373]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#E57373]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-[#4E342E]">{labels.logoutConfirm}</p>
                <p className="text-sm text-[#6D4C41]/60 mt-1">{labels.logoutDescription}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#4E342E]/15 text-sm font-semibold text-[#6D4C41] hover:bg-[#FFF3E0] transition-colors"
                >
                  {labels.cancel}
                </button>
                <button
                  onClick={handleLogoutConfirmed}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#E57373] text-white text-sm font-semibold hover:bg-[#ef5350] transition-colors"
                >
                  {labels.logoutButton}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
