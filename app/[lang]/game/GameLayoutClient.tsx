'use client'

import BottomNav from '@/app/components/game/BottomNav'
import ChefFab from '@/app/components/game/ChefFab'
import { usePathname } from 'next/navigation'

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
  chefGreeting: string
  chefInputPlaceholder: string
  chefSend: string
  chefThinking: string
  chefError: string
  chefClose: string
  chefVoiceStart: string
  chefVoiceStop: string
  chefVoiceConnecting: string
  chefVoiceUnsupported: string
  chefUseTranscript: string
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
  navbar: React.ReactNode
}

export default function GameLayoutClient({ lang, labels, children, navbar }: Props) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const isLevelRoute =
    segments[0] === lang &&
    segments[1] === 'game' &&
    ((segments.length === 4 && segments[2] === 'campaign') ||
     (segments.length === 5 && segments[2] === 'world') ||
     (segments.length === 4 && segments[2] === 'freeplay'))

  return (
    <div className="bg-[#FFF3E0] min-h-screen font-[family-name:var(--font-geist-sans)] flex flex-col">
      {!isLevelRoute && navbar}

      {/* Content with fade-in animation */}
      <main className={`flex-1 overflow-auto animate-[fadeIn_200ms_ease-out] ${isLevelRoute ? '' : 'pb-24'}`}>
        {children}
      </main>

      {!isLevelRoute && (
        <>
          <BottomNav
            lang={lang}
            labels={{
              play: labels.play,
              campaign: labels.campaign,
              world: labels.world,
              freeplay: labels.freeplay,
              reels: labels.reels,
              social: labels.social,
            }}
          />
          <ChefFab
            lang={lang as 'cs' | 'en'}
            labels={{
              chef: labels.chef,
              chefDescription: labels.chefDescription,
              chefGreeting: labels.chefGreeting,
              chefInputPlaceholder: labels.chefInputPlaceholder,
              chefSend: labels.chefSend,
              chefThinking: labels.chefThinking,
              chefError: labels.chefError,
              chefClose: labels.chefClose,
              chefVoiceStart: labels.chefVoiceStart,
              chefVoiceStop: labels.chefVoiceStop,
              chefVoiceConnecting: labels.chefVoiceConnecting,
              chefVoiceUnsupported: labels.chefVoiceUnsupported,
              chefUseTranscript: labels.chefUseTranscript,
            }}
          />
        </>
      )}
    </div>
  )
}
