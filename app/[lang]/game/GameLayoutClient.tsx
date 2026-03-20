'use client'

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/app/components/game/BottomNav'
import ChefFab from '@/app/components/game/ChefFab'
import ProfilePopover from '@/app/components/game/ProfilePopover'

type Labels = {
  play: string
  campaign: string
  world: string
  freeplay: string
  social: string
  profile: string
  settings: string
  notifications: string
  chef: string
  chefDescription: string
  comingSoon: string
  badges: string
  pantry: string
  shoppingList: string
  mealPlan: string
  reels: string
  groups: string
}

type Props = {
  lang: string
  labels: Labels
  children: React.ReactNode
}

export default function GameLayoutClient({ lang, labels, children }: Props) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="bg-[#2C3E50] min-h-screen font-[family-name:var(--font-geist-sans)] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#2C3E50] border-b border-white/5 z-40">
        {/* Left: logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center"
        >
          <img
            src="/logo.png"
            alt="žemLOVEka"
            className="h-8 brightness-0 invert"
          />
        </Link>

        {/* Right: notification + profile avatar */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-[#FEDC56] hover:bg-white/10 transition-colors duration-150"
            aria-label={labels.notifications}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full bg-[#FEDC56] flex items-center justify-center hover:bg-[#f5d430] transition-colors duration-150"
              aria-label={labels.profile}
            >
              <svg className="w-5 h-5 text-[#4E342E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <ProfilePopover
              lang={lang}
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              labels={{
                profile: labels.profile,
                badges: labels.badges,
                pantry: labels.pantry,
                shoppingList: labels.shoppingList,
                mealPlan: labels.mealPlan,
                settings: labels.settings,
              }}
            />
          </div>
        </div>
      </header>

      {/* Content with fade-in animation */}
      <main className="flex-1 overflow-auto pb-24 animate-[fadeIn_200ms_ease-out]">
        {children}
      </main>

      {/* Bottom nav */}
      <BottomNav
        lang={lang}
        labels={{
          play: labels.play,
          campaign: labels.campaign,
          world: labels.world,
          freeplay: labels.freeplay,
          reels: labels.reels,
          groups: labels.groups,
        }}
      />

      {/* Chef FAB */}
      <ChefFab
        labels={{
          chef: labels.chef,
          chefDescription: labels.chefDescription,
          comingSoon: labels.comingSoon,
        }}
      />
    </div>
  )
}
