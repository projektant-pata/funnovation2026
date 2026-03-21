'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

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
  const navRef = useRef<HTMLDivElement>(null)
  const base = `/${lang}/game`

  const isActive = (path: string) => {
    const full = base + path
    return pathname === full || (path !== '' && pathname.startsWith(full))
  }

  // Close on click outside
  useEffect(() => {
    if (!expanded) return
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expanded])

  const subBtnClass = (active: boolean, primary?: boolean) =>
    `flex items-center justify-center gap-2 rounded-full whitespace-nowrap shadow-lg transition-colors duration-150 ${
      primary ? 'px-5 py-3 text-base font-extrabold tracking-wide' : 'px-4 py-2.5 text-sm font-bold'
    } ${
      active
        ? 'bg-[#F5A623] text-[#4E342E]'
        : primary
          ? 'bg-[#5D4037] text-[#FEDC56] hover:bg-[#6D4C41] ring-1 ring-[#FEDC56]/30'
          : 'bg-[#4E342E] text-white hover:bg-[#5D4037]'
    }`

  const sideBtnClass = (active: boolean) =>
    `flex items-center justify-center gap-1.5 px-4 py-3 rounded-full font-bold whitespace-nowrap shadow-lg transition-colors duration-150 text-sm ${
      active
        ? 'bg-[#F5A623] text-[#4E342E]'
        : 'bg-[#4E342E] text-white hover:bg-[#5D4037]'
    }`

  const subPositions = [
    { x: 0, y: -140 },
    { x: -120, y: -90 },
    { x: 120, y: -90 },
  ]

  const subItems = [
    { href: `${base}/campaign`, path: '/campaign', label: labels.campaign, icon: CampaignIcon },
    { href: `${base}/world`, path: '/world', label: labels.world, icon: WorldIcon },
    { href: `${base}/freeplay`, path: '/freeplay', label: labels.freeplay, icon: FreeplayIcon },
  ]

  return (
    <div
      ref={navRef}
      className="fixed bottom-6 left-0 right-0 z-50 flex items-end justify-between px-4"
    >
      {/* Reels — left */}
      <div
        className="transition-all duration-300 ease-out"
        style={{
          opacity: expanded ? 0 : 1,
          transform: expanded ? 'scale(0.8)' : 'scale(1)',
          pointerEvents: expanded ? 'none' : 'auto',
        }}
      >
        <Link href={`${base}/social/reels`} className={sideBtnClass(isActive('/social/reels'))}>
          <ReelsIcon className="w-5 h-5" />
          <span className="hidden xs:inline">{labels.reels}</span>
        </Link>
      </div>

      {/* Center — Hrát + arc */}
      <div className="relative flex items-end justify-center">
        {subItems.map((item, i) => (
          <Link
            key={item.path}
            href={item.href}
            onClick={() => setExpanded(false)}
            className={`absolute left-1/2 bottom-0 ${subBtnClass(isActive(item.path), i === 0)}`}
            style={{
              transform: expanded
                ? `translate(calc(-50% + ${subPositions[i].x}px), ${subPositions[i].y}px) scale(1)`
                : 'translate(-50%, 0) scale(0)',
              opacity: expanded ? 1 : 0,
              transition: `transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${expanded ? i * 50 : (2 - i) * 30}ms, opacity 200ms ease ${expanded ? i * 50 : 0}ms`,
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#FEDC56] text-[#4E342E] font-extrabold text-lg whitespace-nowrap shadow-xl transition-all duration-300 ease-out hover:bg-[#f5d430]"
        >
          <PlayIcon className="w-5 h-5" />
          <span>{labels.play}</span>
        </button>
      </div>

      {/* Skupiny — right */}
      <div
        className="transition-all duration-300 ease-out"
        style={{
          opacity: expanded ? 0 : 1,
          transform: expanded ? 'scale(0.8)' : 'scale(1)',
          pointerEvents: expanded ? 'none' : 'auto',
        }}
      >
        <Link href={`${base}/social/groups`} className={sideBtnClass(isActive('/social/groups'))}>
          <GroupsIcon className="w-5 h-5" />
          <span className="hidden xs:inline">{labels.groups}</span>
        </Link>
      </div>
    </div>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
}

function CampaignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  )
}

function WorldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

function FreeplayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L12 2" /><path d="M12 2l2.4 14.4a2 2 0 002 1.6h0a2 2 0 002-1.6L21 2" /><path d="M3 2h18" /><path d="M7.5 22h9" /><path d="M12 18v4" />
    </svg>
  )
}

function ReelsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" /><path d="M7 2v20" /><path d="M17 2v20" /><path d="M2 12h20" /><path d="M2 7h5" /><path d="M2 17h5" /><path d="M17 7h5" /><path d="M17 17h5" />
    </svg>
  )
}

function GroupsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
