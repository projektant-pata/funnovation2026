'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Props = {
  lang: string
  labels: {
    play: string
    campaign: string
    world: string
    freeplay: string
    reels: string
    groups: string
  }
}

export default function BottomNav({ lang, labels }: Props) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const base = `/${lang}/game`

  const isActive = (path: string) => {
    const full = base + path
    return pathname === full || (path !== '' && pathname.startsWith(full))
  }

  const subItemClass = (active: boolean) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
      active
        ? 'bg-[#F5A623] text-[#4E342E]'
        : 'bg-white/10 text-white hover:bg-white/20'
    }`

  const sideButtonClass = (active: boolean) =>
    `flex items-center justify-center gap-2 min-w-[7.5rem] px-5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${
      active
        ? 'bg-[#F5A623] text-[#4E342E]'
        : 'bg-white/10 text-white hover:bg-white/20'
    }`

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[scaleIn_200ms_ease-out]">
      <div className="relative flex items-end">
        {/* The bar — sits behind, bottom-aligned */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-[#4E342E] rounded-full shadow-2xl" />

        {/* Content layer */}
        <div className="relative flex items-end gap-2">

          {/* === LEFT: Reels (inside bar) === */}
          {!expanded && (
            <div className="h-14 flex items-center pl-3 animate-[fadeIn_200ms_ease-out]">
              <Link
                href={`${base}/social/reels`}
                className={sideButtonClass(isActive('/social/reels'))}
              >
                <ReelsIcon className="w-5 h-5" />
                <span>{labels.reels}</span>
              </Link>
            </div>
          )}

          {/* === CENTER: Hrát (own frame, protrudes up) === */}
          {expanded ? (
            <div className="bg-[#4E342E] rounded-full p-2 flex items-center gap-1.5 animate-[scaleIn_200ms_ease-out]">
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#FEDC56] text-[#4E342E] font-bold text-lg transition-colors duration-150 hover:bg-[#f5d430]"
              >
                <PlayIcon className="w-6 h-6" />
                <span>{labels.play}</span>
              </button>

              <div className="w-px h-6 bg-white/20 mx-0.5" />

              <Link href={`${base}/campaign`} className={subItemClass(isActive('/campaign'))}>
                <CampaignIcon className="w-4 h-4" />
                <span>{labels.campaign}</span>
              </Link>
              <Link href={`${base}/world`} className={subItemClass(isActive('/world'))}>
                <WorldIcon className="w-4 h-4" />
                <span>{labels.world}</span>
              </Link>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              <Link href={`${base}/freeplay`} className={subItemClass(isActive('/freeplay'))}>
                <FreeplayIcon className="w-4 h-4" />
                <span>{labels.freeplay}</span>
              </Link>

              <div className="w-px h-6 bg-white/20 mx-0.5" />

              <button
                onClick={() => setExpanded(false)}
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-150"
                aria-label="Close"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#4E342E] rounded-full p-2">
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-2 px-10 py-4.5 rounded-full bg-[#FEDC56] text-[#4E342E] font-bold text-lg transition-colors duration-150 hover:bg-[#f5d430]"
              >
                <PlayIcon className="w-6 h-6" />
                <span>{labels.play}</span>
              </button>
            </div>
          )}

          {/* === RIGHT: Groups (inside bar) === */}
          {!expanded && (
            <div className="h-14 flex items-center pr-3 animate-[fadeIn_200ms_ease-out]">
              <Link
                href={`${base}/social/groups`}
                className={sideButtonClass(isActive('/social/groups'))}
              >
                <GroupsIcon className="w-5 h-5" />
                <span>{labels.groups}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function CampaignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  )
}

function WorldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

function FreeplayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L12 2" />
      <path d="M12 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L21 2" />
      <path d="M3 2h18" />
      <path d="M7.5 22h9" />
      <path d="M12 18v4" />
    </svg>
  )
}

function ReelsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" />
      <path d="M7 2v20" />
      <path d="M17 2v20" />
      <path d="M2 12h20" />
      <path d="M2 7h5" />
      <path d="M2 17h5" />
      <path d="M17 7h5" />
      <path d="M17 17h5" />
    </svg>
  )
}

function GroupsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}
